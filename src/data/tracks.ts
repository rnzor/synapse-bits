export interface Track {
  id: string;
  slug: string;
  title: string;
  description: string;
  topicSlug: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  isPro: boolean;
  bitIds: string[];
}

export const TRACKS: Track[] = [
  {
    id: 'track-networking-basics',
    slug: 'networking-basics',
    title: 'Networking Basics',
    description: 'Learn fundamental networking concepts from IP addressing to protocols',
    topicSlug: 'networking',
    level: 'Beginner',
    isPro: false,
    bitIds: ['1', '21', '15'] // CIDR, TCP vs UDP, HTTP Status Codes
  },
  {
    id: 'track-system-design-fundamentals',
    slug: 'system-design-fundamentals',
    title: 'System Design Fundamentals',
    description: 'Master the basics of designing distributed systems',
    topicSlug: 'system-design',
    level: 'Intermediate',
    isPro: true,
    bitIds: ['3', '54', '56'] // CAP Theorem, Load Balancing, Docker Volumes
  },
  {
    id: 'track-programming-essentials',
    slug: 'programming-essentials',
    title: 'Programming Essentials',
    description: 'Essential programming patterns and best practices across languages',
    topicSlug: 'programming',
    level: 'Beginner',
    isPro: false,
    bitIds: ['6', '2', '17'] // Python List Comprehensions, React useEffect, TypeScript Generics
  }
];