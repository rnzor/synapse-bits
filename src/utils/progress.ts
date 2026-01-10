import { Bit, UserStats } from '../types';

export function isCompleted(stats: UserStats, bitId: string): boolean {
  return stats.completedBits.includes(bitId);
}

export function markCompleted(stats: UserStats, bitId: string): UserStats {
  if (isCompleted(stats, bitId)) return stats;
  return {
    ...stats,
    completedBits: [...stats.completedBits, bitId],
    lastSeenBitId: bitId
  };
}

export function getTopicProgress(bits: Bit[], stats: UserStats, topicSlug: string): { completed: number, total: number } {
  const topicBits = bits.filter(bit => bit.topicSlug === topicSlug);
  const completed = topicBits.filter(bit => isCompleted(stats, bit.id)).length;
  const total = topicBits.length;
  return { completed, total };
}

export function getNextBitToContinue(bits: Bit[], stats: UserStats, topicSlug?: string): Bit | null {
  let candidates = bits;
  if (topicSlug) {
    candidates = bits.filter(bit => bit.topicSlug === topicSlug);
  }
  // Find first incomplete bit
  const nextBit = candidates.find(bit => !isCompleted(stats, bit.id));
  return nextBit || null;
}