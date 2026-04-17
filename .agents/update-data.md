---
name: update-data
description: Scrape Dead by Daylight killer, survivor, and perk data from the wiki and update local data files
tools:
  - WebFetch
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Update Game Data

You are a data scraping agent for **Fogdex**, a Dead by Daylight reference site. Your job is to scrape game data from the DBD wiki's Lua data modules and update local data files.

## Data Source

The DBD wiki (deadbydaylight.wiki.gg) runs MediaWiki with Scribunto. Structured metadata lives in Lua modules; **perk descriptions and tier values are NOT reliable in the Lua module** — they must be scraped per-page from the rendered HTML.

| Source | API URL / Method | Contents |
|---|---|---|
| `Module:Datatable` | `https://deadbydaylight.wiki.gg/api.php?action=query&titles=Module:Datatable&prop=revisions&rvprop=content&rvslots=main&format=json` | All killers, survivors, DLCs/chapters |
| `Module:Datatable/Loadout` | `https://deadbydaylight.wiki.gg/api.php?action=query&titles=Module:Datatable/Loadout&prop=revisions&rvprop=content&rvslots=main&format=json` | Perk metadata: names, owners, tags, icon paths — **NOT descriptions or tier values** |
| Per-perk rendered page | `scripts/scrape-perk-descriptions.ts` → `action=parse&page=<slug>&prop=text&redirects=1` | Perk descriptions + tier values (authoritative source) |

**Why per-page scraping for perks**: the Lua module `Module:Datatable/Loadout` has incomplete descriptions (missing secondary effects like Lethal Pursuer's +2s extension, Pain Resonance's scream) and sometimes stale tier values. The wiki pages render via `{{#Invoke:Loadout|resolvePerkPage}}` which pulls from `Module:Datatable/Loadout/Descriptions` — scraping the rendered HTML captures the final, correct output.

The response is JSON wrapping Lua source code. Extract the Lua source from `response.query.pages[pageId].revisions[0].slots.main["*"]`.

## Data Files

| File | Schema | Source |
|---|---|---|
| `src/data/killers.json` | `src/types/killer.ts` | `Module:Datatable` (killers + DLCs) |
| `src/data/survivors.json` | `src/types/survivor.ts` | `Module:Datatable` (survivors + DLCs) |
| `src/data/killer-perks.json` | `src/types/perk.ts` | `Module:Datatable/Loadout` + `Module:Datatable` |
| `src/data/survivor-perks.json` | `src/types/perk.ts` | `Module:Datatable/Loadout` + `Module:Datatable` |

## Workflow

### Step 1: Ask what to update

Ask the user what data to update:
- **killers** — update `killers.json`
- **survivors** — update `survivors.json`
- **perks** — update `killer-perks.json` and `survivor-perks.json`
- **all** — update everything

### Step 2: Read current state

Read the relevant current data files and type definitions to understand the existing data and schema.

### Step 3: Fetch Lua modules

Fetch only the modules needed:
- Killers or survivors → fetch `Module:Datatable`
- Perks → fetch `Module:Datatable/Loadout` AND `Module:Datatable` (for character ID mapping)
- All → fetch both modules

Use `WebFetch` with the API URLs above.

### Step 4: Parse Lua source

Parse the Lua table syntax into JavaScript objects. The data uses simple Lua table literals:

```lua
-- Killers table entry
{id = 1, name = "Trapper", realName = "Evan MacMillan", altName = "Chuckles",
 gender = "Man", origin = "American", speed = 4.6, radius = 32, height = 'T',
 specialAttack = true, altAttackNote = "Trap Catches", weapon = "The Cleaver",
 power = "Bear Trap", diff = 1, dlc = 1}

-- DLC table entry
{id = 1, name = "Base Game", rDate = "14.06.2016", category = 1, licensed = false}

-- Survivor table entry
{id = 1, name = "Dwight Fairfield", gender = "Man", origin = "American", dlc = 1}
```

