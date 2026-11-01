#!/usr/bin/env node
// Fill templates/site.template.html → one self-contained terminal page (inline CSS/JS; only network call = live data fetch).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { args, render, readJSON, write, login, TEMPLATES } from "./_lib.mjs";

const a = args(`
Usage: node build-site.mjs --config profile.config.json [--data data/github.json] [--audit data/audit.json] [--ascii assets/ascii-portrait.svg] [--out site/index.html]
Live data URL defaults to raw.githubusercontent.com/<user>/<user>/main/data/github.json (override: config.site = { url, live_data_url }).`, ["config"]);
const OUT = typeof a.out === "string" ? a.out : "site/index.html";
const C = readJSON(a.config);
const D = typeof a.data === "string" ? readJSON(a.data) : null;
const A = typeof a.audit === "string" ? readJSON(a.audit) : null;
const U = login(C.user);
const siteObj = C.site && typeof C.site === "object" ? C.site : {};
const site = (typeof C.site === "string" ? C.site : siteObj.url) || C.links?.website || "";
const href = (u) => (!u ? "" : /^(https?:|mailto:)/.test(u) ? u : `https://${u}`);
const repo = (n) => A?.repos?.find((r) => r.name.toLowerCase() === n.toLowerCase()) || {};

// ASCII frames: <text> grouped by y (row), document order within a row = frame index (works row- or frame-major).
// Geometry: root data-* attrs (render-ascii.py) win; else derived from textLength / y pitch. Rows untrimmed, right-padded to cols.
let frames = [], ascii = null;
if (typeof a.ascii === "string") {
  let svg = "";
  try { svg = readFileSync(a.ascii, "utf8"); } catch {}
  const NAMED = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'", nbsp: " " };
  const unent = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) =>
    e[0] !== "#" ? NAMED[e] ?? m : String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : +e.slice(1))).replace(/\u00a0/g, " ");
  const root = (svg.match(/<svg\b[^>]*>/) || [""])[0], attr = (s, k) => (s.match(new RegExp(`\\s${k}="([^"]*)"`)) || [])[1];
  const texts = [...svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)].map((m) => ({ y: +attr(m[1], "y"), tl: +attr(m[1], "textLength"), s: unent(m[2].replace(/<[^>]*>/g, "")) }));
  const ys = [...new Set(texts.map((t) => t.y))].sort((p, q) => p - q);
  const byY = ys.map((y) => texts.filter((t) => t.y === y).map((t) => t.s));
  const cols = +attr(root, "data-cols") || Math.max(0, ...texts.map((t) => t.s.length));
  const rows = +attr(root, "data-rows") || ys.length;
  const K = +attr(root, "data-frames") || (rows ? Math.floor(texts.length / rows) : 0);
  const cellH = +attr(root, "data-cell-h") || (ys.length > 1 ? ys[1] - ys[0] : 0);
  const cellW = +attr(root, "data-cell-w") || (texts[0]?.tl && cols ? texts[0].tl / cols : cellH * 0.6);
  if (rows === ys.length && byY.every((r) => r.length >= K))
    for (let k = 0; k < K; k++) frames.push(byY.map((r) => r[k].padEnd(cols, " ")));
  if (!frames.every((f) => f.length === rows && f.every((l) => l.length === cols))) frames = [];
  if (frames.length) ascii = { cols, rows, cellW, cellH };
  else console.error(`warn: no ascii frames from ${a.ascii}; mascot disabled`);
}

const L = C.links || {};
const links = [
  ["site", href(L.website || site)], ["github", `https://github.com/${U}`], ["linkedin", href(L.linkedin)],
  ["x", href(L.x)], ["email", L.email && (L.email.startsWith("mailto:") ? L.email : `mailto:${L.email}`)],
].filter(([, u]) => u);

const cfg = {
  user: U, name: C.name || U, alias: C.alias || "", prompt: C.handle_prompt || `${U}@github`, tagline: C.tagline || C.bio || "",
  role: C.role || "", location: C.location || "", site: site.replace(/^https?:\/\//, "").replace(/\/$/, ""), siteHref: href(site), links,
  stack: C.stack || [],
  projects: (C.projects || []).map((p) => ({
    name: p.repo, src: `https://github.com/${p.owner || U}/${p.repo}`, demo: p.demo || "",
    description: p.description || repo(p.repo).description || "", tags: p.tags || [], stars: repo(p.repo).stargazers_count ?? 0,
  })),
};
const snap = D && { fetched: D.fetched, counts: D.counts, levels: D.levels, start: D.start, total: D.total, streak: D.streak, best: D.best };
const LIVE = siteObj.live_data_url || `https://raw.githubusercontent.com/${U}/${U}/main/data/github.json`;
// JSON inside <script>: neutralise "<" so no string can close the tag.
const js = (v) => JSON.stringify(v).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
const data = `const CFG=${js(cfg)};\nlet DATA=${js(snap)};\nconst FRAMES=${js(frames)};\nconst ASCII=${js(ascii)};\nconst LIVE_DATA_URL=${js(LIVE)};`;

write(OUT, render(readFileSync(join(TEMPLATES, "site.template.html"), "utf8"), {
  title: `${cfg.prompt} — interactive terminal`, prompt: cfg.prompt, tagline: cfg.tagline, data,
}));
