# Fogdex

Dead by Daylight killer reference site. Single-page React app with filterable/sortable killer stats.

## Stack

- **React + Vite** (static build), **Tailwind CSS v4**, **TypeScript**, **Biome** (lint + format)
- **Cloudflare Workers** with static assets binding (`wrangler.jsonc`)
- **nuqs** for URL query param state
- **zod** for data validation
- **sharp** for image processing
- **pnpm** + **Node 24**

## Commands

```
pnpm run dev              # Vite dev server
pnpm run build            # Production build -> dist/
pnpm run build:typecheck  # tsc --noEmit
pnpm run lint             # biome check
pnpm run fmt              # biome check --write
pnpm run validate-data    # Validate killers.json against zod schema
pnpm run download-image   # node scripts/download-image.ts <url> <slug>
```

## Project structure

```
src/
  App.tsx                    Root component
  main.tsx                   Entry point (wraps app in NuqsAdapter)
  index.css                  Tailwind v4 + dark theme tokens (@theme)
  types/killer.ts            Data model, const enums (GENDERS, HEIGHTS, etc.), filter/sort types
  data/killers.json          All killer data (populated by update-data agent)
  hooks/useFilters.ts        Filter/sort logic + nuqs URL state sync
  components/
    FilterBar.tsx            Sticky filter bar (search, ranges, multi-selects, licensed toggle)
    KillerTable.tsx          Desktop table + mobile cards, sortable column headers
    KillerRow.tsx            Table row + mobile card with attack badges
scripts/
  download-image.ts          Downloads URL -> 256x256 WebP via sharp
  validate-data.ts           Validates killers.json with zod schema
.agents/
  update-data.md             Agent that scrapes DBD wiki and updates killer data
public/images/killers/       256x256 WebP killer portraits
```

## Data model

Killer data lives in `src/data/killers.json`. Types and const arrays are in `src/types/killer.ts`. The const arrays (`GENDERS`, `ATTACK_CATEGORIES`, `HEIGHTS`, `SORT_COLUMNS`, etc.) are the single source of truth — used by types, nuqs parsers, filter UI, and zod validation.

Key fields: `id`, `displayName`, `commonName`, `realName`, `gender`, `origin`, `speed` (base/percentage), `terrorRadius`, `attackCategory` (Melee/Ranged/Hybrid), `height`, `licensed`, `releaseDate`, `chapter`, `powerName`, `weapon`.

## Conventions

- Tabs for indentation, double quotes (Biome default)
- Use `.ts`/`.tsx` extensions in imports
- Const arrays for enum-like values, types derived with `(typeof X)[number]`
- `node:fs/promises` in scripts, `import.meta.dirname` over `process.cwd()`
- No `tsx` package — Node 24 runs TypeScript natively
