
import React from 'react';
import { Link } from 'react-router-dom';
import { Tutorial } from '../types';
import { IconTime, IconLock, IconArrowRight, IconBook } from './Icons';

interface TutorialCardProps {
  tutorial: Tutorial;
  isLocked: boolean;
}

const TutorialCard: React.FC<TutorialCardProps> = ({ tutorial, isLocked }) => {
  return (
    <Link 
        to={`/tutorial/${tutorial.slug}`}
        className="group relative flex flex-col md:flex-row bg-[#0B101B] border border-white/5 rounded-3xl overflow-hidden hover:border-indigo-500/30 transition-all duration-500 hover:shadow-[0_0_30px_-10px_rgba(99,102,241,0.2)]"
    >
        {/* Cover Image/Gradient Section */}
        <div className={`h-48 md:h-auto md:w-1/3 relative overflow-hidden ${tutorial.coverGradient}`}>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
            
            {/* Locked Overlay */}
            {isLocked && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="bg-black/50 p-3 rounded-full border border-white/10">
                        <IconLock className="w-6 h-6 text-white" />
                    </div>
                </div>
            )}
            
            <div className="absolute bottom-4 left-4 z-10">
                <div className="flex items-center space-x-2 text-white/90 text-xs font-bold uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <IconBook className="w-3 h-3" />
                    <span>Deep Dive</span>
                </div>
            </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-8 flex flex-col relative">
             {/* Premium Badge */}
             {tutorial.isPremium && (
                 <div className="absolute top-4 right-4 flex items-center space-x-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                     <IconLock className="w-3 h-3" />
                     <span>Premium</span>
                 </div>
             )}

             <div className="flex items-center space-x-3 mb-3 text-xs text-slate-500 font-mono">
                 <div className="flex items-center space-x-1">
                     <IconTime className="w-3 h-3" />
                     <span>{tutorial.duration}</span>
                 </div>
                 <span>•</span>
                 <span className={`${
                     tutorial.level === 'Beginner' ? 'text-emerald-400' :
                     tutorial.level === 'Intermediate' ? 'text-amber-400' :
                     'text-rose-400'
                 }`}>{tutorial.level}</span>
             </div>

             <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                 {tutorial.title}
             </h3>
             
             <p className="text-slate-400 mb-6 line-clamp-2 leading-relaxed font-light">
                 {tutorial.description}
             </p>

             <div className="mt-auto flex items-center justify-between">
                 <div className="flex gap-2">
                     {tutorial.tags.map(tag => (
                         <span key={tag} className="text-xs text-slate-500">#{tag}</span>
                     ))}
                 </div>
                 
                 <div className="flex items-center space-x-2 text-indigo-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                     <span>{isLocked ? 'Unlock Access' : 'Start Lesson'}</span>
                     <IconArrowRight className="w-4 h-4" />
                 </div>
             </div>
        </div>
    </Link>
  );
};

export default TutorialCard;
