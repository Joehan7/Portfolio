import type { MethodPhase } from './types';
export const method: MethodPhase[] = [
  {
    index: 1,
    key: 'inspect',
    title: 'Start with the input.',
    line: 'Make the source material usable.',
    bullets: ['CSV and JSON alert inputs', 'EDR alert analysis in a SOC context'],
    projectSlug: 'intelligent-soc-triage',
  },
  {
    index: 2,
    key: 'analyse',
    title: 'Give the signal context.',
    line: 'Make classification explainable.',
    bullets: ['LLM-powered alert classification', 'Severity scoring and alert summaries'],
    projectSlug: 'intelligent-soc-triage',
  },
  {
    index: 3,
    key: 'assist',
    title: 'Support the decision.',
    line: 'Put useful evidence in front of an analyst.',
    bullets: ['Streamlit alert visualisation', 'Actionable remediation recommendations'],
    projectSlug: 'intelligent-soc-triage',
  },
  {
    index: 4,
    key: 'automate',
    title: 'Connect the moving parts.',
    line: 'Carry the workflow through to an action.',
    bullets: ['Payment-linked onboarding', 'Real-time subscription expiry enforcement'],
    projectSlug: 'subscription-management',
  },
  {
    index: 5,
    key: 'operate',
    title: 'Account for failure.',
    line: 'Build reliability into the system.',
    bullets: [
      'Webhook and polling reliability',
      'VPS deployment with Nginx, systemd, and failover logic',
    ],
    projectSlug: 'subscription-management',
  },
];
