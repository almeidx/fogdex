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

The DBD wiki (deadbydaylight.wiki.gg) runs MediaWiki with Scribunto. All structured game data lives in Lua modules fetchable via the MediaWiki API:

| Module | API URL | Contents |
|---|---|---|
| `Module:Datatable` | `https://deadbydaylight.wiki.gg/api.php?action=query&titles=Module:Datatable&prop=revisions&rvprop=content&rvslots=main&format=json` | All killers, survivors, DLCs/chapters |
| `Module:Datatable/Loadout` | `https://deadbydaylight.wiki.gg/api.php?action=query&titles=Module:Datatable/Loadout&prop=revisions&rvprop=content&rvslots=main&format=json` | All perks, items, offerings, add-ons |

**These two requests contain ALL the data needed.** Do not scrape individual wiki pages.

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

**For perks**, from `Module:Datatable/Loadout`:
- Identify perk entries (distinguished from items/add-ons by their table location in the Lua module)
- `role`: "killer" or "survivor" based on which table the perk belongs to
- `owner`: character id derived from the associated character, or null for universal perks
- `ownerName`: character display name, or null
- `chapter`: from the owner's DLC, or null
- `description`: parse the description template, replacing variable tier values with `{namedPlaceholder}` syntax
- `tierValues`: extract the 3 tiers' values as `[{name: val}, {name: val}, {name: val}]`
- `tags`: extract from the perk's category/tags in the Lua data

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

1. Write the updated JSON files (formatted with tabs, sorted by release date for characters, alphabetically for perks)
2. For each new or changed portrait/icon, download the image:
   ```bash
   node scripts/download-image.ts "<image-url>" "<id>"
   ```
   Note: the image URL may need to be resolved from the wiki. Use `https://deadbydaylight.wiki.gg/wiki/Special:FilePath/<filename>` to get image URLs.
3. Run validation:
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
