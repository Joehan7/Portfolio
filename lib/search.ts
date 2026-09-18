import { projects } from '@/content/projects';
import { skills } from '@/content/skills';
const normalise = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
export function fuzzyScore(query: string, text: string) {
  const q = normalise(query),
    hay = normalise(text);
  if (!q) return 1;
  if (hay.includes(q)) return 100;
  const words = q.split(' ');
  const overlap = words.filter((w) => hay.includes(w)).length;
  if (overlap) return (overlap / words.length) * 60;
  for (const word of hay.split(' ')) {
    let index = 0;
    for (const char of word) {
      if (char === q[index]) index++;
      if (index === q.length) return 10;
    }
  }
  return 0;
}
export function searchContent(query: string) {
  return {
    projects: projects
      .map((item) => ({
        item,
        score: fuzzyScore(
          query,
          [item.title, item.outcome, ...item.stack, ...item.domains].join(' '),
        ),
      }))
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((p) => p.item),
    skills: skills.filter((s) => fuzzyScore(query, [s.domain, ...s.items].join(' ')) > 0),
  };
}
