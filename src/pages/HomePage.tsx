import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bit, UserStats } from '../../types';
import BitCard from '../../components/BitCard';
import DevDebugOverlay from '../components/DevDebugOverlay';
import { deriveTracks } from '../utils/derive';



const HomePage: React.FC<{
  bits: Bit[],
  stats: UserStats,
  user?: any,
  onShare?: (bit: Bit) => void
}> = ({ bits, stats, user, onShare }) => {
  const navigate = useNavigate();

  const hasBits = Array.isArray(bits) && bits.length > 0;
  console.log('[HomePage] bits', bits.length);

  if (!hasBits) {
    return (
      <div className="space-y-8">
        <DevDebugOverlay bits={bits} label="HomePage" />
        <div>
          <h2 className="text-3xl font-black text-white mb-4">Home</h2>
          <p className="text-slate-400">Explore learning topics with progress tracking</p>
        </div>
        <div className="text-center py-12">
          <h3 className="text-xl font-bold text-white">No bits found</h3>
        </div>
      </div>
    );
  }

  const featuredBit = bits[0]; // Deterministic: first bit
  const startHereTracks = deriveTracks(bits).slice(0, 3);

  const handleSurpriseMe = () => {
    const availableBits = user && user.isPro ? bits : bits.filter(bit => bit.access === 'free');
    if (availableBits.length > 0) {
      const randomBit = availableBits[Math.floor(Math.random() * availableBits.length)];
      navigate(`/bit/${randomBit.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
    }
  };

  return (
    <div className="space-y-12">
      <DevDebugOverlay bits={bits} label="HomePage" />
      {/* Featured Bit */}
      <section>
        <div className="glass-panel rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl font-black text-white mb-4">{featuredBit.title}</h2>
              <p className="text-lg text-slate-300 mb-6">{featuredBit.summary}</p>
              <button onClick={() => navigate(`/bit/${featuredBit.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)} className="px-6 py-3 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-700 transition-colors">
                Read Now
              </button>
            </div>
          </div>
        </div>
      </section>



      {/* Continue Learning */}
      <section>
        <h2 className="text-3xl font-black text-white mb-8">Continue Learning</h2>
        <BitCard
          bit={featuredBit}
          onClick={() => navigate(`/bit/${featuredBit.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}
          onShare={onShare || (() => { })}
          onTagClick={() => { }}
          onBookmark={() => { }}
          locked={false}
          onLockedClick={() => { }}
        />
      </section>

      {/* Start Here Tracks */}
      <section>
        <h2 className="text-3xl font-black text-white mb-8">Start Here</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {startHereTracks.map((track: any) => (
            <div key={track.slug} className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-indigo-500/30 transition-colors cursor-pointer" onClick={() => navigate(`/track/${track.slug}`)}>
              <h3 className="text-xl font-bold text-white mb-2">{track.title}</h3>
              <p className="text-slate-300 text-sm mb-4">{track.description}</p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs font-medium ${track.level === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400' : track.level === 'Intermediate' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {track.level}
                </span>
                {track.isPro && <span className="text-amber-400 text-xs">PRO</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Surprise Me */}
      <section className="text-center">
        <button onClick={handleSurpriseMe} className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-bold text-lg hover:scale-105 transition-transform">
          🎲 Surprise Me
        </button>
        <p className="text-slate-400 mt-2">Discover a random free bit</p>
      </section>
    </div>
  );
};



export default HomePage;