# Interview

Grill-me style. ONE question at a time, each with a recommended default and a one-line reason. Skip branches the audit already answers. Mark every derived proposal as a guess the user must confirm.

**Missing descriptions** (Q1, Q11): read the README head, `gh api repos/<u>/<r>/readme -H 'Accept: application/vnd.github.raw' | head -40`, and propose a one-liner.

## Decision tree

1. **Positioning line.** Propose one from the 3 most recent non-fork repos. Why: recent work is what visitors judge.
2. **Alias.** Default: GitHub handle.
3. **Role.** Default: company + most-used language, e.g. "CEO @ Vercel" or "TypeScript developer".
4. **Stack.** Default: top 3 languages from the audit; user may swap in frameworks or tools.
5. **Audience.** Default: recruiters and collaborators. Why: favors outcomes over trivia.
6. **Direction.** Default: upgrade current. Why: keeps what works.
   - upgrade current: keep the user's section order, swap in new assets
   - terminal/hacker: session hero + neofetch + heatmap, glyph style offered
   - editorial minimal: masthead hero, no neofetch, no ASCII
7. **ASCII frames.** Mascot PNGs, logos, photo? Ask which to exclude. Fallbacks:
   - avatar: `curl -sL "https://github.com/<u>.png?size=460" -o frames/01-avatar.png` (may be a JPEG despite `.png`; fine)
   - GitHub mark: render the octicon path to PNG with `qlmanage -t -s 512` or Pillow
   - wordmark: name or alias in a heavy sans
8. **Sections.** Defaults: [x] hero, [x] socials, [x] about + ASCII, [x] neofetch + heatmap, [x] projects with thumbnails, [x] stack icons, [ ] stats (hosted widgets fail), [ ] snake, [x] activity.
9. **Theme.** Default: both via `<picture>`. Why: light-mode visitors otherwise see a black slab.
10. **Links.** Default: what the audit found. If a Twitter URL sits in `blog`, propose moving it.
11. **Projects.** Default: top 4 recent non-fork repos. Ask for demo URLs and one outcome line each.
12. **Motion.** Default: standard (entrances plus one micro-loop per asset).
13. **Automation.** Daily refresh Action? Default: yes.
14. **Ship scope.** Default: README only; bio only with explicit consent.
15. **Pages terminal site?** Default: yes if the user has no personal site, else ask. `<u>.github.io` hosts one user site; if that repo already exists, add the terminal as `terminal.html` there instead.

## Stopping rule

Stop when every branch is resolved. Write answers into `profile.config.json` (including `frames[]` and `ascii{}`) and build assets.
