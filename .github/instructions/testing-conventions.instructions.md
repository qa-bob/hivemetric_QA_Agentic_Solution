---
applyTo: "tests/**/*.ts"
---

# Test File Rules

- Import `test`/`expect` from `@fixtures/site.fixture`, never `@playwright/test`
  directly, so every test gets the pre-wired page objects and `siteConfig`.
- Tag every `test()` (in its title string) with at least one of: `@smoke`
  `@navigation` `@forms` `@functional` `@visual` `@responsive`.
- Never submit a form, click a real submit button that would send data, create an
  account, or enter real credentials — this site has no form at all, so
  `tests/forms/contact-form.spec.ts` only guards that assumption still holds.
- Gate whole suites on the relevant `site.config.json` flag (`skipForms`,
  `skipVisual`) via `test.skip(...)` in a `beforeEach`, not by deleting tests.
- When an element is hidden at some viewports by design (e.g. Tailwind
  `hidden md:block`), check actual rendered visibility (`locator.isVisible()`) before
  deciding whether to skip, rather than hardcoding a pixel-width threshold — emulated
  devices don't always round viewport width the way you'd expect.
- No `page.waitForTimeout()`. If a site keeps background connections open forever
  (chat widgets, analytics), bound the wait instead of removing it (see
  `BasePage.waitForLoad()`).
