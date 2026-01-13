import { Bit, Track } from '../../types';
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

function deriveLevel(bits: Bit[]): 'Beginner' | 'Intermediate' | 'Advanced' {
  const counts = { Beginner: 0, Intermediate: 0, Advanced: 0 };
  bits.forEach(b => counts[b.difficulty]++);
  
  if (counts.Advanced > counts.Intermediate && counts.Advanced > counts.Beginner) return 'Advanced';
  if (counts.Intermediate > counts.Beginner) return 'Intermediate';
  return 'Beginner';
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

export function deriveTracks(bits: Bit[]): Track[] {
  const topicBits: Record<string, Bit[]> = {};

  bits.forEach(bit => {
    const topicSlug = bit.topicSlug ?? inferTopicSlug(bit);
    if (!topicBits[topicSlug]) {
      topicBits[topicSlug] = [];
    }
    topicBits[topicSlug].push(bit);
  });

  return Object.entries(topicBits)
    .filter(([, topicBitsArray]) => topicBitsArray.length > 0)
    .map(([slug, topicBitsArray]) => {
      // Sort bits within track: Beginner -> Intermediate -> Advanced
      const sortedBits = [...topicBitsArray].sort((a, b) => {
        const order = { Beginner: 0, Intermediate: 1, Advanced: 2 };
        return order[a.difficulty] - order[b.difficulty];
      });

      const hasProContent = sortedBits.some(b => b.access === 'pro');
      const estimatedMinutes = sortedBits.length * 5;
      const hours = Math.ceil(estimatedMinutes / 60);

      return {
        id: `track-${slug}`,
        slug,
        title: capitalizeSlug(slug),
        description: `Master ${capitalizeSlug(slug)} concepts with ${sortedBits.length} high-velocity neural bits.`,
        topicSlug: slug,
        level: deriveLevel(sortedBits),
        isPro: hasProContent,
        bitIds: sortedBits.map(b => b.id),
        prerequisites: [],
        estimatedTime: hours === 1 ? '1 hour' : `${hours} hours`,
        projects: []
      };
    })
    .sort((a, b) => b.bitIds.length - a.bitIds.length);
}
