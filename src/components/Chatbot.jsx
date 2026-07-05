import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Key } from 'lucide-react';
import { clsx } from 'clsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Chatbot = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('groq_api_key') || '';
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const getInitialMessage = () => {
    const companyName = context?.company || "your organization";
    const campaignsCount = context?.campaigns?.length || 0;
    const sourcesCount = context?.platforms?.length || 1;
    
    return `I have processed ${companyName}'s campaign dataset. ${campaignsCount} records analyzed across ${sourcesCount} data sources. What would you like to investigate?`;
  };

  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // Only set the initial message when context is available and messages are empty
    if (context && messages.length === 0) {
      setMessages([{ role: 'assistant', content: getInitialMessage() }]);
    }
  }, [context]);

  const getSuggestedQuestions = () => {
    return [
      "What does the data show overall?",
      "Which metric needs most improvement?",
      "Where should budget be reallocated?",
      "Explain the anomalies detected"
    ];
  };

  const suggestedQuestions = getSuggestedQuestions();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleApiKeyChange = (e) => {
    const key = e.target.value;
    setApiKey(key);
    localStorage.setItem('groq_api_key', key);
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groq_api_key: apiKey,
          context: {
            company: context?.company || '',
            industry: context?.industry || '',
            budget: context?.budget || 0,
            goal: context?.goal || '',
            platforms: context?.platforms || [],
            campaigns: context?.campaigns || [],
            overallROI: context?.overallROI || 0,
            avgCTR: context?.avgCTR || 0,
            avgCPA: context?.avgCPA || 0,
            budgetUtilization: context?.budgetUtilization || 0
          },
          messages: newMessages
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.detail || data.error?.message || 'Failed to fetch response'}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't reach the server. Make sure you entered a valid API key and have internet access." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={clsx(
          "fixed bottom-6 right-6 w-14 h-14 bg-brand-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-40",
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <div 
        className={clsx(
          "fixed top-0 right-0 h-full w-full md:w-[400px] glass-card rounded-none border-y-0 border-r-0 z-50 flex flex-col transition-transform duration-300 ease-out shadow-2xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-dark-surface">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <h3 className="font-bold">AI Analytics Assistant</h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 border-b border-slate-200 dark:border-white/10 bg-amber-50 dark:bg-amber-900/10 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Groq API Key</span>
          </div>
          <input 
            type="password" 
            placeholder="Enter your Groq API Key"
            value={apiKey}
            onChange={handleApiKeyChange}
            className="bg-transparent border-none focus:outline-none text-xs w-full text-slate-800 dark:text-slate-200 placeholder-slate-500 mt-1 pl-6"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={clsx(
                "max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-brand-primary text-white self-end rounded-br-sm" 
                  : "bg-slate-100 dark:bg-white/10 self-start rounded-bl-sm"
              )}
            >
              {msg.content}
            </div>
          ))}
          
          {isLoading && (
            <div className="bg-slate-100 dark:bg-white/10 self-start rounded-2xl rounded-bl-sm p-4 w-16">
              <div className="flex gap-1 justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="px-4 py-2 flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button 
                key={i}
                onClick={() => handleSend(q)}
                className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-full px-3 py-1.5 transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-dark-surface">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center gap-2"
          >
            <input 
              type="text" 
              placeholder="Ask a data question — e.g. Which campaign has the best ROI efficiency?" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 input-field py-2 rounded-full"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600 transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