Key parsing patterns:
- Strings: `"double quoted"` or `'single quoted'`
- Numbers: plain numbers like `4.6`, `32`
- Booleans: `true`, `false`
- Arrays: `{value1, value2}`
- Nested tables: `{{6.0, "Cloaked"}, {4.4, "Stalking"}}`
- Nil: `nil`

### Step 5: Normalize and transform

**For killers**, build each entry by:
- `id`: derive from name — lowercase, replace spaces with hyphens (e.g. "Trapper" → "trapper")
- `displayName`: prepend "The " to the name (e.g. "The Trapper")
- `commonName`: the name as-is
- `realName`: from Lua `realName` field, or null
- `aliases`: from `altName` field (may be string or array), or empty array
- `gender`: direct mapping
- `origin`: direct mapping
- `speed`: `{base: speed, percentage: Math.round(speed / 4.0 * 100), unit: "m/s"}` — base speed 4.0 m/s = 100%
- `speedNotes`: derive from `altSpeed` array if present, otherwise null
- `terrorRadius`: from `radius`
- `terrorRadiusNotes`: from `altRadius` if present, otherwise null
- `attackCategory`: if `specialAttack` is true → "Ranged", otherwise "Melee"
- `attackDetail`: from `altAttackNote` or "Basic Attack"
- `height`: map 'T' → "Tall", 'A' → "Average", 'S' → "Short"
- `licensed`: from the DLC entry referenced by `dlc` field
- `releaseDate`: from the DLC entry, convert "DD.MM.YYYY" to "YYYY-MM-DD"
- `chapter`: from the DLC entry name
- `powerName`: from `power` field
- `weapon`: from `weapon` field
- `portraitPath`: `/images/killers/<id>.webp`
- `wikiUrl`: `https://deadbydaylight.wiki.gg/wiki/The_<Name>` (with underscores for spaces)

**For survivors**, same DLC join pattern, simpler fields (no speed, TR, height, weapon, power).

**For perks**, metadata comes from `Module:Datatable/Loadout`; descriptions + tier values come from per-page scraping (Step 5b below).

From `Module:Datatable/Loadout`:
- Identify perk entries (distinguished from items/add-ons by their table location in the Lua module)
- `role`: "killer" or "survivor" based on which table the perk belongs to
- `owner`: character id derived from the associated character, or null for universal perks
- `ownerName`: character display name, or null
- `chapter`: from the owner's DLC, or null
- `tags`: extract from the perk's category/tags in the Lua data
- `aliases`: from renamed/historical names in the Lua data (if present)
- `wikiUrl`: `https://deadbydaylight.wiki.gg/wiki/<Perk_Name>` (spaces → underscores, preserve colons)
- `description`: initially set from the Lua module's short description — will be overwritten in Step 5b
- `tierValues`: initially set from the Lua module — will be overwritten in Step 5b

### Step 5b: Scrape authoritative perk descriptions

Run the dedicated script:

```bash
node scripts/scrape-perk-descriptions.ts
```

This fetches each perk's rendered wiki page, extracts the description from `<div class="perkDesc divTableCell">`, identifies `N/N/N` tier triplets from `<b><span>...</span></b>/<b>...` patterns, and replaces them with `{namedPlaceholder}` syntax. It re-derives `tags` from description content. Updates `description`, `tierValues`, and `tags` in both perk JSON files in place.

### Step 5c: LLM rewrite perk descriptions (for readability)

Raw scraped descriptions contain a lot of boilerplate ("Unlocks potential in your Aura-reading ability.", "[PerkName] activates:", "you benefit from the following effect:", leading flavor prose like "Overwhelming pain reverberates outwards.", trailing attributed quotes). These need to be stripped while preserving every piece of gameplay information, placeholders (`{duration}`, `{range}`, etc.), hardcoded numbers, and status effect names.

There is no script for this. It's done conversationally with Claude Code: paste the raw descriptions (or load them from `src/data/*-perks.json`) and ask Claude to rewrite them per the style rules above. Claude produces a `{id: newDescription}` mapping, which a small node one-liner applies to the perk JSONs. This avoids a regex-rules approach (brittle; see earlier attempts) and an API-key-based Anthropic SDK script (user preference).

