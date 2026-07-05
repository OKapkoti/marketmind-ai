import os
import sqlite3
import pandas as pd
import json
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from groq import Groq

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str, request: Request):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

DB_FILE = "campaigns.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT,
            industry TEXT,
            budget REAL,
            goal TEXT,
            name TEXT,
            roi REAL,
            ctr REAL,
            cpa REAL,
            spend REAL,
            conversions INTEGER
        )
    ''')
    conn.commit()
    conn.close()

init_db()

class Campaign(BaseModel):
    name: str
    roi: float
    ctr: float
    cpa: float
    spend: float
    conversions: int

class AnalysisRequest(BaseModel):
    company: str
    industry: str
    platforms: List[str]
    budget: float
    goal: str
    campaigns: List[Campaign]
    groq_api_key: Optional[str] = None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    groq_api_key: str
    context: dict

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Backend is running"}

@app.post("/analyze")
def analyze_campaign(req: AnalysisRequest):
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        for camp in req.campaigns:
            c.execute('''
                INSERT INTO campaigns (company, industry, budget, goal, name, roi, ctr, cpa, spend, conversions)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (req.company, req.industry, req.budget, req.goal, camp.name, camp.roi, camp.ctr, camp.cpa, camp.spend, camp.conversions))
        conn.commit()
        
        df = pd.read_sql_query('SELECT * FROM campaigns WHERE company = ?', conn, params=(req.company,))
        conn.close()
        
        current_df = pd.DataFrame([c.model_dump() for c in req.campaigns])
        
        overall_roi = current_df['roi'].mean()
        avg_ctr = current_df['ctr'].mean()
        avg_cpa = current_df['cpa'].mean()
        total_spend = current_df['spend'].sum()
        budget_utilization = (total_spend / req.budget) * 100 if req.budget > 0 else 0
        
        metrics = {
            "overallROI": round(overall_roi, 1),
            "avgCTR": round(avg_ctr, 1),
            "avgCPA": round(avg_cpa, 1),
            "budgetUtilization": round(budget_utilization, 1),
            "campaigns": current_df.to_dict(orient="records")
        }
    
        insights = []
        
        # Try to use provided groq_api_key, fallback to env var
        api_key = req.groq_api_key or os.environ.get("GROQ_API_KEY")
        if api_key:
            try:
                client = Groq(api_key=api_key)
                system_prompt = "You are a marketing analytics expert. Analyze this campaign data and return exactly 3 insights as a JSON array: {campaign_data}. Each insight must have: title, description, type (success/warning/tip). Be specific with numbers. Do not mention Claude or Anthropic."
                user_message = f"Metrics: {metrics}"
                
                response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message}
                    ],
                    max_tokens=1000,
                    response_format={"type": "json_object"}
                )
                
                result = response.choices[0].message.content
                
                # The prompt requested a JSON array, but response_format="json_object" forces a dict. Let's parse it safely.
                parsed = json.loads(result)
                if isinstance(parsed, list):
                    insights_data = parsed
                elif isinstance(parsed, dict):
                    # find the first list in the dict values
                    insights_data = next((v for v in parsed.values() if isinstance(v, list)), [])
                else:
                    insights_data = []
    
                for i in insights_data[:3]:
                    title = i.get("title", "")
                    desc = i.get("description", "")
                    insights.append(f"**{title}**: {desc}")
                    
            except Exception as e:
                print("Groq error:", e)
        
        if not insights:
            insights = [
                "Reallocate budget from lower performing ads to improve overall ROI.",
                "Monitor CPA closely on campaigns with high spend.",
                "Consider refreshing creatives to boost CTR."
            ]
            
        data_summary = {
            "total_campaigns": len(df),
            "total_spend": float(df['spend'].sum()),
            "total_conversions": int(df['conversions'].sum()),
            "avg_roi": round(float(df['roi'].mean()), 2),
            "avg_ctr": round(float(df['ctr'].mean()), 2),
            "avg_cpa": round(float(df['cpa'].mean()), 2),
            "best_performer": df.loc[df['roi'].idxmax(), 'name'],
            "worst_performer": df.loc[df['roi'].idxmin(), 'name'],
            "roi_std_dev": round(float(df['roi'].std()), 2) if len(df) > 1 else 0.0,
            "spend_concentration": round(float(df['spend'].max() / df['spend'].sum() * 100), 2) if df['spend'].sum() > 0 else 0.0
        }
            
        return {
            "metrics": metrics,
            "insights": insights,
            "data_summary": data_summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
def chat(req: ChatRequest):
    if not req.groq_api_key:
        raise HTTPException(status_code=400, detail="Groq API key is required")
    
    try:
        client = Groq(api_key=req.groq_api_key)
        
        company = req.context.get("company", "the company")
        industry = req.context.get("industry", "")
        budget = req.context.get("budget", 0)
        goal = req.context.get("goal", "")
        platforms = req.context.get("platforms", [])
        campaigns = req.context.get("campaigns", [])
        
        campaign_table = "\n".join([
            f"- {c['name']}: ROI={c['roi']}%, CTR={c['ctr']}%, CPA=${c['cpa']}, Spend=${c['spend']}, Conversions={c['conversions']}"
            for c in campaigns
        ])
        
        overall_roi = req.context.get('overallROI', 0)
        avg_ctr = req.context.get('avgCTR', 0)
        avg_cpa = req.context.get('avgCPA', 0)
        budget_utilization = req.context.get('budgetUtilization', 0)

        system_prompt = f"""You are an expert marketing analytics AI assistant. 
The user has analyzed their marketing campaigns with the following complete information:

COMPANY INFORMATION:
- Company Name: {company}
- Industry: {industry}
- Monthly Budget: ${budget}
- Campaign Goal: {goal}
- Ad Platforms Used: {', '.join(platforms)}

CAMPAIGN PERFORMANCE DATA:
{campaign_table}

CALCULATED METRICS:
- Overall ROI: {overall_roi}%
- Average CTR: {avg_ctr}%
- Average CPA: ${avg_cpa}
- Budget Utilization: {budget_utilization}%

Answer all questions using this specific data. Always refer to the company by name. Give specific actionable recommendations with exact numbers. Do not make up data that is not provided above."""

        formatted_messages = [{"role": m.role, "content": m.content} for m in req.messages]
        
        messages = [{"role": "system", "content": system_prompt}] + formatted_messages
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=1000
        )
        
        return {"role": "assistant", "content": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
