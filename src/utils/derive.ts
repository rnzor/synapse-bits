import { Bit } from '../../types';
import { inferTopicSlug } from './inferTopicSlug';

function capitalizeSlug(slug: string): string {
  const exceptions: Record<string, string> = {
    'devops': 'DevOps',
    'system-design': 'System Design',
    'javascript': 'JavaScript',
    'typescript': 'TypeScript'
  };

  if (exceptions[slug]) {
    return exceptions[slug];
  }

  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function deriveTopics(bits: Bit[]): Array<{ slug: string; label: string; count: number }> {
  const topicCounts: Record<string, number> = {};

  bits.forEach(bit => {
    const topicSlug = bit.topicSlug ?? inferTopicSlug(bit);
    topicCounts[topicSlug] = (topicCounts[topicSlug] || 0) + 1;
  });

  return Object.entries(topicCounts)
    .filter(([, count]) => count > 0)
    .map(([slug, count]) => ({
      slug,
      label: capitalizeSlug(slug),
      count
    }))
    .sort((a, b) => b.count - a.count);
}

export function deriveTracks(bits: Bit[]): Array<{ slug: string; title: string; bits: Bit[] }> {
  const topicBits: Record<string, Bit[]> = {};

  bits.forEach(bit => {
    const topicSlug = bit.topicSlug ?? inferTopicSlug(bit);
    if (!topicBits[topicSlug]) {
      topicBits[topicSlug] = [];
    }
    topicBits[topicSlug].push(bit);
  });

  return Object.entries(topicBits)
    .filter(([, bits]) => bits.length > 0)
    .map(([slug, bits]) => ({
      slug,
      title: capitalizeSlug(slug),
      bits
    }))
    .sort((a, b) => b.bits.length - a.bits.length);
}