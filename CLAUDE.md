# Career OS — Your Career Brain

Welcome to Career OS. This file is your rules engine — edit it to customize how Claude works with your career data.

## About You
<!-- Fill in during onboarding -->

## Preferences
- Be direct, no fluff
- Always update career data after conversations

## Memory
<!-- Hot cache: top contacts, terms, active pipeline -->
<!-- Full data lives in .career-os/memory/ -->

## Plugin Boundary Rules

Career OS is managed by a plugin. These rules protect plugin-managed files
from being modified by agents working in this workspace.

### Plugin-Managed (DO NOT MODIFY)

These paths are owned by plugin hooks and migrations. Agents MUST NOT create,
rename, restructure, or change the format of files here.

| Path | Owner | Why |
|------|-------|-----|
| `.career-os/ledger/` (except `ledger/stats/`) | session-logger hooks | Append-only. Hooks write every exchange here. |
| `.career-os/config/` | plugin migrations | Version tracking. Migrations read/write this. |
| `.career-os/logs/` | hooks | Error logging. Hooks write here on failure. |
| `.career-os/scripts/` | plugin installer | Query scripts deployed by plugin. Do not modify. |

### .career-os/ Boundary Rule

Do not modify files under `.career-os/` directly. Use Career OS skills.
If no Career OS skill exists for the task → ask user permission before changes.

See `.career-os/README.md` for which skill owns what and how to invoke them.
Each skill's `SKILL.md` frontmatter is the authoritative source for what it reads and writes.

### Skills live in the plugin — not here

Do NOT create skill files, kernel files, or hook scripts in this workspace.
All skills are defined in the plugin repo and versioned through its CI pipeline.

If you find a bug or want to change skill behavior:
1. Write a spec or bug report to the relevant WIP folder (e.g., `WIP/career-os-product/`)
2. NEVER modify plugin source from this workspace
3. Implementation happens in the plugin repo, not here
