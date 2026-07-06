---
applyTo: "src/pages/**/*.ts"
---

# Page Object Model Rules

- Every page or major section gets its own class in `src/pages/`, extending
  `BasePage` from `./base.page`.
- Locators are `readonly Locator` (or typed helper) properties initialized in the
  constructor or as class field initializers — not re-queried ad hoc inside methods,
  unless the element only exists conditionally (e.g. carousel items by index).
- Methods represent **user actions** (`clickX`, `fillY`, `scrollToZ`) or **structured
  content extraction** (`getApprovalPrinciples(): Promise<X[]>`). Never put
  `expect()`/assertions in a page object — that belongs in the test file.
- Prefer real selectors discovered from the live site's actual HTML (ids, stable
  classes, `getByRole`) over generic guesses. This site has no `<nav>` and no
  `<form>` — do not assume either exists when writing a new page object.
- If a generic/fallback method (e.g. `getMainHeading()`, `getCTAButtons()`) is useful
  across many hypothetical sites, it's fine to keep it alongside site-specific
  methods, but site-specific methods should use precise selectors, not heuristics.
