import { Download } from 'lucide-react';
import { profile } from '@/content/profile';
import { projects } from '@/content/projects';
import { experience } from '@/content/experience';
import { skills } from '@/content/skills';
import { education } from '@/content/education';
import { copy } from '@/content/copy';
import { pageMetadata } from '@/content/seo';
import { RouteLink } from '@/components/ui/RouteLink';
export const metadata = pageMetadata(copy.resume.title, '/resume');
export default function ResumePage() {
  return (
    <main id="main" data-section="resume" className="shell page-top resume-page">
      <div className="resume-heading">
        <div>
          <div className="section-label mono">{copy.resume.title}</div>
          <h1>{profile.name}</h1>
          <p>{profile.location}</p>
          <a href={'mailto:' + profile.email}>{profile.email}</a>
          <a href={'tel:' + profile.phone.replace(/\s/g, '')}>{profile.phone}</a>
        </div>
        <a href={profile.resumePdf} download className="button primary">
          {copy.resume.download}
          <Download size={16} />
        </a>
      </div>
      <p className="resume-note mono">{copy.resume.note}</p>
      <section>
        <h2>{copy.resume.summary}</h2>
        <p>{profile.summary}</p>
      </section>
      <section>
        <h2>{copy.resume.experience}</h2>
        {experience.map((item) => (
          <article key={item.org}>
            <div className="resume-row">
              <h3>{item.role}</h3>
              {item.start && (
                <span className="mono">
                  {item.start} — {item.end}
                </span>
              )}
            </div>
            <p className="muted">
              {item.org} / {item.location}
            </p>
            <ul>
              {item.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
      <section>
        <h2>{copy.resume.education}</h2>
        {education.map((item) => (
          <article key={item.credential}>
            <h3>{item.credential}</h3>
            <p className="muted">{item.institution}</p>
            <p className="mono">{item.detail}</p>
          </article>
        ))}
      </section>
      <section>
        <h2>{copy.resume.skills}</h2>
        {skills.map((skill) => (
          <article key={skill.domain}>
            <h3>{skill.domain}</h3>
            <p className="muted">{skill.items.join(', ')}</p>
          </article>
        ))}
      </section>
      <section>
        <h2>{copy.resume.projects}</h2>
        {projects.map((project) => (
          <article key={project.slug}>
            <RouteLink href={'/work/' + project.slug}>
              <h3>{project.fullTitle}</h3>
            </RouteLink>
            <p className="mono muted">
              {project.status === 'in-progress' ? copy.work.progress : copy.work.developed}
            </p>
            <ul>
              {project.approach.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
      <section>
        <h2>{copy.resume.interests}</h2>
        <p>{copy.about.interestItems.join(', ')}</p>
      </section>
    </main>
  );
}
