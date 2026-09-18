# Signal — Joehan’s portfolio

A resume-backed security and AI engineering portfolio built with Next.js 16, strict TypeScript, Tailwind 4, Motion, GSAP ScrollTrigger, Lenis, and a lazy React Three Fiber hero.

## Run

Use Node 22.14+ and pnpm 12.

```sh
pnpm install
pnpm dev
```

The development site runs at http://localhost:3000. For a production preview:

```sh
pnpm build
pnpm exec next start --hostname 127.0.0.1 -p 3001
```

## Verify

```sh
pnpm lint
pnpm test
pnpm build
pnpm test:smoke
```

The smoke suite targets production on port 3001 and uses installed Chrome for desktop and Android emulation; CI uses Playwright Chromium. Set BASE_URL to test another environment. For Firefox and WebKit:

```sh
pnpm exec playwright install firefox webkit
pnpm exec playwright test --config playwright.cross.config.ts
```

The Vitest runner configuration avoids an esbuild directory-enumeration limitation in the Windows workspace sandbox. No application permissions are weakened.

## Update content

Visitor-facing language is centralised in content/. Start with profile.ts, projects.ts, experience.ts, skills.ts, education.ts, and copy.ts. All biography facts originate in the supplied resume. Keep AdPilot marked in progress until evidence changes. certifications.ts and writing.ts deliberately contain empty arrays. Unknown dates and social links stay omitted.

The HTML resume and project pages consume these modules. Replace public/resume.pdf when the source changes, then reconcile the content modules with it. The PDF is copied unchanged rather than regenerated; the two formats require a deliberate content review when updating. CONTENT-GAPS.md records missing evidence.

content/visuals.json holds diagram labels. scripts/generate-assets.mjs renders the original conceptual diagrams and poster; no reference-site images are used. It uses Sharp bundled with Next.js. On Windows, point FONTCONFIG_FILE to a Fontconfig file that includes the supplied JetBrains Mono font if that font is not installed.

## Interaction architecture

- Motion preferences live in Providers and persist locally. The OS preference is the default.
- RouteLink prefetches internal routes; a 420 ms curtain covers route replacement, clears upward, then places focus on the new main landmark. Standard modifier-key navigation remains native.
- Lenis runs only for fine pointers with motion enabled. It shares GSAP’s ticker and stops in background tabs. lib/scroll.ts routes explicit scrolling through Lenis when available.
- Method uses one scrubbed, pinned timeline on wide screens and a readable sequence on mobile or with reduced motion.
- lib/scrollRuntime.ts combines the HUD, header, and visible scroll effects into one frame-batched update. It caches geometry on resize and font/ScrollTrigger refresh, then writes transforms directly to the affected elements. It disconnects observers and listeners on navigation. No inherited page-wide CSS variables change during scroll.
- Marquees pause on hover, focus controls, off-screen, hidden tabs, and reduced motion. The editorial rail responds to scroll velocity.
- Project frames combine capped parallax, restrained spring-driven pointer response, focus-visible corner markers, and a one-shot scan.
- The 4,000-point hero is imported on first intersection, retained while on the page, and paused offscreen and in background tabs. Native display-synchronised rendering replaces the old competing 60 Hz timers; high-refresh displays are supported. Pixel ratio is capped at 1.25. Coarse pointers and low-memory devices use the static poster. Reduced motion renders a static frame.
- Ctrl/Cmd K opens an accessible combobox palette. Focus stays in native dialog overlays.
- The 404 terminal is optional, keyboard accessible, and ends after 20 seconds of use.

## Configure contact delivery

GitHub Pages and unconfigured normal hosting use FormSubmit's managed HTTPS form backend, addressed to `joehanantony@gmail.com`. No browser API key or Pages configuration change is needed. Confirm the recipient once using FormSubmit's "Activate Form" email. An activation-required response is treated as unavailable, never as successful delivery. Automated tests intercept delivery requests and do not send email.

The existing server-side Resend API remains available for normal hosting. To use it instead, copy .env.example to .env.local and set:

