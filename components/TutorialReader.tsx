
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tutorial, AuthUser } from '../types';
import { IconArrowRight, IconTime, IconLock, IconCheck, IconShare, IconBook } from './Icons';
import { useNavigate } from 'react-router-dom';
import SimpleSyntaxHighlighter from './SimpleSyntaxHighlighter';

interface TutorialReaderProps {
  tutorial: Tutorial;
  user: AuthUser | null;
  onLoginRequest: () => void;
}

const TutorialReader: React.FC<TutorialReaderProps> = ({ tutorial, user, onLoginRequest }) => {
  const navigate = useNavigate();
  const [readProgress, setReadProgress] = useState(0);

  const isLocked = tutorial.isPremium && !user;

  // Scroll Progress Tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLocked) {
      return (
          <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4">
              <Helmet>
                 <title>Locked Content | {tutorial.title}</title>
              </Helmet>
              <div className="max-w-2xl w-full bg-[#0B101B] border border-white/5 rounded-3xl p-12 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 to-transparent"></div>
                  
                  <div className="relative z-10 flex flex-col items-center">
                      <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
                          <IconLock className="w-10 h-10 text-amber-500" />
                      </div>
                      <h1 className="text-3xl font-black text-white mb-4">Premium Tutorial</h1>
                      <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                          This deep-dive lesson on <span className="text-white font-bold">{tutorial.title}</span> is reserved for community members. Initialize your session to access it.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-left max-w-xs mx-auto mb-8 text-sm text-slate-400">
                          <div className="flex items-center gap-2"><IconCheck className="w-4 h-4 text-emerald-500" /> In-depth Guide</div>
                          <div className="flex items-center gap-2"><IconCheck className="w-4 h-4 text-emerald-500" /> Code Snippets</div>
                          <div className="flex items-center gap-2"><IconCheck className="w-4 h-4 text-emerald-500" /> Best Practices</div>
                          <div className="flex items-center gap-2"><IconCheck className="w-4 h-4 text-emerald-500" /> Security Audit</div>
                      </div>

                      <div className="flex gap-4">
                          <button onClick={() => navigate('/tutorials')} className="px-6 py-3 text-slate-400 hover:text-white font-bold">
                              Go Back
                          </button>
                          <button onClick={onLoginRequest} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105">
                              Login to Unlock
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // Parse markdown-like content for MVP rendering
  const renderContent = (content: string) => {
      const parts = content.split(/(```[\s\S]*?```)/g);
      return parts.map((part, index) => {
          if (part.startsWith('```')) {
              // Code Block
              const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
              if (!match) return null;
              const lang = match[1] || 'text';
              const code = match[2];
              return (
                  <div key={index} className="my-8 rounded-xl overflow-hidden shadow-2xl border border-white/10">
                      <div className="bg-white/5 px-4 py-2 text-xs font-mono text-slate-400 border-b border-white/5 flex justify-between">
                          <span>{lang}</span>
                          <span>Terminal</span>
                      </div>
                      <SimpleSyntaxHighlighter code={code} language={lang} className="text-sm" />
                  </div>
              );
          } else {
              // Text Content
              return (
                  <div key={index} className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed space-y-6">
                      {part.split('\n\n').map((p, i) => {
                          if (p.startsWith('# ')) return <h1 key={i} className="text-4xl font-black text-white mt-12 mb-6">{p.replace('# ', '')}</h1>;
                          if (p.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4 flex items-center gap-2"><span className="text-indigo-500">#</span> {p.replace('## ', '')}</h2>;
                          if (p.startsWith('### ')) return <h3 key={i} className="text-xl font-bold text-white mt-8 mb-3">{p.replace('### ', '')}</h3>;
                          if (p.startsWith('- ')) return <ul key={i} className="list-disc pl-6 space-y-2">{p.split('\n').map(li => <li key={li}>{li.replace('- ', '')}</li>)}</ul>;
                          if (p.trim().length > 0) return <p key={i}>{p}</p>;
                          return null;
                      })}
                  </div>
              );
          }
      });
  };

  return (
    <div className="min-h-screen bg-[#02040a] pb-24">
        <Helmet>
            <title>{tutorial.title} | SYNAPSE TUTORIALS</title>
        </Helmet>
        
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-1 bg-slate-900 z-50">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-100 ease-out" style={{ width: `${readProgress}%` }}></div>
        </div>

        {/* Hero Section */}
        <div className={`relative w-full h-[50vh] flex items-center justify-center ${tutorial.coverGradient}`}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-[#02040a]/50 to-transparent"></div>
            
            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
                    <IconBook className="w-4 h-4 text-indigo-300" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">{tutorial.level} Tutorial</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
                    {tutorial.title}
                </h1>
                <p className="text-xl text-slate-200 font-light max-w-2xl mx-auto mb-8">
                    {tutorial.description}
                </p>
                <div className="flex items-center justify-center space-x-8 text-sm font-mono text-slate-400">
                    <div className="flex items-center space-x-2">
                        <IconTime className="w-4 h-4" />
                        <span>{tutorial.duration} read</span>
                    </div>
                    <div>
                        By <span className="text-white font-bold">{tutorial.author}</span>
                    </div>
                    <div>
                        {new Date(tutorial.timestamp).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>

        {/* Content Container */}
        <div className="max-w-3xl mx-auto px-6 -mt-20 relative z-20">
            <div className="bg-[#0B101B] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
                {renderContent(tutorial.content)}
                
                {/* Author Footer */}
                <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between">
                    <div>
                        <h4 className="text-white font-bold mb-1">Written by {tutorial.author}</h4>
                        <p className="text-slate-500 text-sm">Lead Security Architect @ Synapse</p>
                    </div>
                    <div className="flex gap-2">
                         <button className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                             <IconShare className="w-5 h-5" />
                         </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Back Button */}
        <div className="fixed bottom-8 left-8 z-40">
             <button 
                onClick={() => navigate('/tutorials')}
                className="flex items-center space-x-2 px-6 py-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/10 transition-colors"
             >
                 <IconArrowRight className="w-4 h-4 rotate-180" />
                 <span className="font-bold text-sm">Back to Feed</span>
             </button>
        </div>
    </div>
  );
};

export default TutorialReader;