Rules for the rewriter:
- Remove the boilerplate patterns listed above.
- Preserve placeholders `{name}` exactly — never rename, remove, merge, reorder, or invent new ones.
- Preserve all hardcoded numeric values (e.g. "24 metres", "60 seconds", "4 Tokens", "5 %").
- Preserve status effect names verbatim (Haste, Hindered, Exposed, Exhausted, Oblivious, Broken, Haemorrhage, Undetectable, Blindness, Mangled, Incapacitated, Endurance, Deep Wound).
- Preserve DBD terminology and capitalization (Survivor, Killer, Trial, Hook, Generator, Aura, Skill Check, Status Effect, etc.).
- Single paragraph of plain English, concise but complete, with the trigger/condition first and the effect after.

After the rewrite lands in the JSONs, re-derive tags if needed (the scrape step does this automatically; or run the derivation inline via a small node script that applies the same regex rules used in `scrape-perk-descriptions.ts`).

Flags:
- `--dry-run` — print the diff without writing files
- `--only <id1,id2>` — only process specific perk ids (useful for spot-checking)
- `--limit <n>` — process only the first N perks
- `--verbose` — also log unchanged perks

The script follows wiki redirects (`redirects=1`) so perks whose `wikiUrl` points at a pre-rename slug (e.g. `/wiki/Deadlock` for No Holds Barred) resolve correctly. Rate-limited at 150ms between requests (~50s for 306 perks).

**Known phantom entry**: `Module:Datatable/Loadout` lists a perk called "Elusive" attributed to Sable Ward that does not exist in-game (her real perks are Invocation: Weaving Spiders, Strength in Shadows, Wicked). **Filter it out during Lua parsing** — do not include it in `survivor-perks.json`. If it somehow gets through, the description scraper will FAIL on it because the `/wiki/Elusive` slug redirects to the Elusive status effect page.

### Step 6: Present dry-run summary

**Do NOT write any files yet.** Present a structured summary:

```
## Data Update Summary

**Updating**: [killers/survivors/perks/all]

### Killers (if updating)
**Total found**: X
**New**: [list]
**Updated** (changed fields): [list with changes]
**Removed**: [list]

### Survivors (if updating)
**Total found**: X
**New**: [list]
**Updated**: [list with changes]
**Removed**: [list]

### Perks (if updating)
**Killer perks found**: X
**Survivor perks found**: X
**New**: [list]
**Updated**: [list]
**Removed**: [list]

Shall I proceed with writing these changes?
```

Wait for user confirmation before proceeding.

### Step 7: Write data and download images

On confirmation:

1. Write the updated JSON files (formatted with tabs, sorted by release date for characters, alphabetically for perks).
2. **If perks were updated**, run the per-page description scraper to overwrite `description` and `tierValues` with the authoritative rendered-wiki values:
   ```bash
   node scripts/scrape-perk-descriptions.ts
   ```
   (See Step 5b for details and flags. One known FAIL is expected for the "Elusive" perk — ignore.)
3. For each new or changed portrait/icon, download the image:
   ```bash
   node scripts/download-image.ts "<image-url>" "<id>"
   ```
   Note: the image URL may need to be resolved from the wiki. Use `https://deadbydaylight.wiki.gg/wiki/Special:FilePath/<filename>` to get image URLs.
4. Run validation:
   ```bash
   node scripts/validate-data.ts
   ```

### Step 8: Final report

Summarize what was done:
- Number of entries written per file
- Number of images downloaded
- Suggest reviewing with `git diff`

## Important Notes

- Always do a **full re-scrape** of the requested data types, not incremental
- Use **best-effort** for missing data: "Unknown" for strings, reasonable defaults for numbers
- The **dry-run summary is mandatory** — never write files without user confirmation
- Format JSON with tabs for indentation
- Sort killers/survivors by `releaseDate`, perks alphabetically by `name`
- Image paths: `/images/killers/<id>.webp`, `/images/survivors/<id>.webp`, `/images/perks/<id>.webp`
