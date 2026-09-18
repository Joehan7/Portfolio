import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { projects } from '@/content/projects';
import { copy } from '@/content/copy';
import type { Project } from '@/content/types';
import { RouteLink } from '@/components/ui/RouteLink';
import { ProjectMedia } from '@/components/motion/ProjectMedia';
import { Reveal } from '@/components/motion/Reveal';
const blur =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PC9zdmc+';
export function ProjectBand({ project }: { project: Project }) {
  return (
    <article className={`project-band ${project.index % 2 === 0 ? 'reverse-band' : ''}`}>
      <div className="project-info">
        <div className="project-topline mono">
          <span>{String(project.index).padStart(2, '0')}</span>
          <span className={`project-status ${project.status}`}>
            <i />
            {project.status === 'in-progress' ? copy.work.progress : copy.work.developed}
          </span>
        </div>
        <Reveal kind="heading">
          <h3>{project.title}</h3>
        </Reveal>
        <p>{project.outcome}</p>
        <div className="tech-tags mono">
          {project.stack.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <RouteLink
          href={`/work/${project.slug}`}
          className="text-link"
          aria-label={`${copy.work.view}: ${project.title}`}
        >
          {copy.work.view}
          <ArrowUpRight size={16} />
        </RouteLink>
      </div>
      <ProjectMedia href={`/work/${project.slug}`} index={project.index}>
        <Image
          src={project.media.src}
          alt={project.media.alt}
          width={960}
          height={720}
          sizes="(max-width:767px) 100vw, 52vw"
          placeholder="blur"
          blurDataURL={blur}
        />
      </ProjectMedia>
    </article>
  );
}
export function SelectedWork() {
  return (
    <section id="work" className="section shell selected-work" data-section="work">
      <div className="section-label mono">{copy.work.label}</div>
      <div className="section-head">
        <Reveal kind="heading">
          <h2>{copy.work.title}</h2>
        </Reveal>
        <p>{copy.work.intro}</p>
      </div>
      {projects.map((project) => (
        <ProjectBand key={project.slug} project={project} />
      ))}
    </section>
  );
}
