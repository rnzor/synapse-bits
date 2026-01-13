import { Bit, UserStats, Track, TrackProgress } from '../../types';

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

// Track completion functions
export function getTrackProgress(track: Track, stats: UserStats): { completed: number, total: number, percentage: number } {
  const completed = track.bitIds.filter(bitId => isCompleted(stats, bitId)).length;
  const total = track.bitIds.length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  return { completed, total, percentage };
}

export function isTrackCompleted(track: Track, stats: UserStats): boolean {
  return track.bitIds.every(bitId => isCompleted(stats, bitId));
}

export function getTrackPrerequisitesMet(track: Track, _stats: UserStats): boolean {
  if (!track.prerequisites || track.prerequisites.length === 0) return true;
  // Dynamic tracks currently don't have defined prerequisites
  return true;
}


export function canAccessTrack(track: Track, _stats: UserStats, user?: any): boolean {

  // Free tracks are always accessible
  if (!track.isPro) return true;

  // PRO tracks require user account and PRO status
  if (!user) return false;

  // For now, assume all logged-in users have PRO access
  // In real implementation, check user subscription
  return true;
}

export function getNextBitInTrack(track: Track, stats: UserStats): string | null {
  const nextIncompleteBit = track.bitIds.find(bitId => !isCompleted(stats, bitId));
  return nextIncompleteBit || null;
}

export function getContinueLearningRecommendation(tracks: Track[], _bits: Bit[], stats: UserStats): {

  nextBitId?: string;
  nextTrackSlug?: string;
  reason: 'incomplete-track' | 'next-topic' | 'streak-goal' | 'none';
} {
  // 1. Check for active tracks (partially completed)
  for (const track of tracks) {
    if (canAccessTrack(track, stats) && !isTrackCompleted(track, stats)) {
      const nextBitId = getNextBitInTrack(track, stats);
      if (nextBitId) {
        return { nextBitId, reason: 'incomplete-track' };
      }
    }
  }

  // 2. Suggest next available track
  for (const track of tracks) {
    if (canAccessTrack(track, stats) && getTrackPrerequisitesMet(track, stats) && !isTrackCompleted(track, stats)) {
      return { nextTrackSlug: track.slug, reason: 'next-topic' };
    }
  }

  // 3. No recommendations available
  return { reason: 'none' };
}

export function updateTrackProgress(stats: UserStats, trackSlug: string, completedBitIds: string[]): UserStats {
  const existingProgress = stats.trackProgress.find(tp => tp.trackSlug === trackSlug);

  if (existingProgress) {
    // Update existing progress
    return {
      ...stats,
      trackProgress: stats.trackProgress.map(tp =>
        tp.trackSlug === trackSlug
          ? { ...tp, completedBitIds: [...new Set([...tp.completedBitIds, ...completedBitIds])], lastAccessedAt: Date.now() }
          : tp
      )
    };
  } else {
    // Create new progress entry
    const newProgress: TrackProgress = {
      trackSlug,
      completedBitIds: [...completedBitIds],
      startedAt: Date.now(),
      lastAccessedAt: Date.now()
    };

    return {
      ...stats,
      trackProgress: [...stats.trackProgress, newProgress]
    };
  }
}