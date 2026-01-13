
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Bit, UserStats } from '../types';
import { IconX, IconShare, IconBookmark, IconCode, IconNetwork, IconHeart, IconArrowLeft, IconArrowRight } from './Icons';
import BitCard from './BitCard';
import SimpleSyntaxHighlighter from './SimpleSyntaxHighlighter';
import { sanitizeHtml } from '../utils';

// Progress utility functions
function isCompleted(stats: UserStats, bitId: string): boolean {
  return stats.completedBits.includes(bitId);
}

function getTopicProgress(bits: Bit[], stats: UserStats, topicSlug: string): { completed: number, total: number } {
  const topicBits = bits.filter(bit => bit.topicSlug === topicSlug);
  const completed = topicBits.filter(bit => isCompleted(stats, bit.id)).length;
  const total = topicBits.length;
  return { completed, total };
}

interface BitDetailModalProps {
  bit: Bit;
  allBits: Bit[];
  onClose: () => void;
  onShare?: (bit: Bit) => void;
  onBookmark?: (bit: Bit) => void;
  showToast?: (msg: string, type: any) => void;
  onAddXp?: (amount: number) => void;
  onQuizWin?: () => void;
  onComplete?: (bit: Bit, timeSpent: number) => void;
  onMarkCompleted?: (bitId: string) => void;
  user?: any;
  isBookmarked?: boolean;
  onVote?: (id: string) => void;
  stats?: UserStats;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  totalCount?: number;
  contextLabel?: string;
}

const BitDetailModal: React.FC<BitDetailModalProps> = ({
    bit,
    allBits,
    onClose,
    onShare,
    onBookmark,
    isBookmarked = false,
    onVote,
    onMarkCompleted: _onMarkCompleted,
    stats,
    onNext,
    onPrevious,
    currentIndex,
    totalCount,
    contextLabel
}) => {

  // Logic to find related bits
  const relatedBits = allBits
    .filter(b => b.id !== bit.id) // Exclude current
    .filter(b => b.tags.some(tag => bit.tags.includes(tag))) // Must share at least one tag
    .slice(0, 3); // Take top 3

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": bit.title,
    "description": bit.summary,
    "author": {
        "@type": "Person",
        "name": bit.author
    },
    "datePublished": new Date(bit.timestamp).toISOString()
  };

  return (
    <article className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Helmet>
        <title>{`${bit.title} | SYNAPSE BITS`}</title>
        <meta name="description" content={bit.summary} />
        <meta name="keywords" content={bit.tags.join(', ')} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl glass-modal rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 bg-[#0B101B]">
         
         {/* Header */}
         <div className="flex justify-between items-start p-6 border-b border-white/10">
             <div>
                <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                        bit.difficulty === 'Beginner' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                        bit.difficulty === 'Intermediate' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                        'text-rose-400 bg-rose-500/10 border-rose-500/20'
                    }`}>
                        {bit.difficulty}
                    </span>
                    <div className="flex items-center space-x-1 text-slate-400 text-xs">
                         {bit.language === 'network' ? <IconNetwork className="w-3 h-3"/> : <IconCode className="w-3 h-3"/>}
                         <span>{bit.language}</span>
                    </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{bit.title}</h1>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                <IconX className="w-6 h-6" />
             </button>
         </div>

         {/* Content */}
         <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <section className="prose prose-invert max-w-none">
                <p className="text-lg text-slate-300 leading-relaxed">{bit.summary}</p>
                {bit.topicSlug && stats && (
                    <div className="my-4 p-3 bg-indigo-900/20 rounded-lg border border-indigo-500/20">
                        <p className="text-sm text-indigo-300">
                            Topic progress: {getTopicProgress(allBits, stats, bit.topicSlug).completed}/{getTopicProgress(allBits, stats, bit.topicSlug).total} bits learned
                        </p>
                    </div>
                )}
                <div
                    className="my-6 p-4 bg-slate-900/50 rounded-xl border border-white/5 text-slate-300 whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(bit.content.replace(/\n/g, '<br />')) }}
                />
            </section>

            {bit.codeSnippet && (
                <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Code Example</h3>
                    <SimpleSyntaxHighlighter code={bit.codeSnippet} language={bit.language} className="text-sm" />
                </section>
            )}

            {relatedBits.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Related Bits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {relatedBits.map(rb => (
                            <div key={rb.id} className="h-64">
                                <BitCard 
                                    bit={rb} 
                                    onClick={() => {}} // In a real app, this would navigate
                                    onShare={onShare || (() => {})} 
                                    onTagClick={() => {}} 
                                    onBookmark={onBookmark}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}
         </div>

         {/* Footer */}
         <div className="p-6 border-t border-white/10 bg-black/20 flex justify-between items-center">
             <div className="flex gap-2">
                 {bit.tags.map(tag => (
                     <span key={tag} className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">#{tag}</span>
                 ))}
             </div>
             <div className="flex gap-3 items-center">
                 {onVote && (
                    <button 
                        onClick={() => onVote(bit.id)} 
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
                        title="Upvote"
                    >
                        <IconHeart className="w-5 h-5" />
                        <span className="text-sm font-bold">{bit.votes}</span>
                    </button>
                 )}
                 <button 
                    onClick={() => onBookmark && onBookmark(bit)} 
                    className={`p-2 transition-colors ${isBookmarked ? 'text-amber-400' : 'text-slate-400 hover:text-white'}`} 
                    title={isBookmarked ? "Saved" : "Save for later"}
                 >
                     <IconBookmark className="w-5 h-5" fill={isBookmarked} />
                 </button>
          <button onClick={() => onShare && onShare(bit)} className="p-2 text-slate-400 hover:text-white transition-colors" title="Share">
                     <IconShare className="w-5 h-5" />
                 </button>
             </div>
         </div>

         {/* Navigation Bar */}
         {(onNext || onPrevious) && (
            <div className="sticky bottom-0 z-30 bg-black/80 backdrop-blur-2xl border-t border-white/10 p-4 animate-in slide-in-from-bottom-full duration-300">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button
                        onClick={onPrevious}
                        disabled={!onPrevious}
                        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
                    >
                        <IconArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold tracking-tight">Previous</span>
                    </button>

                    {contextLabel && currentIndex !== undefined && totalCount !== undefined && (
                        <div className="hidden sm:flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">{contextLabel}</span>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-white">{currentIndex + 1}</span>
                                <span className="text-xs text-slate-600">/</span>
                                <span className="text-sm font-medium text-slate-400">{totalCount}</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onNext}
                        disabled={!onNext}
                        className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-20 disabled:cursor-not-allowed group"
                    >
                        <span className="text-sm tracking-tight">Next</span>
                        <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
         )}
      </div>
    </article>

  );
};

export default BitDetailModal;
