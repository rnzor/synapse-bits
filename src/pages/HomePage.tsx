import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bit, UserStats } from '../../types';
import BitCard from '../../components/BitCard';

// Inline data to avoid import issues
const TOPICS = [
  { slug: 'networking', label: 'Networking', description: 'Network fundamentals, protocols, and infrastructure', iconKey: 'network', order: 1 },
  { slug: 'system-design', label: 'System Design', description: 'Designing scalable and distributed systems', iconKey: 'cpu', order: 2 },
  { slug: 'database', label: 'Database', description: 'Database design, optimization, and querying', iconKey: 'database', order: 3 },
  { slug: 'programming', label: 'Programming', description: 'Programming languages and best practices', iconKey: 'code', order: 4 },
  { slug: 'devops', label: 'DevOps', description: 'Development operations and deployment', iconKey: 'cog', order: 5 },
  { slug: 'security', label: 'Security', description: 'Security principles and practices', iconKey: 'shield', order: 6 },
  { slug: 'general', label: 'General', description: 'General knowledge and miscellaneous topics', iconKey: 'book', order: 7 }
];

const TRACKS = [
  { id: 'track-networking-basics', slug: 'networking-basics', title: 'Networking Basics', description: 'Learn fundamental networking concepts from IP addressing to protocols', topicSlug: 'networking', level: 'Beginner', isPro: false, bitIds: ['1', '21', '15'] },
  { id: 'track-system-design-fundamentals', slug: 'system-design-fundamentals', title: 'System Design Fundamentals', description: 'Master the basics of designing distributed systems', topicSlug: 'system-design', level: 'Intermediate', isPro: true, bitIds: ['3', '54', '56'] },
  { id: 'track-programming-essentials', slug: 'programming-essentials', title: 'Programming Essentials', description: 'Essential programming patterns and best practices across languages', topicSlug: 'programming', level: 'Beginner', isPro: false, bitIds: ['6', '2', '17'] }
];

const HomePage: React.FC<{
  bits: Bit[],
  stats: UserStats,
  user?: any
}> = ({ bits, stats, user }) => {
  const navigate = useNavigate();

  const featuredBit = bits[0]; // Deterministic: first bit
  const startHereTracks = TRACKS.slice(0, 3);

  const handleSurpriseMe = () => {
    const freeBits = bits.filter(bit => bit.access === 'free');
    if (freeBits.length > 0) {
      const randomBit = freeBits[Math.floor(Math.random() * freeBits.length)];
      navigate(`/bit/${randomBit.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
    }
  };

  return (
    <div className="space-y-12">
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

      {/* Start Here Tracks */}
      <section>
        <h2 className="text-3xl font-black text-white mb-8">Start Here</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {startHereTracks.map((track: any) => (
            <div key={track.id} className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-indigo-500/30 transition-colors cursor-pointer" onClick={() => navigate(`/track/${track.slug}`)}>
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

      {/* Topics Grid */}
      <section>
        <h2 className="text-3xl font-black text-white mb-8">Explore Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOPICS.map((topic: any) => {
            const progress = getTopicProgress(bits, stats, topic.slug);
            return (
              <div key={topic.slug} className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-indigo-500/30 transition-colors cursor-pointer" onClick={() => navigate(`/topic/${topic.slug}`)}>
                <h3 className="text-xl font-bold text-white mb-2">{topic.label}</h3>
                <p className="text-slate-300 text-sm mb-4">{topic.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">{progress.completed}/{progress.total} learned</span>
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{topic.iconKey[0].toUpperCase()}</span>
                  </div>
                </div>
              </div>
            );
          })}
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

// Helper function
function getTopicProgress(bits: Bit[], stats: UserStats, topicSlug: string): { completed: number, total: number } {
  const topicBits = bits.filter(bit => bit.topicSlug === topicSlug);
  const completed = topicBits.filter(bit => stats.completedBits.includes(bit.id)).length;
  const total = topicBits.length;
  return { completed, total };
}

export default HomePage;