export type Domain = string;
export type Profile = {
  name: string;
  shortName: string;
  initials: string;
  headline: string[];
  subline: string;
  summary: string;
  location: string;
  email: string;
  phone: string;
  availability: null | { state: 'open' | 'selective' | 'closed'; label: string };
  socials: { label: string; href: string }[];
  resumePdf: string;
};
export type Project = {
  slug: string;
  index: number;
  title: string;
  fullTitle: string;
  outcome: string;
  role?: string;
  period?: string;
  status: 'developed' | 'in-progress';
  problem: string;
  approach: string[];
  result: string[];
  stack: string[];
  domains: Domain[];
  links: { label: string; href: string }[];
  media: { src: string; alt: string };
  featured: boolean;
};
export type Experience = {
  org: string;
  role: string;
  start?: string;
  end?: string;
  location: string;
  outcomes: string[];
  stack?: string[];
};
export type SkillDomain = { domain: Domain; items: string[]; note?: string };
export type Certification = {
  name: string;
  issuer: string;
  status: 'held' | 'in-progress' | 'planned';
  date?: string;
  credentialUrl?: string;
};
export type Education = {
  institution: string;
  credential: string;
  start?: string;
  end?: string;
  detail?: string;
};
export type MethodPhase = {
  index: number;
  key: string;
  title: string;
  line: string;
  bullets: string[];
  projectSlug?: string;
};
