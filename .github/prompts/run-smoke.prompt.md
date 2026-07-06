---
mode: agent
description: Run the smoke suite and report a clean pass/fail table with suggested fixes.
---

Follow the workflow in [`.claude/commands/run-smoke.md`](../../.claude/commands/run-smoke.md)
verbatim: run `npm run test:smoke`, parse `test-results/results.json`, and print the
pass/fail table with suggested fixes per failure type.
