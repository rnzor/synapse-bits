
import React, { useState, useRef, useEffect } from 'react';
import { IconMessage, IconSend, IconX, IconSparkles, IconChevronDown, IconLink } from './Icons';
import { getChatResponse } from '../services/geminiService';
import SimpleSyntaxHighlighter from './SimpleSyntaxHighlighter';

interface ChatDrawerProps {
  context?: string; // Optional context (e.g. current bit title)
}

const ChatDrawer: React.FC<ChatDrawerProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string, sources?: {uri: string, title: string}[]}[]>([
    {role: 'ai', text: "Hello! I'm Vibe Assistant. Need help with code or just want to chat about tech?"}
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
    setIsTyping(true);

    try {
      // Pass the current context (Bit Title) to the AI
      const aiResponse = await getChatResponse(userMsg, context);
      
      setIsTyping(false);
      setMessages(prev => [...prev, {
          role: 'ai', 
          text: aiResponse.text,
          sources: aiResponse.sources
      }]);
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
          role: 'ai', 
          text: "Connection interrupted. My neural link is experiencing interference. Please try again."
      }]);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={toggleOpen}
        className={`fixed bottom-6 right-6 z-[60] p-4 rounded-full bg-indigo-600 text-white shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)] hover:bg-indigo-500 hover:scale-110 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <IconMessage className="w-6 h-6" />
      </button>

      {/* Drawer */}
      <div 
        className={`fixed bottom-0 right-0 z-[60] w-full md:w-96 bg-[#030712]/95 backdrop-blur-xl border-l border-t border-white/10 shadow-2xl transition-transform duration-500 ease-in-out flex flex-col h-[600px] max-h-[100vh] rounded-tl-2xl ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-indigo-600/10 rounded-tl-2xl cursor-pointer" onClick={toggleOpen}>
            <div className="flex items-center space-x-2">
                <IconSparkles className="w-5 h-5 text-indigo-400" />
                <div className="flex flex-col">
                    <span className="font-bold text-white leading-none">Vibe Assistant</span>
                    {context && <span className="text-[10px] text-indigo-300 leading-none mt-1 truncate max-w-[200px]">Viewing: {context}</span>}
                </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); toggleOpen(); }} className="text-slate-400 hover:text-white">
                <IconChevronDown className="w-6 h-6" />
            </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div 
                        className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                            m.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-slate-800/80 text-slate-200 rounded-bl-none border border-white/5'
                        }`}
                    >
                        {m.text.includes('```') ? (
                           <SimpleSyntaxHighlighter code={m.text.replace(/```\w*\n?|```/g, '')} className="text-xs" />
                        ) : (
                           m.text
                        )}
                    </div>
                    {/* Source citations */}
                    {m.sources && m.sources.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2 max-w-[85%]">
                            {m.sources.map((src, idx) => (
                                <a 
                                    key={idx}
                                    href={src.uri}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-900 border border-white/10 text-[10px] text-indigo-300 hover:text-indigo-200 hover:border-indigo-500/50 transition-colors"
                                >
                                    <IconLink className="w-3 h-3" />
                                    <span className="truncate max-w-[150px]">{src.title || 'Source'}</span>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-slate-800/80 rounded-2xl rounded-bl-none p-4 flex space-x-1 items-center border border-white/5">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                </div>
            )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="relative">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={context ? "Ask about this topic..." : "Ask about code..."}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <IconSend className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>
    </>
  );
};

export default ChatDrawer;
