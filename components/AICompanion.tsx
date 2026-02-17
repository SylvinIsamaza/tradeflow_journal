
import React, { useState, useRef, useEffect } from 'react';
import { Trade, Message } from '../types';
import { chatWithAI } from '../services/geminiService';

interface AICompanionProps {
  isOpen: boolean;
  onClose: () => void;
  trades: Trade[];
}

const AICompanion: React.FC<AICompanionProps> = ({ isOpen, onClose, trades }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm Zella AI, your performance coach. How can I help you improve your edge today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleOpenSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setErrorState(null);
      setMessages(prev => [...prev, { role: 'model', text: "API key updated! I'm ready to help again. What were we discussing?" }]);
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isTyping) return;
    
    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setErrorState(null);

    const { text: responseText, error } = await chatWithAI([...messages, userMsg], trades);
    
    if (error) {
      setErrorState(error.errorType);
      const errorMsg = error.errorType === 'QUOTA_EXCEEDED' 
        ? "My shared quota is exhausted. You can continue our session by using your own paid API key."
        : "I'm having a bit of trouble connecting to my brain right now. Please try again.";
      
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
    } else {
      setMessages(prev => [...prev, { role: 'model', text: responseText || "I couldn't generate a response." }]);
    }
    setIsTyping(false);
  };

  const commands = [
    { label: "Performance Today", prompt: "How was my performance today based on my recent trades?" },
    { label: "Get Insights", prompt: "Can you give me 3 key insights into my trading psychology right now?" },
    { label: "Check Risk", prompt: "Analyze my risk management in the last 5 trades." }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-[70] flex flex-col animate-in fade-in slide-in-from-right duration-300 border-l border-slate-200">
      <div className="p-6 bg-[#1a1f37] text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#5e5ce6] flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h2 className="font-black tracking-tight">ZELLA AI</h2>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Coach</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
              m.role === 'user' 
              ? 'bg-[#5e5ce6] text-white rounded-tr-none' 
              : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
            }`}>
              {m.text}
              
              {m.role === 'model' && i === messages.length - 1 && errorState === 'QUOTA_EXCEEDED' && (
                <button 
                  onClick={handleOpenSelectKey}
                  className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Select Personal API Key
                </button>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-white">
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
           {commands.map(cmd => (
             <button 
               key={cmd.label}
               onClick={() => handleSend(cmd.prompt)}
               className="whitespace-nowrap px-4 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-indigo-100"
             >
               {cmd.label}
             </button>
           ))}
        </div>
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about your trading..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all pr-14"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="absolute right-3 top-3 w-10 h-10 bg-[#5e5ce6] text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICompanion;
