# Copilot Instructions — Hivemetric QA Agentic Solution

This repo is a Playwright + TypeScript regression suite for
[hivemetric.com](https://www.hivemetric.com/), using the Page Object Model (POM)
pattern. It's the Copilot-facing mirror of [`CLAUDE.md`](../CLAUDE.md) — keep the two
in sync when conventions change.

## Do not

- Submit any form, create an account, or enter real credentials.
- Hardcode the base URL in a test — always resolve through `site.config.json` /
  Playwright's `baseURL`.
- Put `expect()` assertions inside a Page Object method.
- Use `page.waitForTimeout()` — use `waitForSelector`, `waitForLoadState`, or
  Playwright's auto-waiting instead.
- Use `any` without a comment explaining why.

## Always

- Extend `BasePage` (`src/pages/base.page.ts`) for every new Page Object; declare
  locators as `readonly Locator` properties; expose methods that represent user
  actions, not assertions.
- Import `test`/`expect` from `src/fixtures/site.fixture.ts` in every spec file, not
  directly from `@playwright/test`.
- Tag every test with at least one of `@smoke @navigation @forms @functional @visual
  @responsive`.
- Inspect the *live* site before writing a selector — this site has no traditional
  `<nav>` or `<form>`, so generic selectors guess wrong. Prefer real `id`/class
  selectors discovered from the actual HTML over invented "common pattern" selectors.
- Run `npx tsc --noEmit` and `npm run lint` before considering a change done.

## Where things live

See [`README.md`](../README.md) for the full repo layout, setup steps, and npm
scripts. See [`AGENT.md`](../AGENT.md) / [`SKILLS.md`](../SKILLS.md) for the
Claude Code subagents and skills this repo also ships — `.github/chatmodes/` and
`.github/prompts/` are their Copilot-equivalent mirrors.
