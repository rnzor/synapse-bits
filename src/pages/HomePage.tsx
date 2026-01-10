import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bit, UserStats, AuthUser } from '../../types';
import BitCard from '../../components/BitCard';
import ProgressDashboard from '../../components/ProgressDashboard';
import { IconFire, IconZap, IconCode, IconNetwork, IconStar, IconArrowRight, IconCompass, IconZap as IconExpert } from '../../components/Icons';
import { slugify } from '../../utils';
import { deriveTracks } from '../utils/derive';

interface HomePageProps {
  bits: Bit[];
  stats: UserStats;
  user?: AuthUser | null;
  xp?: number;
  onShare?: (bit: Bit) => void;
  onBookmark?: (bitId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ bits, stats, user, xp = 0, onShare, onBookmark }) => {
  const navigate = useNavigate();

  // Data derivations
  const trendingBits = useMemo(() => [...bits].sort((a, b) => b.votes - a.votes).slice(0, 6), [bits]);
  const freshBits = useMemo(() => [...bits].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3), [bits]);
  const dailyBit = bits[0];

  const categories = useMemo(() => {
    const allTags = bits.flatMap(b => b.tags);
    const counts: Record<string, number> = {};
    allTags.forEach(t => counts[t] = (counts[t] || 0) + 1);
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [bits]);

  const handleSurpriseMe = () => {
    const availableBits = user && user.isPro ? bits : bits.filter(bit => bit.access === 'free');
    if (availableBits.length > 0) {
      const randomBit = availableBits[Math.floor(Math.random() * availableBits.length)];
      navigate(`/bit/${slugify(randomBit.title)}`);
    }
  };

  return (
    <div className="space-y-24 pb-20 animate-in fade-in duration-700">

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Ambient background effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] -z-10"></div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Neural Stream Active
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
              Neural <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Knowledge Stream
              </span>
            </h1>

            <p className="text-xl text-slate-400 font-light leading-relaxed max-w-lg">
              Master high-velocity engineering concepts with 2-minute neural bits. Production-ready insights for the modern architect.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => navigate('/explore')}
                className="px-8 py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-200 transition-all hover:scale-105 shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)]"
              >
                <IconCompass className="w-5 h-5" />
                <span>Start Exploring</span>
              </button>
              <button
                onClick={handleSurpriseMe}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold border border-white/10 flex items-center justify-center space-x-2 hover:bg-slate-800 transition-all"
              >
                <span>Surprise Me</span>
              </button>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>
            <DailyBitPreview bit={dailyBit} onClick={() => navigate(`/bit/${slugify(dailyBit.title)}`)} />
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION (BENTO) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BentoCard
          icon={<IconExpert className="w-6 h-6 text-indigo-400" />}
          title="101+ Neural Bits"
          description="A growing library of focused knowledge bits curated for senior engineers."
          gradient="from-indigo-500/10 to-transparent"
        />
        <BentoCard
          icon={<IconCode className="w-6 h-6 text-emerald-400" />}
          title="Battle-Tested Code"
          description="Real-world implementation patterns and snippets you can use today."
          gradient="from-emerald-500/10 to-transparent"
        />
        <BentoCard
          icon={<IconNetwork className="w-6 h-6 text-purple-400" />}
          title="Network Native"
          description="Deep dives into distributed systems, VPCs, and global infrastructure."
          gradient="from-purple-500/10 to-transparent"
        />
      </section>

      {/* 3. TRENDING NOW */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <IconFire className="w-6 h-6 text-orange-400" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Trending Now</h2>
          </div>
          <button onClick={() => navigate('/explore')} className="text-indigo-400 font-bold flex items-center space-x-1 hover:text-indigo-300 transition-colors group">
            <span>See all bits</span>
            <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="flex space-x-6 overflow-x-auto pb-8 snap-x scrollbar-hide -mx-4 px-4">
          {trendingBits.map(bit => (
            <div key={bit.id} className="min-w-[340px] md:min-w-[400px] snap-start">
              <BitCard
                bit={bit}
                onClick={() => navigate(`/bit/${slugify(bit.title)}`)}
                onShare={onShare || (() => { })}
                onBookmark={() => onBookmark && onBookmark(bit.id)}
                onTagClick={(tag) => navigate(`/explore?q=${tag}`)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 4. PERSONALIZED SECTION */}
      <section>
        {user ? (
          <div className="glass-panel rounded-[2rem] p-1 border border-white/5 bg-white/5 overflow-hidden">
            <ProgressDashboard user={user} localStats={stats} bits={bits} xp={xp} />
          </div>
        ) : (
          <div className="relative glass-panel rounded-3xl p-12 border border-white/10 overflow-hidden text-center space-y-6">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 -z-10"></div>
            <h2 className="text-3xl font-black text-white">Start Your Learning Journey</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Track your progress, earn XP, and unlock premium neural bits by creating a personalized account.</p>
            <button
              onClick={() => navigate('/explore')}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all"
            >
              Sign Up for Free
            </button>
          </div>
        )}
      </section>

      {/* 5. FEATURED TOPICS */}
      <section>
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <IconStar className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Popular Topics</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(cat => (
            <TopicCard key={cat} tag={cat} onClick={() => navigate(`/explore`)} />
          ))}
        </div>
      </section>

      {/* 6. FRESH BITS */}
      <section>
        <h2 className="text-3xl font-black text-white mb-8 tracking-tight">Fresh Off the Wire</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {freshBits.map(bit => (
            <BitCard
              key={bit.id}
              bit={bit}
              onClick={() => navigate(`/bit/${slugify(bit.title)}`)}
              onShare={onShare || (() => { })}
              onBookmark={() => onBookmark && onBookmark(bit.id)}
              onTagClick={(tag) => navigate(`/explore?q=${tag}`)}
            />
          ))}
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="text-center py-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-600/10 blur-[150px] -z-10"></div>
        <h2 className="text-4xl font-black text-white mb-6">Ready to expand your neural reach?</h2>
        <p className="text-slate-400 mb-12 max-w-2xl mx-auto text-lg leading-relaxed">
          Join thousands of engineers mastering the edge of knowledge. Updated daily with new high-velocity data bits.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button onClick={handleSurpriseMe} className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl shadow-indigo-500/20">
            🎲 Surprise Me
          </button>
          <button onClick={() => navigate('/explore')} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xl border border-white/10 hover:bg-slate-800 transition-all">
            Explore Library
          </button>
        </div>
      </section>

    </div>
  );
};

// --- SUB-COMPONENTS ---

const DailyBitPreview = ({ bit, onClick }: { bit: Bit, onClick: () => void }) => (
  <div
    onClick={onClick}
    className="relative glass-panel rounded-[2rem] p-8 border border-white/10 shadow-2xl overflow-hidden group cursor-pointer hover:border-indigo-500/30 transition-all duration-500"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-transparent opacity-50"></div>
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>

    <div className="relative z-10 space-y-6">
      <div className="flex items-center space-x-2">
        <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-[10px] text-amber-500 font-bold uppercase tracking-widest">Daily Highlight</span>
        <span className="text-slate-500 text-xs font-mono">#{bit.id}</span>
      </div>

      <h3 className="text-3xl font-black text-white leading-tight group-hover:text-indigo-400 transition-colors">
        {bit.title}
      </h3>

      <p className="text-slate-400 leading-relaxed font-light line-clamp-3">
        {bit.summary}
      </p>

      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono">
          <span className="flex items-center"><IconZap className="w-3 h-3 mr-1" /> {bit.difficulty}</span>
          <span className="flex items-center capitalize"><IconNetwork className="w-3 h-3 mr-1" /> {bit.language}</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-indigo-600 transition-all group-hover:scale-110">
          <IconArrowRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  </div>
);

const BentoCard = ({ icon, title, description, gradient }: { icon: any, title: string, description: string, gradient: string }) => (
  <div className={`p-8 rounded-3xl bg-slate-900/40 border border-white/5 overflow-hidden relative group hover:border-white/10 transition-all`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
    <div className="relative z-10 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-2">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

const TopicCard = ({ tag, onClick }: { tag: string, onClick: () => void }) => (
  <div
    onClick={onClick}
    className="px-6 py-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group cursor-pointer flex items-center justify-between"
  >
    <div className="flex items-center space-x-3">
      <span className="text-indigo-500/50 font-mono text-lg group-hover:text-indigo-400">#</span>
      <span className="text-slate-300 font-medium group-hover:text-white transition-colors capitalize">{tag}</span>
    </div>
    <IconArrowRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
  </div>
);

export default HomePage;