# GitHub README rules

## Sanitizer

- Kept: `<img>`, `<picture>`, `<source>`, `<a>`, `<table>`, `<p align>`, `<h3>`, `<br>`, `<details>`, `width`/`height` attributes.
- Stripped: `<script>`, `<style>`, inline `style=`, event handlers, `<iframe>`, most `class` and `id` use.
- All motion must live inside SVG files embedded with `<img>`.

## Theming

Every self-rendered asset (hero, ASCII, neofetch, heatmap) needs both sources; a bare dark `<img>` stays dark in light mode.

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/hero.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/hero-light.svg">
  <img src="assets/hero.svg" width="846" alt="…">
</picture>
```

## Images and animation

- Images go through the camo proxy, which caches. Repo-relative paths update on commit.
- SVG SMIL and internal CSS animations play inside `<img>`. External fonts and scripts inside the SVG don't load; embed or use system fonts.

## Layout quirks

- Tables always render cell borders. Plan for them.
- `<h1>`/`<h2>` draw underline rules. Use `<h3>`.

## Data and tokens

- Default `GITHUB_TOKEN` can't read your full `contributionsCollection`. Use a PAT with `read:user` stored as a repo secret.
- Private contributions only count if the user enables "Include private contributions" in profile settings.
- Daily counts don't sum to `totalContributions` (restricted contributions). Scale count-up animations to the total.
- Square-root any bar or column height so one huge day doesn't flatten the rest.

## Workflows

- Commit messages from the refresh Action include `[skip ci]` to avoid loops.
- Platane/snk needs its own workflow and an `output` branch.

## Pins

No write API. The user must pin repos by hand.
