# Hivemetric — QA Agentic Solution

Automated regression test suite for **[hivemetric.com](https://www.hivemetric.com/)**,
built with Playwright + TypeScript using the Page Object Model (POM) pattern, and
structured for agentic execution by Claude Code.

## What this repo tests

Hivemetric's marketing site is a **single scrolling page** (Next.js) — there's no
multi-page routing. Four sections make up the whole site:

| Section | id | What's there |
|---|---|---|
| Hero | `#home` | Headline, subtext, "Contact Us" (Intercom chat) and "Case Studies" CTAs |
| Our Approach | `#vision` | Six methodology principles (Discovery, Design, Implementation, Measurement, Quality, Defence-in-Depth) |
| Case Studies | `#case-studies` | Impact metrics and four project write-ups (CDC, NYC Health, a non-profit CRM, Dishful) |
| Our History | `#history` | Company narrative + photo |

There is **no contact form** — "Contact Us" launches an Intercom chat widget, and the
footer exposes a `mailto:`/`tel:` link instead. `site.config.json` reflects this
(`hasContactForm: false`, `skipForms: true`); `tests/forms/contact-form.spec.ts` exists
purely as a regression guard in case a real form is ever added.

Everything the suite knows about the target site — URL, expected sections, whether to
run form/visual tests — lives in [`site.config.json`](./site.config.json). Nothing in
`playwright.config.ts` or the tests hardcodes the URL.

## Setting up your dev environment

```bash
# 1. Install dependencies
npm install

# 2. Install the Playwright browser binaries
npx playwright install chromium

# 3. Copy the env template if you need to override the target URL locally
cp .env.example .env
```

Requirements: Node.js 18+, npm. No account, API key, or `.env` value is required to
run the suite against the live site — `SITE_URL` in `.env` only matters if you want to
point the suite at a staging environment instead.

### Running the suite

```bash
npm test                    # everything
npm run test:smoke          # @smoke only — fast sanity check
npm run test:navigation     # @navigation
npm run test:forms          # @forms
npm run test:visual         # @visual (requires baselines — see below)
npm run test:responsive     # @responsive
npm run test:headed         # any of the above with a visible browser
npm run report              # open the last HTML report
```

`tests/functional/` (business content: hero, approach, case studies, history, the
Intercom contact mechanism) doesn't have its own npm script — run it with
`npx playwright test --grep @functional`, or as part of `npm test`.

Visual regression baselines are **not** committed (`__snapshots__/` is gitignored) —
the first run of `@visual` writes them locally. After an intentional design change,
run `npm run baseline`, review the new screenshots, then `git add __snapshots__/` if
your team decides to commit baselines (see `.claude/commands/update-baseline.md`).

Before opening a PR:

```bash
npx tsc --noEmit    # or: npm run typecheck
npm run lint
```

## Repo layout

```
site.config.json           # target URL + feature flags — read by playwright.config.ts and the tests
playwright.config.ts       # desktop / mobile-chrome / tablet projects
src/
  pages/                    # Page Object Model classes (base.page.ts + home/navigation/contact)
  fixtures/site.fixture.ts  # test + expect re-export with page objects wired up
  utils/                    # link-checker, visual-helper
  types/site-config.types.ts
tests/
  smoke/        @smoke        availability, load time, console errors, HTTPS, meta
  navigation/   @navigation   footer Quick Links, hero CTA, external/contact links
  forms/        @forms        regression guard — asserts no <form> exists
  functional/   @functional   hero, our-approach, case-studies, history, contact mechanism
  visual/       @visual       full-page screenshots per viewport
  responsive/   @responsive   overflow, font size, alt text, breakpoint behavior
.claude/                    # Claude Code project config — see AGENT.md / SKILLS.md
.github/                    # CI + Copilot-equivalent instructions — see below
```

## Contributor rules

This repo's binding instructions for any contributor (human or agent) live in
[`CLAUDE.md`](./CLAUDE.md). The short version:

- **Never submit a form, create an account, or enter real credentials.** Field/validation
  testing only.
- **Page Object Model, strictly.** Every page/section gets a class in `src/pages/`
  extending `BasePage`; locators are `readonly Locator` properties; methods are user
  actions, not assertions. `expect()` calls belong in test files, never in page objects.
- **Tag every test** with at least one of `@smoke @navigation @forms @functional
  @visual @responsive`.
- **No hardcoded URLs** — always resolve through `site.config.json` / `baseURL`.
- **No `page.waitForTimeout()`** — use `waitForSelector`/auto-waiting/`waitForLoadState`
  instead. (`BasePage.waitForLoad()` intentionally bounds its `networkidle` wait
  rather than sleeping, since Intercom/analytics keep connections open indefinitely.)
- **TypeScript strict mode** — run `npx tsc --noEmit` clean before finishing.
- Before writing or updating selectors, inspect the *live* site (WebFetch, or `curl`
  the raw HTML) rather than guessing generic class names.

## Agentic tooling in this repo

This repo is set up for Claude Code and ships project-scoped subagents and skills:

- **[`AGENT.md`](./AGENT.md)** — the two custom subagents (`site-analyzer`,
  `test-generator`) in `.claude/agents/`, what they do, and when to add a new one.
- **[`SKILLS.md`](./SKILLS.md)** — the five slash commands/skills (`/analyze-site`,
  `/generate-full-suite`, `/run-smoke`, `/update-baseline`, `/generate-report`) in
  `.claude/commands/`.
- **`.claude/settings.json`** — project permissions and the `pre-test.sh` hook, which
  checks site reachability before any `npm run test*` command.
- **`.claude/hooks/pre-test.sh`** — the reachability check itself.

### What's in `.github/`

`.github/` mirrors the same four concepts for **GitHub Copilot** (or any tool that
reads Copilot's customization files), so non-Claude-Code contributors get equivalent
guidance, plus standard CI/PR scaffolding:

| Concept | Claude Code | Copilot equivalent |
|---|---|---|
| Instructions | `CLAUDE.md` | `.github/copilot-instructions.md` |
| Rules (path-scoped) | `.claude/rules/*.md` | `.github/instructions/*.instructions.md` |
| Skills | `.claude/commands/*.md` | `.github/prompts/*.prompt.md` |
| Agents | `.claude/agents/*.md` | `.github/chatmodes/*.chatmode.md` |

Plus standard repo scaffolding: `.github/workflows/playwright.yml` (CI — runs the
suite on every PR) and `.github/PULL_REQUEST_TEMPLATE.md` (a checklist mirroring the
contributor rules above). Keep both instruction sets in sync when the testing
conventions change — update `CLAUDE.md`/`.claude/rules/` and the corresponding
`.github/` file together.
