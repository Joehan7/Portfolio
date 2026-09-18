import { profile } from '@/content/profile';
import { copy } from '@/content/copy';
import { pageMetadata } from '@/content/seo';
import { Timeline } from '@/components/sections/Timeline';
import { Capabilities } from '@/components/sections/Capabilities';
export const metadata = pageMetadata(copy.about.title, '/about');
export default function AboutPage() {
  return (
    <main id="main" data-section="about">
      <section className="shell page-top about-intro">
        <div className="section-label mono">{profile.name}</div>
        <h1>{copy.about.title}</h1>
        <p className="editorial-opening">{copy.about.opening}</p>
        <div className="about-detail">
          <p>{copy.about.body}</p>
          <div>
            <span className="mono muted">{copy.about.location}</span>
            <p>{profile.location}</p>
            <span className="mono muted">{copy.about.focus}</span>
            <p>{copy.about.focusText}</p>
          </div>
        </div>
      </section>
      <Timeline />
      <Capabilities />
      <section className="shell interests">
        <h2>{copy.about.interests}</h2>
        <ul>
          {copy.about.interestItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
