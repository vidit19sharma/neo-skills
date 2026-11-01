#!/usr/bin/env node
// Offline self-test: synthetic data → every renderer → XML/HTML validation. No gh, no network.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SKILL, TEMPLATES } from "./_lib.mjs";

if (process.argv.includes("--help")) { console.log("Usage: node selftest.mjs   (offline; writes to $TMPDIR/neo-github-profile-selftest/)"); process.exit(0); }
const T = join(tmpdir(), "neo-github-profile-selftest");
rmSync(T, { recursive: true, force: true });
mkdirSync(join(T, "data"), { recursive: true });

// Config: example, minus demo URLs so render-shots stays on the SVG path.
const cfg = JSON.parse(readFileSync(join(TEMPLATES, "profile.config.example.json"), "utf8"));
cfg.projects.forEach((p) => delete p.demo);
cfg.sections.snake = true; cfg.sections.stats = "hosted";
writeFileSync(join(T, "profile.config.json"), JSON.stringify(cfg, null, 2));

// Deterministic 365-day calendar (LCG seed 42), ending "today" = 2026-10-31.
let s = 42; const rnd = () => ((s = (s * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
const counts = Array.from({ length: 365 }, () => (rnd() < 0.35 ? 0 : Math.floor(rnd() ** 2 * 20)));
const lvl = (c) => (c === 0 ? 0 : c < 3 ? 1 : c < 6 ? 2 : c < 10 ? 3 : 4);
writeFileSync(join(T, "data/github.json"), JSON.stringify({
  user: cfg.user, fetched: "2026-10-31T00:00:00Z", total: counts.reduce((x, y) => x + y, 0), start: "2025-11-01",
  counts, levels: counts.map(lvl).join(""), streak: { current: 3, longest: 11 }, best: { date: "2026-03-14", count: Math.max(...counts) },
  languages: [{ name: "TypeScript", color: "#3178c6", bytes: 7000, pct: 70 }, { name: "Go", color: "#00ADD8", bytes: 2000, pct: 20 }, { name: "Shell", color: null, bytes: 1000, pct: 10 }],
}));
writeFileSync(join(T, "data/audit.json"), JSON.stringify({
  fetched: "2026-10-31T00:00:00Z",
  user: { login: cfg.user, name: cfg.name, bio: null, location: "SF", blog: "github.blog", followers: 9, following: 3, public_repos: 8 },
  repos: [{ name: "Hello-World", description: "My first <repo>", language: "Ruby", stargazers_count: 42, fork: false, topics: [] },
    { name: "linguist", description: null, language: "Ruby", stargazers_count: 7, fork: false, archived: false, topics: [], pushed_at: "2026-09-02T00:00:00Z" }],
  pinned: [], profile_repo: false, readme: null, readme_updated: null, workflows: [], gaps: ["no profile repo"],
  events: [
    { type: "PushEvent", repo: "octocat/Hello-World", commits: 2 }, { type: "PushEvent", repo: "octocat/Hello-World", commits: 3 },
    { type: "PullRequestEvent", repo: "a/c", action: "opened", title: null }, { type: "ReleaseEvent", repo: "octocat/linguist", title: "v1.0" },
    { type: "CreateEvent", repo: "octocat/new", ref_type: "repository" }, { type: "IssuesEvent", repo: "a/b", action: "opened", title: "Bug & \"quotes\"" },
  ],
}));

const results = [];
const run = (label, script, argv) => {
  try { execFileSync(process.execPath, [join(SKILL, "scripts", script), ...argv], { cwd: T, stdio: "pipe", env: { ...process.env, NGP_OFFLINE: "1" } }); return true; }
  catch (e) { results.push([label, false, String(e.stderr || e.message).trim().split("\n").slice(-3).join(" | ")]); return false; }
};
const artifacts = [];
const out = (label, script, argv, file) => { if (run(label, script, argv)) artifacts.push([label, file]); };

for (const style of ["square", "glyph"]) for (const theme of ["dark", "light"]) {
  const f = `assets/${style === "glyph" ? "heatmap-glyph" : "heatmap"}-${theme}.svg`;
  out(`heatmap ${style}/${theme}`, "render-heatmap.mjs", ["--data", "data/github.json", "--style", style, "--theme", theme, "--prompt", "mona & co@github", "--out", f], f);
}
out("hero session (default --out)", "render-hero.mjs", ["--config", "profile.config.json"], "assets/hero.svg");
out("hero session light", "render-hero.mjs", ["--config", "profile.config.json", "--theme", "light"], "assets/hero-light.svg");
out("hero masthead", "render-hero.mjs", ["--config", "profile.config.json", "--template", "masthead", "--out", "assets/hero-masthead.svg"], "assets/hero-masthead.svg");
out("neofetch (default --out)", "render-neofetch.mjs", ["--config", "profile.config.json", "--data", "data/github.json"], "assets/neofetch.svg");
out("neofetch light", "render-neofetch.mjs", ["--config", "profile.config.json", "--data", "data/github.json", "--theme", "light"], "assets/neofetch-light.svg");
if (run("shots", "render-shots.mjs", ["--config", "profile.config.json", "--audit", "data/audit.json"]))
  for (const p of cfg.projects) artifacts.push([`shot ${p.repo}`, `assets/shots/${p.repo}.svg`]);
out("readme", "build-readme.mjs", ["--config", "profile.config.json", "--data", "data/github.json", "--audit", "data/audit.json"], "README.md");
out("mock", "build-mock.mjs", ["--config", "profile.config.json", "--audit", "data/audit.json"], "mock.html");
// ASCII via --config (needs python3 + Pillow): synthesize one transparent PNG frame.
const hasPIL = (() => { try { execFileSync("python3", ["-c", "import PIL"], { stdio: "ignore" }); return true; } catch { return false; } })();
if (hasPIL) {
  execFileSync("python3", ["-c", "from PIL import Image, ImageDraw\nim=Image.new('RGBA',(64,64),(0,0,0,0));ImageDraw.Draw(im).ellipse((8,8,56,56),fill=(200,200,200,255));im.save('frame.png')"], { cwd: T });
  writeFileSync(join(T, "profile.config.json"), JSON.stringify({ ...cfg, frames: ["frame.png"], ascii: { cols: 20, rows: 12, row: 0.05, hold: 1 } }));
  for (const th of ["dark", "light"]) {
    const f = th === "light" ? "assets/ascii-portrait-light.svg" : "assets/ascii-portrait.svg";
    try { execFileSync("python3", [join(SKILL, "scripts/render-ascii.py"), "--config", "profile.config.json", "--theme", th], { cwd: T, stdio: "pipe" }); artifacts.push([`ascii --config ${th}`, f]); }
    catch (e) { results.push([`ascii --config ${th}`, false, String(e.stderr || e.message).trim().split("\n").at(-1)]); }
  }
} else console.log("SKIP  ascii --config (Pillow not installed)");
out("site", "build-site.mjs", ["--config", "profile.config.json", "--data", "data/github.json", "--audit", "data/audit.json",
  ...(hasPIL ? ["--ascii", "assets/ascii-portrait.svg"] : []), "--out", "site/index.html"], "site/index.html");

// ASCII → site pipeline: frame shape, geometry, CSS/JS hooks, missing-source fallback, attr-less derive.
const site = (svg, html) => spawnSync(process.execPath, [join(SKILL, "scripts/build-site.mjs"), "--config", "profile.config.json", "--ascii", svg, "--out", html],
  { cwd: T, encoding: "utf8", env: { ...process.env, NGP_OFFLINE: "1" } });
const konst = (html, k) => { const m = readFileSync(join(T, html), "utf8").match(new RegExp(`const ${k}=(.*);\\n`)); return m ? JSON.parse(m[1]) : undefined; };
const check = (label, fn) => { let err; try { err = fn(); } catch (e) { err = e.message; } results.push([label, !err, err || "ok"]); };
if (hasPIL) {
  const svgPath = join(T, "assets/ascii-portrait.svg"), svg = readFileSync(svgPath, "utf8");
  const dattr = Object.fromEntries([...svg.match(/<svg\b[^>]*>/)[0].matchAll(/data-([\w-]+)="([^"]*)"/g)].map(([, k, v]) => [k, +v]));
  check("ascii frames", () => {
    const F = konst("site/index.html", "FRAMES"), A = konst("site/index.html", "ASCII");
    if (!F?.length || F.length !== dattr.frames) return `frames ${F?.length} != data-frames ${dattr.frames}`;
    if (!F.every((f) => f.length === A.rows && f.every((l) => l.length === A.cols))) return "ragged frame rows";
    if (!F.flat().some((l) => /^ +\S/.test(l))) return "indentation lost (no row starts with space)";
    const want = { cols: dattr.cols, rows: dattr.rows, cellW: dattr["cell-w"], cellH: dattr["cell-h"] };
    return JSON.stringify(A) === JSON.stringify(want) ? null : `ASCII ${JSON.stringify(A)} != data-* ${JSON.stringify(want)}`;
  });
  check("ascii derive (no data-*)", () => {
    writeFileSync(join(T, "bare.svg"), svg.replace(/\sdata-[\w-]+="[^"]*"/g, ""));
    const r = site("bare.svg", "site/bare.html"); if (r.status) return r.stderr.trim();
    const A = konst("site/bare.html", "ASCII"), want = { cols: dattr.cols, rows: dattr.rows, cellW: dattr["cell-w"], cellH: dattr["cell-h"] };
    const bad = Object.keys(want).filter((k) => !A || Math.abs(A[k] - want[k]) > want[k] * 0.01);
    return bad.length ? `derived ${JSON.stringify(A)} vs ${JSON.stringify(want)}` : null;
  });
}
check("site mascot hooks", () => {
  const x = readFileSync(join(T, "site/index.html"), "utf8");
  return !/\.asc\{[^}]*white-space:pre[;}]/.test(x) ? ".asc lacks white-space:pre" : !x.includes("const ASCII=") ? "no ASCII constant" : !x.includes("fitAscii") ? "no fitAscii" : null;
});
check("site missing --ascii", () => {
  const r = site("nope/missing.svg", "site/noascii.html");
  if (r.status) return `exit ${r.status}`;
  if (!r.stderr.includes("warn: no ascii frames from nope/missing.svg; mascot disabled")) return "no warning";
  return JSON.stringify(konst("site/noascii.html", "FRAMES")) === "[]" ? null : "FRAMES not []";
});

// Themes: light differs from dark only in colours (fill/stroke attrs, hex values, data-theme).
const strip = (f) => readFileSync(join(T, f), "utf8").replace(/\s(fill|stroke)="[^"]*"/g, "").replace(/#[0-9a-fA-F]{6}\b/g, "").replace(/\sdata-theme="\w+"/, "");
for (const [d, l] of [["assets/hero.svg", "assets/hero-light.svg"], ["assets/neofetch.svg", "assets/neofetch-light.svg"], ...(hasPIL ? [["assets/ascii-portrait.svg", "assets/ascii-portrait-light.svg"]] : [])])
  check(`theme pair ${l.slice(7, -10)}`, () => readFileSync(join(T, d), "utf8") === readFileSync(join(T, l), "utf8") ? "light == dark" : strip(d) === strip(l) ? null : "light differs beyond colours");
check("neofetch languages", () => {
  const x = readFileSync(join(T, "assets/neofetch.svg"), "utf8");
  return !x.includes(">Languages<") ? "no Languages row" : !["TypeScript", "Go", "Shell"].every((n) => x.includes(n)) ? "missing language names" :
    /width="18" height="10"/.test(x) ? "colour-swatch row still present" : !x.includes("#89e051") ? "null color not filled from table" : null;
});
check("neofetch audit fallback", () => {
  const d = JSON.parse(readFileSync(join(T, "data/github.json"), "utf8")); delete d.languages;
  writeFileSync(join(T, "data/nolang.json"), JSON.stringify(d));
  if (!run("neofetch fallback", "render-neofetch.mjs", ["--config", "profile.config.json", "--data", "data/nolang.json", "--audit", "data/audit.json", "--out", "assets/nf-fb.svg"])) return "render failed";
  return readFileSync(join(T, "assets/nf-fb.svg"), "utf8").includes("Ruby") ? null : "no Ruby from audit primary languages";
});
check("readme pictures + stack link", () => {
  const md = readFileSync(join(T, "README.md"), "utf8");
  const miss = ["hero", "ascii-portrait", "neofetch"].filter((n) => !md.includes(`<source media="(prefers-color-scheme: light)" srcset="assets/${n}-light.svg">`));
  return miss.length ? `no <picture> for ${miss}` : !/<a href="#-tech-stack"><img src="https:\/\/skillicons\.dev/.test(md) ? "stack image not wrapped in <a>" : null;
});
check("readme links.terminal", () => {
  const c = JSON.parse(readFileSync(join(T, "profile.config.json"), "utf8")); c.links.terminal = "https://octocat.github.io/";
  writeFileSync(join(T, "term.config.json"), JSON.stringify(c));
  if (!run("readme terminal", "build-readme.mjs", ["--config", "term.config.json", "--data", "data/github.json", "--out", "README-term.md"])) return "build failed";
  const md = readFileSync(join(T, "README-term.md"), "utf8");
  return !md.includes('<a href="https://octocat.github.io/?cmd=stack"><img') ? "stack not linked to ?cmd=stack" :
    !md.includes('⌨️ Try the interactive terminal → <a href="https://octocat.github.io">octocat.github.io</a></li>\n</ul>') ? "about bullet missing/not last" :
    !md.includes('<a href="https://octocat.github.io">live terminal</a>') ? "footer link missing" : null;
});
check("site ?cmd= handler", () => {
  const x = readFileSync(join(T, "site/index.html"), "utf8");
  return /URLSearchParams\(location\.search\)\.get\("cmd"\)/.test(x) && /C\[dk\]\.hide/.test(x) ? null : "no validated cmd param handler";
});

// Validate: SVG via xml.dom.minidom; HTML/README via html.parser tag balance.
const PY = `
import sys, xml.dom.minidom
from html.parser import HTMLParser
VOID = {"area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"}
class P(HTMLParser):
    def __init__(s): super().__init__(); s.st=[]; s.err=None
    def handle_starttag(s,t,a):
        if t not in VOID: s.st.append(t)
    def handle_endtag(s,t):
        if t in VOID: return
        if not s.st or s.st[-1]!=t: s.err = s.err or f"unexpected </{t}> (open: {s.st[-3:]})"
        else: s.st.pop()
for f in sys.argv[1:]:
    try:
        if f.endswith(".svg"): xml.dom.minidom.parse(f)
        else:
            p=P(); p.feed(open(f,encoding="utf8").read()); p.close()
            if p.err or p.st: raise ValueError(p.err or f"unclosed {p.st}")
        print("OK", f)
    except Exception as e: print("ERR", f, str(e).replace(chr(10)," "))
`;
const files = artifacts.map(([, f]) => join(T, f));
let verdict = {};
const hasPy = (() => { try { execFileSync("python3", ["-c", "1"], { stdio: "ignore" }); return true; } catch { return false; } })();
if (hasPy) {
  for (const l of execFileSync("python3", ["-c", PY, ...files], { encoding: "utf8" }).trim().split("\n")) {
    const [st, f, ...rest] = l.split(" ");
    verdict[f] = st === "OK" ? null : rest.join(" ");
  }
} else for (const f of files) {
  const x = readFileSync(f, "utf8");
  verdict[f] = f.endsWith(".svg") ? ((x.match(/<svg[\s>]/g) || []).length === (x.match(/<\/svg>/g) || []).length ? null : "unbalanced <svg>") : null;
}
for (const [label, f] of artifacts) {
  const p = join(T, f);
  let err = existsSync(p) ? verdict[p] : "missing";
  if (!err && f === "README.md") {
    const md = readFileSync(p, "utf8");
    err = /<h[12][\s>]/i.test(md) ? "has <h1>/<h2>" : /\sstyle=/i.test(md) ? "inline style=" :
      !/<!--ACTIVITY:START-->[\s\S]*<!--ACTIVITY:END-->/.test(md) ? "no ACTIVITY markers" :
      !md.includes("<picture>") ? "theme=both but no <picture>" : md.includes("Bug &amp; &quot;quotes&quot;") ? null : "activity title not escaped";
  }
  if (!err && /\.(svg|md|html)$/.test(f)) {
    const x = readFileSync(p, "utf8");
    if (/no description/.test(x)) err = "contains 'no description'";
    else if (/&quot;&quot;|"" in /.test(x)) err = "contains empty quoted title";
    else if (f.endsWith(".svg") && /<animate|animation/.test(x) && !/prefers-reduced-motion/.test(x)) err = "animated SVG lacks prefers-reduced-motion";
  }
  if (!err && f === "mock.html") {
    const x = readFileSync(p, "utf8");
    err = !x.includes('name="color-scheme" content="dark light"') ? "no color-scheme meta" : !x.includes("(proposed)") ? "config bio not shown as proposed" :
      !/hosted stats cards and the snake/.test(x) ? "footer note ignores sections" : null;
  }
  if (!err && f === "site/index.html") {
    const x = readFileSync(p, "utf8");
    err = x.length >= 300 * 1024 ? "site >= 300 KB" : x.includes("{{") ? "template leftovers {{" :
      !["LIVE_DATA_URL", "escapeHtml", "<canvas"].every((k) => x.includes(k)) ? "missing LIVE_DATA_URL/escapeHtml/<canvas" :
      x.includes("My first <repo>") ? "unescaped '<' in embedded data" : null;
  }
  if (!err && f === "README.md" && !readFileSync(p, "utf8").includes("Opened a PR in")) err = "empty-title PR not rendered as 'Opened a PR in'";
  if (!err && f.endsWith("linguist.svg") && !/pushed Sep 2026/.test(readFileSync(p, "utf8"))) err = "no-description shot lacks 'pushed <Mon YYYY>'";
  results.push([label, !err, err || f]);
}
let failed = 0;
for (const [label, ok, info] of results) { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${label.padEnd(22)} ${info}`); }
console.log(`\n${results.length - failed}/${results.length} passed · artifacts in ${T}`);
process.exit(failed ? 1 : 0);
