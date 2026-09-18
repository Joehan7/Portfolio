import type { SkillDomain } from './types';
export const skills: SkillDomain[] = [
  {
    domain: 'Security operations',
    items: [
      'Splunk',
      'Wireshark',
      'MITRE ATT&CK',
      'ISO 27001-aligned processes',
      'SIEM workflows',
      'Red/Blue/Purple Team methodology',
    ],
  },
  {
    domain: 'AI & agents',
    items: [
      'AI agents',
      'Agentic workflows',
      'LLM integration',
      'AI-assisted automation',
      'API orchestration',
      'Solution prototyping and deployment',
    ],
  },
  {
    domain: 'Engineering',
    items: [
      'Python',
      'SQL',
      'Java',
      'Kotlin',
      'PostgreSQL (Row-Level Security)',
      'Kafka',
      'Docker',
      'REST APIs',
    ],
  },
  {
    domain: 'Application security',
    items: [
      'OWASP Top 10',
      'Penetration testing (learning)',
      'Network security fundamentals',
      'Threat modeling',
    ],
  },
  {
    domain: 'Blockchain / Web3',
    items: [
      'On-chain transaction analysis',
      'Testnet validation & bug reporting',
      'DeFi risk assessment',
    ],
  },
];
export const credibility = [
  ['Splunk', 'Wireshark', 'MITRE ATT&CK', 'Python', 'Docker', 'PostgreSQL'],
  ['AI agents', 'OWASP Top 10', 'Kafka', 'Java', 'REST APIs', 'LLM integration'],
];
