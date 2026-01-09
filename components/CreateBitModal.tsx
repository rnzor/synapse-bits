
import React, { useState, useEffect } from 'react';
import { IconSparkles, IconCpu, IconZap, IconRefresh, IconPen, IconCode, IconNetwork } from './Icons';
import { generateBitContent, generateRandomTopic } from '../services/geminiService';
import { Bit } from '../types';
import { ToastType } from './Toast';
import { generateId } from '../utils';

interface CreateBitModalProps {
  onClose: () => void;
  onSave: (bit: Bit) => void;
  showToast: (msg: string, type: ToastType) => void;
}

const LANGUAGES = [
    'javascript', 'typescript', 'python', 'go', 'rust', 'java', 'c++', 'c#', 'sql', 'html', 'css', 'bash', 'json', 'yaml', 'markdown', 'text', 'network'
];

const CreateBitModal: React.FC<CreateBitModalProps> = ({ onClose, onSave, showToast }) => {
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<'idle' | 'generating' | 'review'>('idle');
  const [generatedBit, setGeneratedBit] = useState<Partial<Bit> | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  // Handle Escape Key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Sync tags input when bit is generated/updated
  useEffect(() => {
      if (generatedBit?.tags) {
          setTagsInput(generatedBit.tags.join(', '));
      } else {
          setTagsInput('');
      }
  }, [generatedBit?.tags]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setStatus('generating');
    try {
      const result = await generateBitContent(topic);
      setGeneratedBit(result);
      setStatus('review');
    } catch (error) {
      console.error(error);
      setStatus('idle');
      showToast("Failed to generate content. Please try again.", 'error');
    }
  };

  const handleManualStart = () => {
      setGeneratedBit({
          title: '',
          summary: '',
          content: '',
          codeSnippet: '',
          language: 'javascript', // Default
          difficulty: 'Beginner',
          tags: []
      });
      setStatus('review');
  };

  const handleRandomTopic = async () => {
    setIsRandomizing(true);
    try {
        const newTopic = await generateRandomTopic();
        setTopic(newTopic);
    } catch (e) {
        setTopic("Advanced CSS Grid Layouts");
    } finally {
        setIsRandomizing(false);
    }
  };

  const handlePublish = () => {
    if (!generatedBit?.title || !generatedBit?.summary) {
        showToast("Title and Summary are required.", "error");
        return;
    }

    const newBit: Bit = {
      id: generateId(),
      title: generatedBit.title,
      summary: generatedBit.summary,
      content: generatedBit.content || '',
      codeSnippet: generatedBit.codeSnippet,
      language: generatedBit.language || 'text',
      tags: tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0),
      difficulty: (generatedBit.difficulty as any) || 'Beginner',
      author: 'Neural Architect', // Or user name if we had it in context
      timestamp: Date.now(),
      votes: 0
    };
    onSave(newBit);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl glass-modal rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                {status === 'review' ? <IconPen className="w-5 h-5" /> : <IconSparkles className="w-5 h-5" />}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
                {status === 'review' ? 'Editor Protocol' : 'Create Bit'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
          
          {/* Initial Selection Screen */}
          {status === 'idle' && (
            <div className="py-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
              
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  Choose Creation Method
                </h3>
                <p className="text-slate-400">Select a protocol to initialize new knowledge bit.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* AI Option */}
                  <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 transition-all group">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <IconSparkles className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h4 className="text-lg font-bold text-white">Neural Synthesis</h4>
                      <p className="text-sm text-slate-400 h-10">AI generates a structured tutorial from a single topic.</p>
                      
                      <div className="relative">
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="e.g. 'Redux Toolkit'"
                          className="w-full bg-black/30 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all mb-2"
                          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <button 
                            onClick={handleRandomTopic}
                            className="absolute right-2 top-2 text-indigo-400 hover:text-white transition-colors"
                            title="Random Topic"
                        >
                            <IconRefresh className={`w-4 h-4 ${isRandomizing ? 'animate-spin' : ''}`} />
                        </button>
                      </div>

                      <button 
                          onClick={handleGenerate}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2"
                      >
                          <IconZap className="w-4 h-4" />
                          <span>Generate</span>
                      </button>
                  </div>

                  {/* Manual Option */}
                  <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900 border border-white/10 hover:border-white/20 transition-all group flex flex-col">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <IconPen className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h4 className="text-lg font-bold text-white">Manual Protocol</h4>
                      <p className="text-sm text-slate-400 flex-1">Write your own tutorial from scratch using the editor.</p>
                      
                      <button 
                          onClick={handleManualStart}
                          className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm border border-white/10 transition-all mt-auto"
                      >
                          Open Editor
                      </button>
                  </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {status === 'generating' && (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-500/30 animate-[spin_3s_linear_infinite]"></div>
                <div className="absolute inset-0 w-20 h-20 rounded-full border-t-4 border-indigo-500 animate-[spin_1s_linear_infinite]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <IconCpu className="text-indigo-400 w-8 h-8 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">Synthesizing Knowledge...</p>
                <p className="text-sm text-slate-400 mt-2">Querying Neural Network for "{topic}"</p>
              </div>
            </div>
          )}

          {/* Editor / Review State */}
          {status === 'review' && generatedBit && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               
               {/* Title */}
               <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Title</label>
                   <input 
                    type="text" 
                    value={generatedBit.title} 
                    onChange={(e) => setGeneratedBit({...generatedBit, title: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white text-lg font-bold focus:border-indigo-500 outline-none"
                    placeholder="Bit Title"
                   />
               </div>

               {/* Summary */}
               <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Summary</label>
                   <textarea 
                    rows={2}
                    value={generatedBit.summary} 
                    onChange={(e) => setGeneratedBit({...generatedBit, summary: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 text-sm focus:border-indigo-500 outline-none resize-none"
                    placeholder="Brief description (1-2 sentences)"
                   />
               </div>

               {/* Metadata Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Language / Type</label>
                     <div className="relative">
                         <select 
                            value={generatedBit.language} 
                            onChange={(e) => setGeneratedBit({...generatedBit, language: e.target.value})}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-300 appearance-none focus:border-indigo-500 outline-none"
                         >
                             {LANGUAGES.map(lang => (
                                 <option key={lang} value={lang}>{lang}</option>
                             ))}
                         </select>
                         <div className="absolute right-3 top-2.5 pointer-events-none text-slate-500">▼</div>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Difficulty</label>
                     <div className="relative">
                         <select 
                            value={generatedBit.difficulty} 
                            onChange={(e) => setGeneratedBit({...generatedBit, difficulty: e.target.value as any})}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-300 appearance-none focus:border-indigo-500 outline-none"
                         >
                             <option value="Beginner">Beginner</option>
                             <option value="Intermediate">Intermediate</option>
                             <option value="Advanced">Advanced</option>
                         </select>
                         <div className="absolute right-3 top-2.5 pointer-events-none text-slate-500">▼</div>
                     </div>
                  </div>
               </div>

               {/* Tags */}
               <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tags (Comma Separated)</label>
                   <input 
                    type="text" 
                    value={tagsInput} 
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-300 text-sm focus:border-indigo-500 outline-none"
                    placeholder="react, frontend, hooks"
                   />
               </div>

               {/* Code Snippet */}
               <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex justify-between">
                       <span>Code Snippet</span>
                       <span className="text-xs normal-case opacity-50">Optional</span>
                   </label>
                   <div className="relative">
                        <textarea 
                            rows={6}
                            value={generatedBit.codeSnippet} 
                            onChange={(e) => setGeneratedBit({...generatedBit, codeSnippet: e.target.value})}
                            className="w-full bg-[#0d1117] border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono text-emerald-400 focus:border-indigo-500 outline-none"
                            placeholder="// Paste your code example here..."
                        />
                        <div className="absolute top-2 right-2 text-slate-600">
                            <IconCode className="w-4 h-4" />
                        </div>
                   </div>
               </div>

               {/* Content / Explanation */}
               <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Detailed Content</label>
                   <textarea 
                    rows={8}
                    value={generatedBit.content} 
                    onChange={(e) => setGeneratedBit({...generatedBit, content: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 text-sm focus:border-indigo-500 outline-none"
                    placeholder="Explain the concept in detail..."
                   />
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {status === 'review' && (
            <div className="p-6 border-t border-white/10 bg-slate-900/80 flex justify-between items-center backdrop-blur-md">
                <button onClick={() => setStatus('idle')} className="text-sm text-slate-400 hover:text-white transition-colors">
                    ← Back to Selection
                </button>
                <button 
                    onClick={handlePublish}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 transition-all flex items-center space-x-2"
                >
                    <span>Publish Bit</span>
                    <IconNetwork className="w-4 h-4" />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default CreateBitModal;
