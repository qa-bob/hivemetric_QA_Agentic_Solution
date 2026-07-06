---
mode: agent
description: Analyze site.config.json's target site and generate/update the full POM + test suite.
---

Follow the workflow in
[`.claude/commands/generate-full-suite.md`](../../.claude/commands/generate-full-suite.md)
verbatim: read `site.config.json`, discover the site's real structure, write/update
Page Object classes in `src/pages/`, and write the smoke/navigation/forms/functional/
visual/responsive test files. Finish by running `npx tsc --noEmit` and fixing any
errors.
