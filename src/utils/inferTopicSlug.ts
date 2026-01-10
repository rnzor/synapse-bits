import { Bit } from '../../types';

export function inferTopicSlug(bit: Bit): string {
  // if bit.topicSlug exists return it
  if (bit.topicSlug) return bit.topicSlug;

  // if tags include 'networking' OR bit.language === 'network' OR network-related tags => 'networking'
  if (bit.tags.includes('networking') || bit.language === 'network' || bit.tags.includes('http') || bit.tags.includes('tcp') || bit.tags.includes('udp') || bit.tags.includes('dns') || bit.tags.includes('subnetting') || bit.tags.includes('load-balancing')) return 'networking';

  // if tags include 'security' OR security-related tags => 'security'
  if (bit.tags.includes('security') || bit.tags.includes('authentication') || bit.tags.includes('oauth') || bit.tags.includes('jwt') || bit.tags.includes('ssl') || bit.tags.includes('encryption')) return 'security';

  // if tags include 'database' OR database-related tags => 'database'
  if (bit.tags.includes('database') || bit.tags.includes('sql') || bit.tags.includes('mongodb') || bit.tags.includes('postgresql') || bit.tags.includes('redis') || bit.tags.includes('indexing') || bit.tags.includes('orm')) return 'database';

  // if tags include 'system-design' => 'system-design'
  if (bit.tags.includes('system-design')) return 'system-design';

  // if tags include 'programming' OR programming languages OR coding-related tags => 'programming'
  if (bit.tags.includes('programming') || bit.language === 'javascript' || bit.language === 'typescript' || bit.language === 'css' || bit.language === 'html' || bit.language === 'python' || bit.tags.includes('react') || bit.tags.includes('frontend') || bit.tags.includes('async') || bit.tags.includes('promises') || bit.tags.includes('git') || bit.tags.includes('version-control') || bit.tags.includes('decorators') || bit.tags.includes('context') || bit.tags.includes('state-management')) return 'programming';

  // if tags include 'devops' OR devops-related tags => 'devops'
  if (bit.tags.includes('devops') || bit.tags.includes('docker') || bit.tags.includes('kubernetes') || bit.tags.includes('nginx') || bit.tags.includes('aws') || bit.tags.includes('linux') || bit.tags.includes('bash') || bit.tags.includes('deployment') || bit.tags.includes('infrastructure')) return 'devops';

  // else => 'general'
  return 'general';
}