- RESEND_API_KEY
- CONTACT_FROM — an address on a verified Resend sending domain
- UPSTASH_REDIS_REST_URL
- UPSTASH_REDIS_REST_TOKEN
- NEXT_PUBLIC_SITE_URL — the final HTTPS origin

The contact API checks same-origin requests, JSON format, a 16 KB payload ceiling, Zod validation, and a honeypot. Upstash supplies a shared limit of five attempts per hour. It uses Vercel’s overwritten client-IP header only on Vercel; other hosts use a conservative shared bucket. A limiter outage fails closed. No visitor text is used as HTML. Missing credentials never produce a delivered-message claim.

Without these server settings, the form submits to FormSubmit. Client validation trims names/messages and enforces field limits; the existing honeypot is discarded locally and mapped to the managed provider's `_honey` field. FormSubmit supplies its own submission validation and spam filtering; browser validation and the local honeypot are not server-side abuse controls. Resend hosting retains its existing server validation and Upstash limit. The visitor email is used as Reply-To, never as the destination. Submissions time out after 15 seconds, cannot overlap, and retain entered values on failure. Success requires an explicit provider acknowledgement; it indicates acceptance for processing, not independently verified arrival in the recipient's inbox. The mailto fallback stays available. FormSubmit processes the submitted name, email and message and documents a 30-day submission retention period at https://formsubmit.co/documentation.

If JavaScript is unavailable, the form's native POST action uses FormSubmit's standard endpoint and confirmation page. Visitor details are submitted in the request body rather than placed in the page URL.

Set NEXT_PUBLIC_ENABLE_ANALYTICS=true only after deployment if you want Vercel Analytics and Speed Insights. They are disabled by default.

## Deploy to Vercel

```sh
pnpm dlx vercel login
pnpm dlx vercel --prod
```

Set the environment variables in the Vercel project and redeploy. If NEXT_PUBLIC_SITE_URL is absent, metadata uses Vercel’s production project hostname; local development falls back to localhost:3000. Rerun performance and accessibility checks against the public deployment. A local audit is not evidence of deployed performance.

## Fonts and internationalisation

Switzer and Gambetta are self-hosted from Fontshare; JetBrains Mono is self-hosted from Google Fonts. See FONT-SOURCES.md. Gambetta appears in the manifesto and About opening only.

English content is separated from UI code and the document declares its language. Additional locale bundles and locale-prefixed routes can be added when translations are supplied; no untranslated locale routes are advertised.

See QA-REPORT.md for measured results, known limitations, and prioritised follow-up work.

## Reproduce the fluidity audit

With the production server running, run `node scripts/frame-audit.mjs current`. This records three five-second scroll samples using the same viewport and CDP input. The report measures main-thread RAF pacing and style/layout/script time; it does not claim physical display FPS. Run `node scripts/bundle-budget.mjs` for initial gzip size and `node scripts/audit.mjs` for a local mobile Lighthouse audit. Avoid running browser suites concurrently with performance audits.
"# Portfolio" 
"# Portfolio" 


## GitHub Pages

The existing design is preserved. Run `pnpm build:pages` to generate `out/` for https://joehan7.github.io/Portfolio/. The build sets `/Portfolio`, exports all nine pages and sharing images, retains the custom 404, and verifies the artifact. `pnpm dev`, `pnpm build`, and `pnpm start` continue using ordinary server hosting without a base path.

In the repository's Settings → Pages, select **GitHub Actions** as the source. `.github/workflows/pages.yml` deploys on `main` pushes or manual dispatch. The existing quality workflow remains separate. No deployment secrets are needed.

GitHub Pages cannot execute `/api/contact`. The existing contact form submits directly to FormSubmit over HTTPS, retaining its email-link fallback and honest handling of activation, rejection, and transport failures. The server API source remains available in normal builds. Do not put server credentials in public build variables.

For repository-path browser checks, run `pnpm exec playwright test --config=playwright.pages.config.ts` after exporting; this serves the actual static artifact on port 3002. The Firefox project remains enabled. `node scripts/serve-pages.mjs` previews the export at http://127.0.0.1:3002/Portfolio/.

See the deployment report supplied with this delivery for the exact diff, validation results, limitations, and commit/push commands.
