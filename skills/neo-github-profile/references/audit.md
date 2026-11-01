# Audit

`node scripts/audit.mjs --user <login>` → `data/audit.json`

## What it collects

- Profile: name, bio, company, location, blog, twitter, avatar, followers
- Profile repo `<login>/<login>`: exists, README content, `readme_updated` (last commit touching the README)
- Pinned repos (GraphQL `pinnedItems`)
- All public repos, paginated: fork, archived, description, stars, language, topics, pushed date
- README scan: hosted widgets, badges, workflows
- Year contribution total

## Gap checklist

| Gap | Check |
|---|---|
| Empty identity fields | bio, company, twitter or blog empty |
| Twitter in `blog` | blog holds an x.com/twitter.com URL |
| Company is a URL | should be `@org` |
| No profile repo | `<login>/<login>` missing |
| Stale README | `readme_updated` older than 90 days |
| Thin pins | fewer than 6 pinned |
| Hidden recent work | recent non-fork, non-archived repos not pinned |
| Undescribed repos | non-fork repos without description |
| Fragile widgets | hosted stat or trophy endpoints |
| Badge noise | duplicate badges |
| No automation | no workflows |
| Private contributions likely hidden | year total < 150 |

## Gaps to Tier-1 recommendations

- Empty fields → exact bio, company and twitter text
- Twitter in `blog` → move it to twitter, free `blog` for a site
- Company URL → `@org`
- Thin pins → the 6 repos to pin, most recent first
- Undescribed repos → draft descriptions for the N most visible (default N = 10, by stars then recency). When the purpose can't be inferred from README or name, list it as "needs owner input" instead of guessing.
- Private hidden → Settings, Public profile, "Include private contributions"
- Throwaway repos → archive

Widget, staleness and automation gaps go to Tier 2. See `recommendations.md`.
