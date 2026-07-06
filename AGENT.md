# AGENT.md — Custom Subagents in This Repo

This repo defines two project-scoped **Claude Code subagents** in `.claude/agents/`. A
subagent is a Markdown file with YAML frontmatter that gets its own isolated context
window, its own tool access, and (optionally) its own model — Claude delegates to it
automatically when a request matches its `description`, or you can invoke it by name.

See the [official subagents docs](https://code.claude.com/docs/en/sub-agents) for the
full frontmatter reference. This file documents only what's specific to this repo.

## How a subagent file is structured

```markdown
---
name: kebab-case-name       # required, must be unique, matches Agent(name) permission rules
description: ...            # required — Claude matches requests against this text
tools: Read, Grep, Glob      # optional allowlist; omit to inherit every tool
model: inherit               # optional — sonnet | opus | haiku | fable | inherit
---

<system prompt / instructions the subagent follows>
```

If `name`/`description` are missing, Claude Code does **not** register the file as a
subagent at all — it just becomes an inert Markdown file. (This repo shipped with that
exact bug until it was fixed: both agents below were missing frontmatter and did not
appear in the available agent list.)

## The two agents in this repo

### `site-analyzer`

**File:** `.claude/agents/site-analyzer.md`
**Tools:** `WebFetch, Bash, Read, Grep, Glob` (read-only — it reports findings, it
doesn't write files)

Crawls the live site named in `site.config.json` and reports a fully-populated
`site.config.json` you can drop in, plus a checklist of issues found (missing meta
description, broken nav links, no HTTPS, etc.). Use it:

- When onboarding a brand-new company site into this framework
- After a redesign, to check whether `site.config.json` is stale
- Directly via the `/analyze-site` skill, which wraps the same workflow

### `test-generator`

**File:** `.claude/agents/test-generator.md`
**Tools:** `Read, Write, Edit, Grep, Glob, Bash` (writes files, unlike `site-analyzer`)

Reads the populated `site.config.json` and writes **site-specific** Playwright spec
files to `tests/custom/`, plus any new Page Object methods those specs need. Use it
for coverage the shared framework doesn't generate automatically — a pricing
calculator, a demo-request flow, a bug-specific regression test — following the same
POM/tagging conventions as the rest of the suite (see the root `CLAUDE.md`).

## When to add a new subagent vs. a skill

Roughly: reach for a **subagent** when the work produces a lot of intermediate noise
you don't want in the main conversation (crawling dozens of pages, reading long log
output) and should return only a summary. Reach for a **skill** (see `SKILLS.md`) when
you want a repeatable *procedure* that runs inline in the main conversation, with full
context of what you've already discussed. Everything else being equal, prefer a skill
— it's simpler and has no isolation overhead.

## Adding a new agent

1. Create `.claude/agents/<name>.md` with `name` + `description` frontmatter at
   minimum (add `tools`/`model` to constrain it).
2. Restart Claude Code if `.claude/agents/` didn't already exist in this session (the
   directory watcher only picks up new files in directories that existed at startup).
3. Commit it — project subagents are meant to be shared via version control.
