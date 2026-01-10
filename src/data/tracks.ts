import { Track } from '../../types';

export const TRACKS: Track[] = [
  {
    id: 'track-networking-basics',
    slug: 'networking-basics',
    title: 'Networking Basics',
    description: 'Learn fundamental networking concepts from IP addressing to protocols',
    topicSlug: 'networking',
    level: 'Beginner',
    isPro: false,
    bitIds: ['1', '21', '15'], // CIDR, TCP vs UDP, HTTP Status Codes
    estimatedTime: '2 hours'
  },
  {
    id: 'track-system-design-fundamentals',
    slug: 'system-design-fundamentals',
    title: 'System Design Fundamentals',
    description: 'Master the basics of designing distributed systems',
    topicSlug: 'system-design',
    level: 'Intermediate',
    isPro: true,
    bitIds: ['3', '54', '56'], // CAP Theorem, Load Balancing, Docker Volumes
    prerequisites: ['track-networking-basics'],
    estimatedTime: '4 hours',
    projects: [
      {
        id: 'project-cap-theorem-simulator',
        title: 'CAP Theorem Simulator',
        description: 'Build a distributed system simulator that demonstrates the trade-offs between Consistency, Availability, and Partition Tolerance.',
        difficulty: 'Advanced',
        estimatedTime: '8 hours',
        githubUrl: 'https://github.com/example/cap-simulator'
      }
    ]
  },
  {
    id: 'track-programming-essentials',
    slug: 'programming-essentials',
    title: 'Programming Essentials',
    description: 'Essential programming patterns and best practices across languages',
    topicSlug: 'programming',
    level: 'Beginner',
    isPro: false,
    bitIds: ['6', '2', '17'], // Python List Comprehensions, React useEffect, TypeScript Generics
    estimatedTime: '3 hours',
    projects: [
      {
        id: 'project-react-useeffect-demo',
        title: 'React useEffect Demo App',
        description: 'Create a demo application that showcases different useEffect patterns including cleanup functions, dependencies, and common pitfalls.',
        difficulty: 'Beginner',
        estimatedTime: '2 hours',
        githubUrl: 'https://github.com/example/useeffect-demo'
      }
    ]
  }
];