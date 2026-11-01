# Pages terminal site

One self-contained `site/index.html` (inline CSS/JS, system fonts, zero deps) that embeds the config, a data snapshot and the ASCII frames, and ships to `<u>.github.io`.

## Commands

| Command | Does |
|---|---|
| `whoami` / `about` | Positioning, role, bio |
| `projects` / `ls`, `open <name>` | Project list; open a link |
| `stack` / `skills` | Stack from config |
| `contributions` / `graph` | Canvas heatmap; count-up lands on `total` |
| `streak` | Current and longest streak |
| `mascot` / `photo` | ASCII frames typed line by line |
| `neofetch` | Neofetch card |
| `contact` | Links |
| `matrix` | Toggle rain |
| `help`, `clear`, `history` | Housekeeping |

↑/↓ history, Tab completion, Ctrl+L. Mobile chips. `?cmd=<name>` deep link runs a known command after boot (README stack icons use `?cmd=stack`); unknown values are ignored. `prefers-reduced-motion` respected. All strings escaped.

## Mascot rendering rules

- `.asc` is `white-space:pre` (never wraps); `fitAscii` measures the real glyph advance, sizes the font to `#out` (4.5–11 px) and sets `line-height = charW × cellH/cellW` so the cell aspect equals the SVG's (`ASCII` from `data-*` or derived).
- Per-row reveal, `rows × 60 ms` ≈ 3 s/frame, hold 2.5 s; the next frame types over the last.
- Esc / any command snaps the current frame complete; `clear` just stops.
- No frames → `mascot` hidden from help and chips.

## Data flow

1. Embedded snapshot renders instantly.
2. At load it fetches `https://raw.githubusercontent.com/<u>/<u>/main/data/github.json`, refreshed daily by the profile Action.
3. Never the GitHub API. No tokens.

## Customise

- `site.live_data_url` in config overrides the fetch URL.
- Projects, links and stack come from `profile.config.json`, so the README and site stay in sync.

## Pages

Auto-enables for `<u>.github.io`. If `gh api repos/<u>/<u>.github.io/pages` still returns 404 after a minute:

```bash
gh api -X POST repos/<u>/<u>.github.io/pages -f build_type=legacy -f 'source[branch]=main' -f 'source[path]=/'
```

Live at `https://<u>.github.io/` in ~2 min. `selftest.mjs` covers it as the `site` artifact.

## Verify

1. Open the URL, run `contributions`, confirm the `data: live (<date>)` line.
2. Test at 390 px width.
