import { describe, it, expect } from 'vitest';
import { fuzzyScore, searchContent } from '@/lib/search';
import { projects } from '@/content/projects';
describe('search', () => {
  it('finds SOC through case and punctuation', () => {
    expect(searchContent('soc').projects[0].slug).toBe('intelligent-soc-triage');
  });
  it('finds engineering tools and reports unmatched input honestly', () => {
    expect(searchContent('Python').projects.length).toBe(2);
    expect(searchContent('zzzzzzzz').projects.length).toBe(0);
  });
  it('supports fuzzy character sequences', () =>
    expect(fuzzyScore('sbt', 'subscription')).toBeGreaterThan(0));
  it('keeps AdPilot in progress', () =>
    expect(projects.find((p) => p.slug === 'adpilot')?.status).toBe('in-progress'));
});
