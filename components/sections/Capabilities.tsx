import { skills } from '@/content/skills';
import { copy } from '@/content/copy';
import { Reveal } from '@/components/motion/Reveal';
export function Capabilities() {
  return (
    <section id="capabilities" className="section shell capabilities" data-section="capabilities">
      <div className="section-label mono">{copy.skills.label}</div>
      <div className="section-head">
        <Reveal kind="heading">
          <h2>{copy.skills.title}</h2>
        </Reveal>
        <p>{copy.skills.intro}</p>
      </div>
      <div className="capability-matrix">
        {skills.map((skill) => (
          <div className="capability-row" key={skill.domain}>
            <h3>{skill.domain}</h3>
            <div className="skill-items mono">
              {skill.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <span
              className="skill-count mono"
              aria-label={`${skill.items.length} ${copy.skills.count}`}
            >
              {String(skill.items.length).padStart(2, '0')}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
