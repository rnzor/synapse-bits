import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bit, UserStats } from '../../types';
import BitCard from '../../components/BitCard';
import { IconLock } from '../../components/Icons';

const TOPICS = [
  { slug: 'networking', label: 'Networking', description: 'Network fundamentals, protocols, and infrastructure', iconKey: 'network', order: 1 },
  { slug: 'system-design', label: 'System Design', description: 'Designing scalable and distributed systems', iconKey: 'cpu', order: 2 },
  { slug: 'database', label: 'Database', description: 'Database design, optimization, and querying', iconKey: 'database', order: 3 },
  { slug: 'programming', label: 'Programming', description: 'Programming languages and best practices', iconKey: 'code', order: 4 },
  { slug: 'devops', label: 'DevOps', description: 'Development operations and deployment', iconKey: 'cog', order: 5 },
  { slug: 'security', label: 'Security', description: 'Security principles and practices', iconKey: 'shield', order: 6 },
  { slug: 'general', label: 'General', description: 'General knowledge and miscellaneous topics', iconKey: 'book', order: 7 }
];

const TopicPage: React.FC<{
  bits: Bit[],
  stats: UserStats,
  user?: any
}> = ({ bits, stats, user }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'completed' | 'locked'>('all');

  const topic = TOPICS.find(t => t.slug === slug);
  if (!topic) return <div>Topic not found</div>;

  const topicBits = bits.filter(bit => bit.topicSlug === topic.slug);
  const progress = getTopicProgress(bits, stats, topic.slug);

  let filteredBits = topicBits;
  if (activeFilter === 'unread') {
    filteredBits = topicBits.filter(bit => !isCompleted(stats, bit.id));
  } else if (activeFilter === 'completed') {
    filteredBits = topicBits.filter(bit => isCompleted(stats, bit.id));
  } else if (activeFilter === 'locked') {
    filteredBits = topicBits.filter(bit => bit.access === 'pro' && !user);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/topics')} className="text-indigo-400 hover:text-indigo-300 mb-4">← Back to Topics</button>
        <h2 className="text-3xl font-black text-white mb-2">{topic.label}</h2>
        <p className="text-slate-400 mb-6">{topic.description}</p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Progress</span>
            <span>{progress.completed}/{progress.total} bits learned</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'unread', 'completed', 'locked'].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Bits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredBits.map(bit => {
          const completed = isCompleted(stats, bit.id);
          const locked = bit.access === 'pro' && !user;

          return (
            <div key={bit.id} className="relative">
              <div className={completed ? 'opacity-60' : locked ? 'blur-sm' : ''}>
                <BitCard
                  bit={bit}
                  onClick={() => {
                    if (locked) return; // Don't navigate if locked
                    navigate(`/bit/${bit.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
                  }}
                  onShare={() => {}}
                  onTagClick={() => {}}
                  onBookmark={() => {}}
                />
              </div>
              {completed && (
                <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {locked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                  <div className="text-center">
                    <IconLock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <span className="text-white font-medium">PRO Required</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper functions
function isCompleted(stats: UserStats, bitId: string): boolean {
  return stats.completedBits.includes(bitId);
}

function getTopicProgress(bits: Bit[], stats: UserStats, topicSlug: string): { completed: number, total: number } {
  const topicBits = bits.filter(bit => bit.topicSlug === topicSlug);
  const completed = topicBits.filter(bit => isCompleted(stats, bit.id)).length;
  const total = topicBits.length;
  return { completed, total };
}

export default TopicPage;