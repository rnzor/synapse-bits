export interface Topic {
  slug: string;
  label: string;
  description: string;
  iconKey: string;
  order: number;
}

export const TOPICS: Topic[] = [
  {
    slug: 'networking',
    label: 'Networking',
    description: 'Network fundamentals, protocols, and infrastructure',
    iconKey: 'network',
    order: 1
  },
  {
    slug: 'system-design',
    label: 'System Design',
    description: 'Designing scalable and distributed systems',
    iconKey: 'cpu',
    order: 2
  },
  {
    slug: 'database',
    label: 'Database',
    description: 'Database design, optimization, and querying',
    iconKey: 'database',
    order: 3
  },
  {
    slug: 'programming',
    label: 'Programming',
    description: 'Programming languages and best practices',
    iconKey: 'code',
    order: 4
  },
  {
    slug: 'devops',
    label: 'DevOps',
    description: 'Development operations and deployment',
    iconKey: 'cog',
    order: 5
  },
  {
    slug: 'security',
    label: 'Security',
    description: 'Security principles and practices',
    iconKey: 'shield',
    order: 6
  },
  {
    slug: 'general',
    label: 'General',
    description: 'General knowledge and miscellaneous topics',
    iconKey: 'book',
    order: 7
  }
];