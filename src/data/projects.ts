import { Project } from '../../types';

export const PROJECTS: Project[] = [
  {
    id: 'project-simple-network-scanner',
    title: 'Simple Network Scanner',
    description: 'Build a basic network scanner that can discover devices on your local network using CIDR notation and basic socket programming.',
    difficulty: 'Beginner',
    estimatedTime: '3 hours',
    githubUrl: 'https://github.com/example/network-scanner'
  },
  {
    id: 'project-react-useeffect-demo',
    title: 'React useEffect Demo App',
    description: 'Create a demo application that showcases different useEffect patterns including cleanup functions, dependencies, and common pitfalls.',
    difficulty: 'Beginner',
    estimatedTime: '2 hours',
    githubUrl: 'https://github.com/example/useeffect-demo'
  },
  {
    id: 'project-cap-theorem-simulator',
    title: 'CAP Theorem Simulator',
    description: 'Build a distributed system simulator that demonstrates the trade-offs between Consistency, Availability, and Partition Tolerance.',
    difficulty: 'Advanced',
    estimatedTime: '8 hours',
    githubUrl: 'https://github.com/example/cap-simulator'
  }
];