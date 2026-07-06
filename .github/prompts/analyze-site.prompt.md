---
mode: agent
description: Crawl the live site and report a fully-populated site.config.json plus an issues checklist.
---

Follow the workflow in [`.claude/commands/analyze-site.md`](../../.claude/commands/analyze-site.md)
verbatim: fetch the URL from `site.config.json` (or the one given as an argument),
inspect its structure, and output a completed `site.config.json` JSON block followed
by an "Issues found" checklist.
