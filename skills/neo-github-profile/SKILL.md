---
name: neo-github-profile
description: "Use when the user mentions a GitHub profile README, their GitHub profile, an animated README, a contribution graph or heatmap, a neofetch card, an ASCII portrait, pinned repos, a profile audit, or asks to make their GitHub look professional."
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
---

# Neo GitHub Profile

Turns any GitHub login into an animated, professional profile README built from the user's live data. Core principle: **real data, repo-committed assets, mockup before ship**.

## Prerequisites

- `gh auth status` succeeds
- Node 18 or newer
- `python3` for the ASCII portrait (Pillow optional, improves sampling)
- `npx playwright` optional, for screenshots

Commands run from a working directory; `<skill>` is this skill's path. With `--out` omitted, every script writes its canonical path (see quick reference), and `build-readme.mjs` expects exactly those names, warning about missing ones.

## Process

1. **Audit.** `node <skill>/scripts/audit.mjs --user <login>` then `node <skill>/scripts/fetch-contributions.mjs --user <login>`. Read the gaps; see `references/audit.md`.
2. **Interview.** REQUIRED SUB-SKILL: use grill-me style, one question at a time, each with a recommended default. The question tree lives in `references/interview.md`. Ask for mascot, logo or photo sources for ASCII frames. None? Fall back to the GitHub avatar and offer the GitHub mark or a wordmark. Copy `<skill>/templates/profile.config.example.json` to `profile.config.json` and fill it in.
3. **Selftest.** Run `node <skill>/scripts/selftest.mjs` once per machine.
4. **Build assets.** Pick a direction from `references/design-directions.md`, then:
   ```bash
   LIGHT=$(node -p 'require("./profile.config.json").light_theme||"light"')
   for t in dark "$LIGHT"; do   # theme "dark" only? skip light
     node <skill>/scripts/render-hero.mjs --config profile.config.json --template session --theme $t
     node <skill>/scripts/render-neofetch.mjs --config profile.config.json --data data/github.json --audit data/audit.json --theme $t
     node <skill>/scripts/render-heatmap.mjs --data data/github.json --style square --theme $t
     python3 <skill>/scripts/render-ascii.py --config profile.config.json --theme $t
   done
   node <skill>/scripts/render-shots.mjs --config profile.config.json
   ```
5. **Mockup.**
   ```bash
   node <skill>/scripts/build-readme.mjs --config profile.config.json --data data/github.json --audit data/audit.json --out README.md
   node <skill>/scripts/build-mock.mjs --config profile.config.json --readme README.md --audit data/audit.json --screenshot mock.png --delay 8
   node <skill>/scripts/build-mock.mjs --config profile.config.json --readme README.md --audit data/audit.json --screenshot mock-mid.png --delay 1.5
   ```
   Show both: settled and mid-animation (proves motion). Iterate until approved.
6. **Recommend.** Give tiered advice using `references/recommendations.md`.
7. **Ship.** **HARD GATE: never write to GitHub until the user says yes to a mockup they have seen.** Commit `README.md`, `profile.config.json`, `assets/`, `data/`, `scripts/` and `.github/workflows/refresh.yml` (plus `snake.yml` if chosen) to `<user>/<user>`; not `frames/` or `mock.*`. Push over HTTPS (`gh auth setup-git`) if SSH keys are not set up. Trigger `refresh.yml` once and confirm it is green. Update the bio with `gh api -X PATCH /user -f bio="..."` only with explicit consent. Pins have no write API, so tell the user which repos to pin.
8. **Pages terminal (optional).** Offered as the last interview question. Only after step 7 is live (the site reads the profile repo's data). See `references/site.md`.
   ```bash
   node <skill>/scripts/build-site.mjs --config profile.config.json --data data/github.json --audit data/audit.json --ascii assets/ascii-portrait.svg --out site/index.html
   cd site && git init -b main && touch .nojekyll && git add -A && git commit -m "feat: interactive terminal site" && gh repo create <u>/<u>.github.io --public --source=. --remote=origin --push
   ```
   Same HARD GATE: show `site/index.html` locally first.

GitHub sanitizer details are in `references/github-readme-rules.md`.

## Quick reference

| Artifact | Script | Key flags | Output |
|---|---|---|---|
| Audit | `audit.mjs` | `--user` | `data/audit.json` |
| Contribution data | `fetch-contributions.mjs` | `--user` | `data/github.json` |
| Heatmap | `render-heatmap.mjs` | `--data --style square\|glyph --theme --prompt` (default `<user>@github`) | `assets/heatmap[-glyph]-<dark\|light>.svg` |
| Palettes | `scripts/_palettes.json` | `--theme dark\|light\|light-warm\|light-cool`; any light writes `-light` | config `light_theme` |
| ASCII portrait | `render-ascii.py` | `--config` (or PNGs) `--theme` `--cols --rows --row --hold` | `assets/ascii-portrait[-light].svg` |
| Hero | `render-hero.mjs` | `--config --template session\|masthead --theme` | `assets/hero[-light].svg` |
| Neofetch card | `render-neofetch.mjs` | `--config --data --audit --theme` | `assets/neofetch[-light].svg` |
| Project thumbnails | `render-shots.mjs` | `--config` | `assets/shots/` |
| README | `build-readme.mjs` | `--config --data --audit` | `README.md` |
| Activity block | `update-activity.mjs` | `--user --readme` | edits `README.md` |
| Mockup | `build-mock.mjs` | `--config --readme --audit --screenshot --color-scheme` | `mock.html` |
| Terminal site | `build-site.mjs` | `--config --data --audit --ascii --out` | `site/index.html` |
| Daily refresh | `templates/refresh.yml` | cron `17 6 * * *`, `[skip ci]` | `.github/workflows/` |

## Common mistakes

- Bare `<img>` on GitHub links to itself — always wrap icon rows.
- Project cards need a thumbnail, an outcome line, tags and links. "Minimal" cards that drop detail get rejected.
- Hosted stat widgets return 402 or go down. Commit SVGs to the repo instead.
- `<h1>` and `<h2>` add underline rules. Use `<h3>`.
- Inline `style=` is stripped.
- GitHub tables always render cell borders. Design with them.
- Heatmap colors must come from GitHub's own `contributionLevel`, never invented buckets.
- A "0 day streak" looks bad. Show the longest streak instead.
- Photo avatars render fine at 66×48; flat mascots need edge sampling (already the default).
- Every animated SVG needs a `prefers-reduced-motion` fallback.
- HTML doesn't inherit SVG text behaviour: `<pre>` has no `textLength`/`xml:space`. Measure the font and lock the cell aspect.
- The site must never call the GitHub API from the browser. Read the committed JSON via raw.githubusercontent.com; no tokens, no rate limits.
- Playwright MCP blocks `file://`. Serve with `python3 -m http.server`.
- Playwright defaults to light. With `theme: both`, screenshot both schemes (`--color-scheme`).
- macOS filesystems are case-insensitive: if the profile repo already has `Assets/`, a plain `git add` files the new `assets/` under the old name and every README link breaks on GitHub. Stage the lowercase paths explicitly (`git update-index --add --cacheinfo`) or rename the old directory first.
- Verify on github.com after shipping, not only the mock: hosted widgets fail on launch day and skillicons renders unknown ids blank.

## Red flags

- Pushing to `<user>/<user>` without an approved mockup
- Changing the bio without asking
- Any fake or placeholder number in an asset
- More than one looping animation per asset
- Adding a hosted widget "just for now"
