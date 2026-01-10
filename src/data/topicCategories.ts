export interface TopicCategory {
  name: string;
  description: string;
  topicSlugs: string[];
  order: number;
}

export const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    name: 'Networking & Infrastructure',
    description: 'Network fundamentals, security, and deployment infrastructure',
    topicSlugs: ['networking', 'devops', 'security'],
    order: 1
  },
  {
    name: 'Development & Design',
    description: 'Programming languages, databases, and system architecture',
    topicSlugs: ['programming', 'database', 'system-design'],
    order: 2
  },
  {
    name: 'General',
    description: 'General knowledge and miscellaneous topics',
    topicSlugs: ['general'],
    order: 3
  }
];