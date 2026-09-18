# Signal — implementation and QA report

## Design and interaction decisions

Signal uses an original security-console identity: restrained dark surfaces, oversized Switzer type, monospaced evidence, thin rules, original architecture diagrams, and a single particle-field hero. The reference supplied the motion vocabulary, not the brand or content. Hover, active, focus, menu, search, and transition states work within the same system.

The latest fluidity pass replaces inherited, page-wide animated CSS variables with direct transforms on the affected elements. One scroll runtime caches geometry and updates the HUD, header, parallax, and timeline together. Phase changes update React only when the phase actually changes. The hero uses native display-synchronised rendering, no competing timer or skipped shader updates, and keeps its context while paused offscreen. The full-width live header blur and cursor blending were removed to reduce repeated compositing.

Deliberate deviations: tertiary text was lightened for contrast; the layout and headline sizing were adjusted to fit 360–2560 px; unsupported availability, testimonials, credentials, writing, social profiles, and impact counters are omitted. The method describes the supplied projects instead of claiming a particular security engagement process. Project artwork is clearly labelled as conceptual architecture. The HTML resume is an edited presentation of the unchanged source PDF, so future updates need explicit reconciliation. Native refresh-rate animation replaces the original 60 fps cap in response to the user's fluidity request. Edge OG generation is retained as requested, although this Next.js version warns that Edge runtime is deprecated.

## Concrete interaction changes

| Area                             | Earlier behaviour                                                             | Current behaviour                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Scroll                           | Separate callbacks repeatedly read layout and changed inherited CSS variables | One scheduled update, cached geometry, local compositor transforms                        |
| Hero                             | Timer invalidation plus a second frame threshold skipped updates              | One native render loop; time-based pointer response                                       |
| Return to hero                   | WebGL unmounted and recompiled                                                | Context retained; rendering pauses offscreen                                              |
| Method                           | Smooth-scroll anchor interception overrode phase jumps                        | Rail owns its destination; direct meter updates and phase-only React changes              |
| Navigation                       | Basic cover transition and inconsistent Safari focus restoration              | Upward curtain, focus on new main, explicit menu trigger focus                            |
| Project hover                    | Repeated pointer geometry reads and basic zoom                                | Cached bounds, spring tilt, clipped zoom, corner markers, scan, keyboard-visible cues     |
| Motion preferences               | Several independent moving effects                                            | A persistent global preference, native touch scrolling, stopped offscreen/background work |
| Validation and animation loading | Full validation and animation bundles eagerly included                        | On-demand Zod Mini validation and lazy Motion features                                    |

## Scroll performance measurements

Measured locally in production, headless Chrome at 1440 × 1000. Each segment uses five seconds of the same CDP scroll input. RAF callback cadence is a main-thread frame-pacing measurement, not a claim about frames physically presented by a monitor. No other browser suite ran during these measurements.

| Segment | Before callback rate | Final callback rate | Before p95 | Final p95 | Before style work | Final style work |
| ------- | -------------------: | ------------------: | ---------: | --------: | ----------------: | ---------------: |
| Hero    |               91.7/s |              99.9/s |      20 ms |   10.1 ms |        3,520.2 ms |         121.2 ms |
| Work    |               94.7/s |              99.9/s |    10.2 ms |   10.1 ms |        3,597.3 ms |          99.6 ms |
| Method  |               89.9/s |              99.9/s |      20 ms |   10.1 ms |        3,779.1 ms |         116.7 ms |

Style-recalculation time fell 96.9%; frames over 25 ms fell from 14 to 0 across 1,500 final sampled frames. The final audit captured zero console warnings/errors and confirmed that the same canvas remained mounted after scrolling away. Raw data: reports/frames-before.json and reports/frames-final.json.

## Verification status

