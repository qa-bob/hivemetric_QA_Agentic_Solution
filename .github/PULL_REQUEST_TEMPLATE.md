## What changed and why

<!-- Summarize the change. Link an issue if there is one. -->

## Checklist

- [ ] No form was submitted, no account was created, no real credentials were used
- [ ] Every new/changed test is tagged with at least one of `@smoke @navigation @forms
      @functional @visual @responsive`
- [ ] No hardcoded URLs — everything resolves through `site.config.json` / `baseURL`
- [ ] Page Object methods contain no `expect()` calls
- [ ] No `page.waitForTimeout()` was introduced
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes locally (or the relevant `npm run test:<suite>` subset)
- [ ] If this changes the site's visible design, baselines were regenerated with
      `npm run baseline` and the new screenshots were reviewed before committing
