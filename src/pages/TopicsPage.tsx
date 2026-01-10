import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bit, UserStats } from '../../types';

const TOPICS = [
  { slug: 'networking', label: 'Networking', description: 'Network fundamentals, protocols, and infrastructure', iconKey: 'network', order: 1 },
  { slug: 'system-design', label: 'System Design', description: 'Designing scalable and distributed systems', iconKey: 'cpu', order: 2 },
  { slug: 'database', label: 'Database', description: 'Database design, optimization, and querying', iconKey: 'database', order: 3 },
  { slug: 'programming', label: 'Programming', description: 'Programming languages and best practices', iconKey: 'code', order: 4 },
  { slug: 'devops', label: 'DevOps', description: 'Development operations and deployment', iconKey: 'cog', order: 5 },
  { slug: 'security', label: 'Security', description: 'Security principles and practices', iconKey: 'shield', order: 6 },
  { slug: 'general', label: 'General', description: 'General knowledge and miscellaneous topics', iconKey: 'book', order: 7 }
];

const TopicsPage: React.FC<{
  bits: Bit[],
  stats: UserStats
}> = ({ bits, stats }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white mb-4">Topics</h2>
        <p className="text-slate-400">Explore learning topics with progress tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOPICS.map((topic: any) => {
          const progress = getTopicProgress(bits, stats, topic.slug);
          return (
            <div key={topic.slug} className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-indigo-500/30 transition-colors cursor-pointer" onClick={() => navigate(`/topic/${topic.slug}`)}>
              <h3 className="text-xl font-bold text-white mb-2">{topic.label}</h3>
              <p className="text-slate-300 text-sm mb-4">{topic.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{progress.completed}/{progress.total} bits</span>
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{topic.iconKey[0].toUpperCase()}</span>
                </div>
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