| Check                             | Measured result                                                                                                                                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript build / ESLint         | Build passed; 0 TypeScript errors; 0 ESLint warnings. Next emits the documented Edge-runtime deprecation notice.                                                                                                  |
| Unit checks                       | 10 / 10 passed.                                                                                                                                                                                                   |
| Production browser checks         | 52 / 52 Chrome and Android-emulation checks; 48 / 48 WebKit and iPhone-emulation checks; 3 / 3 additional full-motion checks after final CSS refinement.                                                          |
| axe                               | 0 serious or critical violations on all 10 tested routes and the open command palette in the four tested configurations.                                                                                          |
| Keyboard and motion preference    | Mega-menu, palette, mobile focus trap/restore, form, terminal, persisted motion toggle, and reduced-motion layout passed.                                                                                         |
| Responsive widths                 | 360, 768, 1024, 1440, 1920, 2560 px passed overflow/headline checks.                                                                                                                                              |
| Lifecycle after six round trips   | Event listeners stayed at 483; DOM nodes stayed at 2180. The method trigger is removed off-page and exactly one Lenis instance remains active. These counters are not an exhaustive heap-leak proof.              |
| Initial modern-browser JavaScript | 201,034 bytes gzipped (196.3 KiB); above the requested 180 KB budget. Source-derived chunks exclude the nomodule legacy fallback.                                                                                 |
| Local Lighthouse mobile           | Performance 54; accessibility 100; best practices 82; SEO 100. This host-influenced local run does not satisfy the deployed 95+ gate.                                                                             |
| Local load timing / layout shift  | FCP 5.32 s; LCP 8.36 s; TBT 186 ms; CLS 0.                                                                                                                                                                        |
| Local load weight                 | 1,410,311 bytes total, including 926,765 bytes of externally injected Kaspersky resources; first-party transfers were 483,546 bytes. This is the audit navigation, not every lazy image after a full-page scroll. |
| INP                               | Field INP cannot be measured before public deployment and real visitor traffic. TBT is not substituted for INP.                                                                                                   |
| Production console                | 0 errors/warnings captured in the final scroll audit; all route checks reported no uncaught page errors.                                                                                                          |
| Public artefacts                  | All 13 checked PDF, llms.txt, robots, sitemap, and OG endpoints resolve.                                                                                                                                          |
| Content provenance                | Biography/project content derives from the resume; no unsupported credentials, metrics, links, or quotes. Full gaps below.                                                                                        |

The source PDF and public/resume.pdf share SHA-256:
39C115693B654B5F4CE4F24D101404296761E01EA9F61AEB1F75015A611CD98F.

## Release limitations

This is a local production preview, not a public Vercel deployment. The brief's deployed Lighthouse requirement remains open. Vercel authentication/project details, a final origin, a verified Resend sender, and Upstash credentials are not configured. Email links work; the form explicitly reports unavailable delivery and never claims a message was sent.

The initial modern-browser JavaScript budget is still above the requested 180 KB limit. Further bundle reduction is a release follow-up; it is not represented as a passed gate. Firefox's downloaded test runtime did not establish its automation connection in this Windows environment. The checked-in CI workflow includes Firefox, but that workflow has not been run remotely. WebKit/iPhone and Chrome/Android runs are engine/device emulation, not physical Safari or Android hardware.

The final local Lighthouse run includes 926,765 bytes of Kaspersky-injected scripts, CSS, and requests. Those resources are absent from this source and account for about two-thirds of the measured transfer weight. Raw local scores must not be presented as clean deployed scores. No security software settings were changed.

## Content gaps

All factual biography and project claims come from JOEHAN_RESUME.pdf. Neutral navigation, instructions, interface states, and a synthesised positioning headline were written for this portfolio.

- TODO(content): Exact dates for the Hinduja Global Solutions internship.
- TODO(content): Education start/end dates, graduation date, and the scale for GPA 8. The source’s Primary/Secondary Education labels and percentage labels are preserved.
- TODO(content): Current availability. No availability badge or response-time promise is shown.
- TODO(content): GitHub, LinkedIn, other platform profile URLs, project repositories, live demos, and proof artefacts. No guessed links are shown.
- TODO(content): Project dates, team size, individual ownership/role, original screenshots, evaluation datasets, and measured impact. Case studies remain short; their visuals are labelled conceptual architecture studies.
- TODO(content): Certifications and credential URLs. None are claimed; ISO 27001 is presented only as experience/process knowledge.
- TODO(content): Published writing, CTF notes, and testimonials. Those sections are omitted.
- TODO(content): Quantified operational results, completed CTF counts, alert totals, and similar evidence. No invented statistics or credibility counters are shown. Numbered projects, method steps, skill totals, and search counts describe the actual interface content.
- TODO(content): AdPilot remains in progress. AI and breach-database integration for the password tool remains a future possibility.
- TODO(content): Confirm any measurable uptime guarantee for the subscription system. The site describes deployment and failover functionality without treating the resume’s “24/7 uptime” wording as an independently measured service guarantee.
- TODO(content): Final public domain, translations, and a professional portrait if desired.
- TODO(configuration): Vercel authentication/project, verified Resend sender/API key, and shared Upstash rate-limit credentials are needed for public deployment and form delivery.

## Next improvements, ranked for a hiring manager

1. Add working project demos/repositories and concrete proof artefacts, with a clear statement of Joehan's individual contribution.
2. Add genuine evaluation results and screenshots to the SOC triage case study, explaining limitations and analyst decisions.
3. Complete the public HTTPS deployment and contact configuration, then close the remaining bundle and deployed-performance gates.

## Deploy

From this project directory, authenticate with Vercel, configure the environment variables in .env.example, then run:

```sh
pnpm dlx vercel login
pnpm dlx vercel --prod
```

Run the browser and performance checks again against the deployed origin.
