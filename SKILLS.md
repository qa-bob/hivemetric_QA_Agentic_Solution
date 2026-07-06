# SKILLS.md — Skills / Slash Commands in This Repo

This repo defines five project skills as Markdown files in `.claude/commands/`. In
current Claude Code terminology these are "skills" — a file at
`.claude/commands/<name>.md` and a skill at `.claude/skills/<name>/SKILL.md` both
create the same `/<name>` command and behave identically; skills additionally support
a directory of supporting files and invocation-control frontmatter. See the
[skills docs](https://code.claude.com/docs/en/skills) for the full reference. This
file documents only what's specific to this repo.

Unlike a subagent, a skill runs **inline in the main conversation** — it has your full
conversation context, and Claude can trigger it automatically when your request
matches its intent, or you can type `/<name>` to run it directly.

## The five skills in this repo

| Skill | File | What it does |
|---|---|---|
| `/analyze-site` | `.claude/commands/analyze-site.md` | Crawls the live site (or `site.config.json`'s URL) and reports a populated `site.config.json` plus an issues checklist. Thin wrapper around the `site-analyzer` subagent's workflow, runnable directly. |
| `/generate-full-suite` | `.claude/commands/generate-full-suite.md` | The big one: discovers the site's pages/nav/forms/interactive elements, plans and writes Page Object classes in `src/pages/`, and writes the full smoke/navigation/forms/functional/visual/responsive test suite. This is what built out the current `src/pages/*.ts` and `tests/**/*.spec.ts` files against the live Hivemetric site. |
| `/run-smoke` | `.claude/commands/run-smoke.md` | Runs `npm run test:smoke` and prints a clean pass/fail table with suggested fixes per failure type. |
| `/update-baseline` | `.claude/commands/update-baseline.md` | Runs `npm run baseline` to (re)capture visual regression screenshots after an intentional design change, and reminds you to review the diffs before committing. |
| `/generate-report` | `.claude/commands/generate-report.md` | Parses `test-results/results.json` and prints a suite-by-suite pass/fail/flaky summary with next-step suggestions. |

## Typical workflow

```
/analyze-site              # confirm site.config.json still matches the live site
/generate-full-suite        # (re)generate POM + tests if the site changed structurally
npm test                    # or /run-smoke for just @smoke
/generate-report            # summarize the run
/update-baseline            # only after an intentional visual change, then review + commit
```

## Adding a new skill

Create `.claude/commands/<name>.md` (plain instructions, no frontmatter required) or,
for a skill that needs bundled scripts/templates or invocation control
(`disable-model-invocation`, `allowed-tools`, etc.), create
`.claude/skills/<name>/SKILL.md` instead — see the skills docs linked above for the
full frontmatter reference. Either form is committed to version control so the whole
team gets it.
