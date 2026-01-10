import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bit, UserStats } from '../../types';
import DevDebugOverlay from '../components/DevDebugOverlay';
import { deriveTopics } from '../utils/derive';

const TopicsPage: React.FC<{
  bits: Bit[],
  stats: UserStats
}> = ({ bits, stats }) => {
  const navigate = useNavigate();

  const derivedTopics = deriveTopics(bits);
  const hasBits = Array.isArray(bits) && bits.length > 0;
  console.log('[TopicsPage] bits', bits.length, 'topicsDerived', derivedTopics.length);

  if (!hasBits) {
    return (
      <div className="space-y-8">
        <DevDebugOverlay bits={bits} label="TopicsPage" />
        <div>
          <h2 className="text-3xl font-black text-white mb-4">Topics</h2>
          <p className="text-slate-400">Explore learning topics with progress tracking</p>
        </div>
        <div className="text-center py-12">
          <h3 className="text-xl font-bold text-white">No bits found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DevDebugOverlay bits={bits} label="TopicsPage" />
      <div>
        <h2 className="text-3xl font-black text-white mb-4">Topics</h2>
        <p className="text-slate-400">Explore learning topics with progress tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {derivedTopics.map((topic) => {
          const progress = getTopicProgress(bits, stats, topic.slug);
          return (
            <div key={topic.slug} className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-indigo-500/30 transition-colors cursor-pointer" onClick={() => navigate(`/topic/${topic.slug}`)}>
              <h3 className="text-xl font-bold text-white mb-2">{topic.label}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{progress.completed}/{progress.total} bits</span>
              </div>
            </div>
          );
        })}
      </div>
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

export default TopicsPage;