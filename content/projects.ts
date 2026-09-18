import { assetPath } from '@/lib/assetPath';
import type { Project } from './types';
export const projects: Project[] = [
  {
    slug: 'intelligent-soc-triage',
    index: 1,
    title: 'Intelligent SOC triage',
    fullTitle: 'Intelligent SOC triage: a language model approach for EDR alert management',
    outcome: 'Explainable alert prioritisation, with an analyst in the loop.',
    status: 'developed',
    problem: 'SOC-level EDR alert analysis and prioritisation are the focus of this project.',
    approach: [
      'Accept alert data from CSV and JSON inputs.',
      'Apply LLM-powered classification, severity scoring, and explainable alert summarisation.',
      'Present alerts in an interactive Streamlit dashboard for analyst decision support.',
    ],
    result: [
      'Automated SOC-level alert analysis and prioritisation.',
      'Generated actionable remediation recommendations to assist incident response.',
    ],
    stack: ['LLMs', 'Streamlit', 'CSV / JSON'],
    domains: ['Security operations', 'AI & agents'],
    links: [],
    media: {
      src: assetPath('/projects/soc.webp'),
      alt: 'Concept diagram: EDR alerts pass through classification, severity scoring and explanation to an analyst.',
    },
    featured: true,
  },
  {
    slug: 'subscription-management',
    index: 2,
    title: 'Subscription management',
    fullTitle: 'Subscription Management System',
    outcome: 'Automated access, from payment to expiry.',
    status: 'developed',
    problem:
      'Manage subscription payments, user onboarding, and access expiry in one automated system.',
    approach: [
      'Integrate Python, Aiogram, SQLite, and CryptoCloud USDT payments on BNB Chain.',
      'Automate onboarding through join-request links and enforce expiry in real time.',
      'Combine webhooks, polling reliability, CSV exports, and failover logic; deploy on a VPS with Nginx and systemd.',
    ],
    result: [
      'Automated onboarding and real-time expiry enforcement.',
      'Deployed with failover logic to support high-concurrency traffic and continuous operation.',
    ],
    stack: ['Python', 'Aiogram', 'SQLite', 'Nginx', 'BNB Chain'],
    domains: ['Engineering', 'Blockchain / Web3'],
    links: [],
    media: {
      src: assetPath('/projects/subscription.webp'),
      alt: 'Concept diagram of the subscription lifecycle: payment, onboarding, active access and expiry, with webhook and polling paths.',
    },
    featured: true,
  },
  {
    slug: 'adpilot',
    index: 3,
    title: 'AdPilot',
    fullTitle: 'AdPilot — Agentic AI Ad-Generation Platform',
    outcome: 'From source material to advertising creative.',
    status: 'in-progress',
    problem:
      'Transform prompts, URLs, and source content into platform-ready advertising content and creative assets.',
    approach: [
      'Develop content generation, campaigns, and brand workflows.',
      'Build the platform with NestJS, Next.js, PostgreSQL, and Prisma.',
      'Implement a bring-your-own-key architecture for connecting and managing AI providers.',
    ],
    result: [
      'In development: an agentic AI SaaS platform for advertising workflows.',
      'A bring-your-own-key architecture is being implemented.',
    ],
    stack: ['NestJS', 'Next.js', 'PostgreSQL', 'Prisma'],
    domains: ['AI & agents', 'Engineering'],
    links: [],
    media: {
      src: assetPath('/projects/adpilot.webp'),
      alt: 'Concept diagram: prompts, URLs and source content flow into agentic workflows for content, campaigns and brands.',
    },
    featured: true,
  },
  {
    slug: 'password-strength-analyzer',
    index: 4,
    title: 'Password strength analyzer',
    fullTitle: 'Password Strength Analyzer',
    outcome: 'Password feedback grounded in entropy and patterns.',
    status: 'developed',
    problem: 'Evaluate password security and provide actionable feedback in a web-based tool.',
    approach: [
      'Build a web interface with Python Flask, HTML, CSS, and JavaScript.',
      'Score passwords using entropy, dictionary, and pattern analysis.',
      'Display a dynamic strength meter with actionable feedback and keep the design modular.',
    ],
    result: [
      'A web-based password security evaluation tool with actionable feedback.',
      'Modular design allows future AI and breach-database integration; those integrations are not claimed as implemented.',
    ],
    stack: ['Python', 'Flask', 'JavaScript', 'HTML / CSS'],
    domains: ['Application security', 'Engineering'],
    links: [],
    media: {
      src: assetPath('/projects/password.webp'),
      alt: 'Concept diagram of three password evaluation inputs: entropy, dictionary analysis and pattern analysis, leading to actionable feedback.',
    },
    featured: true,
  },
];
export const getProject = (slug: string) => projects.find((project) => project.slug === slug);
