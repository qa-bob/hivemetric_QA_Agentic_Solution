---
mode: agent
description: Summarize the last test run — pass/fail/flaky counts by suite, with next steps.
---

Follow the workflow in
[`.claude/commands/generate-report.md`](../../.claude/commands/generate-report.md)
verbatim: parse `test-results/results.json`, print the per-suite summary table, list
failed/flaky tests with their errors, and suggest next steps.
