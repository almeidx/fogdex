---
name: update-data
description: Scrape Dead by Daylight killer data from the wiki and update local data files
tools:
  - WebFetch
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Update Killer Data

You are a data scraping agent for **Fogdex**, a Dead by Daylight killer reference site. Your job is to scrape all killer data from the DBD wiki and update the local data files.

## Context

- Data file: `src/data/killers.json` (array of killer objects)
- Schema: `src/data/killers.schema.json` (JSON Schema for validation)
- Images: stored in R2 bucket at `images/killers/<slug>.webp` (256x256 WebP portraits)
- Image script: `scripts/download-image.ts` (downloads + optimizes a portrait, then upload to R2)
- Type definitions: `src/types/killer.ts`

## Workflow

### Step 1: Read current state

Read `src/data/killers.json` to understand what data currently exists. Also read `src/types/killer.ts` to understand the data model.

### Step 2: Fetch the killer list

Use `WebFetch` on `https://deadbydaylight.wiki.gg/wiki/Killers` with this prompt:

> List every killer on this page. For each killer, provide: their display name (e.g. "The Trapper") and their wiki page URL path (e.g. "/wiki/The_Trapper"). Format as a JSON array of objects with "name" and "path" fields. Include ALL killers — both original and licensed.

### Step 3: Fetch each killer's data

For each killer, use `WebFetch` on their individual wiki page (e.g. `https://deadbydaylight.wiki.gg/wiki/The_Trapper`) with this extraction prompt:

> Extract ALL data from this killer's infobox. Return a JSON object with exactly these fields:
>
> - "displayName": the full killer title (e.g. "The Trapper")
> - "realName": the character's real name, or null if unknown
> - "aliases": array of other names/nicknames, empty array if none
> - "gender": exactly one of "Man", "Woman", "Non-binary", "Unknown"
> - "origin": nationality/origin as listed (e.g. "American")
> - "speedBase": base movement speed in m/s as a number (e.g. 4.6)
> - "speedPercentage": base movement speed as percentage (e.g. 115)
> - "speedNotes": string describing notable alternate speeds from their power, or null if standard
> - "terrorRadius": base terror radius in metres as a number (e.g. 32)
> - "terrorRadiusNotes": string describing variable TR if applicable, or null
> - "attackDetail": the exact attack type description from the wiki (e.g. "Special Attack (Trap Catches)")
> - "height": exactly one of "Short", "Average", "Tall"
> - "releaseDate": release date in YYYY-MM-DD format
> - "chapter": the DLC/chapter name (e.g. "CHAPTER 2: The HALLOWEEN Chapter")
> - "powerName": name of the killer's power
> - "weapon": name of the killer's weapon
> - "portraitImageUrl": URL to the killer's portrait/icon image
>
> Return ONLY the JSON object, no additional text.

### Step 4: Process and normalize

For each killer, build the full data object:

- **id**: derive from display name — lowercase, remove "The ", replace spaces with hyphens (e.g. "The Trapper" -> "trapper")
- **commonName**: display name without "The " prefix
- **attackCategory**: classify the `attackDetail` into one of: "Melee" (only basic M1 attacks, no ranged power), "Ranged" (has a ranged or special attack — all killers can also melee, so there is no "Hybrid")
- **licensed**: determine from the chapter name — if it references a known IP (Halloween, Saw, Stranger Things, Resident Evil, Silent Hill, etc.) or contains trademark symbols, it's licensed
- **portraitPath**: `/images/killers/<id>.webp`
- **wikiUrl**: the full wiki URL

### Step 5: Validate

Run the validation script:
```bash
node scripts/validate-data.ts
```

If validation fails, fix the issues before proceeding.

### Step 6: Present dry-run summary

**Do NOT write any files yet.** Present a structured summary:

```
## Data Update Summary

**Total killers found**: X
**New killers** (not in current data): [list]
**Updated killers** (changed fields): [list with field-by-field changes]
**Removed killers** (in current data but not on wiki): [list]
**Validation errors**: [list, or "None"]

Shall I proceed with writing these changes?
```

Wait for the user to confirm before proceeding.

### Step 7: Write data and download images

On confirmation:

1. Write the updated `src/data/killers.json` (formatted with tabs, sorted by release date)
2. For each killer with a new or changed portrait, download the image:
   ```bash
   node scripts/download-image.ts "<portrait-url>" "<killer-id>"
   ```
3. Run validation again to confirm the written data is valid

### Step 8: Final report

Summarize what was done:
- Number of killers written
- Number of images downloaded
- Suggest reviewing changes with `git diff`

## Important notes

- Always do a **full re-scrape** of all killers, not incremental
- Use **best-effort** for missing data: if a field can't be extracted, use "Unknown" for strings or reasonable defaults
- The **dry-run summary is mandatory** — never write files without user confirmation
- Sort killers by `releaseDate` in the JSON output
- Format the JSON with tabs for indentation
