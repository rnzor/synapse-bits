
import { AuthUser, UserStats } from '../types';

export interface UserProgressData {
  streak: number;
  totalXp: number;
  bitsCompleted: number;
  achievementsCount: number;
  timeSpentWeek: number; // in minutes
  nextMilestone: {
    name: string;
    target: number;
    current: number;
  };
}

// Simulates GET /users/{discord_id}/progress
export const fetchUserProgress = async (user: AuthUser, localStats: UserStats, currentXp: number): Promise<UserProgressData> => {
    // In a real app, this would fetch from an API
    // await fetch(`/api/users/${user.discord?.id}/progress`);
    
    const nextLevelXp = (Math.floor(currentXp / 100) + 1) * 100;

    // Simulate "time spent" fluctuating slightly to show real-time effect
    const baseTime = 45; // minutes
    const randomVariation = Math.floor(Math.random() * 5); 

    return {
        streak: localStats.streak,
        totalXp: currentXp,
        bitsCompleted: localStats.bitsRead,
        achievementsCount: localStats.badges.length,
        timeSpentWeek: baseTime + randomVariation,
        nextMilestone: {
            name: `Level ${Math.floor(currentXp / 100) + 1}`,
            target: nextLevelXp,
            current: currentXp
        }
    };
};
