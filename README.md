# neo-skills

System design skills for [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [opencode](https://opencode.ai), and any agent that understands the `SKILL.md` format.

## Skills

| Skill | What it does | When to use it |
|---|---|---|
| [`neo-system-design`](skills/neo-system-design/SKILL.md) | Comprehensive system design knowledge base: distributed systems, databases, caching, networking, security, cloud architecture, API design, microservices, decision frameworks, and real-world case studies. | Designing systems, reviewing architecture decisions, answering deep architecture questions, preparing for system design interviews. |
| [`neo-system-design-lite`](skills/neo-system-design-lite/SKILL.md) | Opinionated system design for small-scale projects (1–10 engineers, <100K users, pre-Series A). Concrete defaults, not "it depends". | Building MVPs, indie SaaS, small team projects — shipping fast without over-engineering. |

The two skills are complementary: **lite** tells you what to do; the **full** version explains the trade-off space when you outgrow the defaults.

## Installation

### Claude Code (plugin marketplace)

```
/plugin marketplace add vidit19sharma/neo-skills
/plugin install neo-skills@neo-skills
```

Or from the shell:

```bash
claude plugin marketplace add vidit19sharma/neo-skills
claude plugin install neo-skills@neo-skills
```

### opencode / Claude Code (install script)

```bash
git clone https://github.com/vidit19sharma/neo-skills.git
cd neo-skills
./install.sh                     # auto-detects opencode and/or Claude Code
./install.sh --target opencode   # opencode only
./install.sh --target claude     # Claude Code only
./install.sh --uninstall         # remove installed skills
```

The script copies skills to `~/.config/opencode/skills/` (opencode) or `~/.claude/skills/` (Claude Code). It never overwrites existing skills unless you pass `--force`.

### Manual

Copy any skill directory into your agent's skills location:

```bash
cp -R skills/neo-system-design ~/.config/opencode/skills/   # opencode
cp -R skills/neo-system-design ~/.claude/skills/            # Claude Code
```

## Usage

Skills activate automatically when your request matches their description. You can also invoke them explicitly:

> Use neo-system-design-lite: I'm building a SaaS MVP solo. What stack should I use?

> Use neo-system-design: design a URL shortener that handles 100M redirects/day.

## Repository layout

```
neo-skills/
├── .claude-plugin/
│   ├── plugin.json          # Claude Code plugin manifest
│   └── marketplace.json     # Claude Code marketplace manifest
├── skills/
│   ├── neo-system-design/SKILL.md
│   └── neo-system-design-lite/SKILL.md
├── install.sh
└── LICENSE
```

## License

[MIT](LICENSE) © 2026 Vidit Sharma
