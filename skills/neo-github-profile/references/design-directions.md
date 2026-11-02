# Design directions

## Hero directions that tested well

| Direction | Look | Scripted |
|---|---|---|
| Session | Terminal window typing `whoami`, `cat role.txt`, `ls ~/projects` line by line | `--template session` |
| Masthead | 56px name, a hairline that draws in and ends in a pulsing heatmap cell, right-aligned stack index | `--template masthead` |
| Undergrowth | Radial green/teal bloom, film grain, slow orbit rings | No, hand-author it |

## Direction → config mapping

| Interview answer | Hero `--template` | Sections |
|---|---|---|
| Upgrade current | session | user's existing order, assets swapped |
| Terminal/hacker | session | neofetch + heatmap on, glyph style offered |
| Editorial minimal | masthead | neofetch off, ASCII off |

## Rejected, and why

- Flat box + faint grid + clip-art node graph + dead space: reads as a template
- Purple/blue gradient blobs: generic AI look
- Rainbow badge walls: noise, no signal
- "👋 Hi there": every profile has it
- capsule-render waves: dated, hosted, off-palette

## Section catalog and layout

- Content width is 846px.
- Neofetch (300) + heatmap (470) side by side in a two-column `<table>`.
- Projects: 2 columns, 400px thumbnails, each with outcome line, tags, links.
- Stack: 8 badges max, or one skillicons line.
- Headings: `<h3>` only.

## Palette

Dark: `#0d1117` bg, `#161b22` surface, `#30363d` border, `#e6edf3` text, `#7d8590` muted, accent `#39d353` / `#26a641`.

Light heatmap scale: `#ebedf0` `#9be9a8` `#40c463` `#30a14e` `#216e39`.

All colours live in `scripts/_palettes.json`; never inline hex in a renderer.

### Light palettes

Set `light_theme` in the config. Every light card gets a tinted body, a titlebar strip, a 1 px border and ≥ 4.5:1 green text; bright green is for cursors, cells and bars only.

- `light` (Primer, default): `#f6f8fa` cards, `#1a7f37` prompt. Blends with GitHub's own chrome; the safe pick.
- `light-warm` (Solarized): `#fdf6e3` paper cards, olive `#3d6b16` prompt. Pick for a warm, printed, editorial feel.
- `light-cool` (Latte): `#eff1f5` lavender-grey cards, `#2e7d32` prompt. Pick when the user likes Catppuccin.

## Animation rules

- SMIL or CSS inside the SVG only. No JS.
- Entrances end held: `fill="freeze"` (SMIL) or `animation-fill-mode: forwards` (CSS).
- One looping micro-motion per asset, max.
- Typewriter: `clip-path: inset()` animated with `steps(n)`.
- Heatmap reveal: diagonal sweep, overshoot `cubic-bezier(.34,1.56,.64,1)`, each cell flashes green then settles to its real shade.
- Always include `@media (prefers-reduced-motion: reduce)` showing the final state.
