# Fogdex

Dead by Daylight reference site. Multi-page Astro + React app with filterable/sortable killer stats, survivor stats, and perk databases.

## Stack

- **Astro 6** (static build) with **React 19** islands for interactivity, **Tailwind CSS v4**, **TypeScript**, **Biome** (lint + format)
- **Cloudflare Workers** with static assets binding (`wrangler.jsonc`)
- **nuqs** for URL query param state (inside React islands)
- **zod** for data validation
- **sharp** for image processing
- **pnpm** + **Node 24** (`.node-version` pins Cloudflare builds to 24.16.0)

## Commands

```
pnpm run dev              # Astro dev server
pnpm run build            # Production build -> dist/
pnpm run build:typecheck  # astro check (typechecks .astro + .ts/.tsx)
pnpm run data:pull        # Pull private JSON data from Cloudflare R2 into .fogdex-data/
pnpm run data:push        # Push local .fogdex-data/ JSON data to Cloudflare R2
pnpm run lint             # biome check
pnpm run fmt              # biome check --write
pnpm run validate-data    # Validate all JSON data files against zod schemas
```

## Project structure

```
astro.config.mjs           Astro + React + Sitemap integrations, Tailwind via Vite plugin
src/
  index.css                Tailwind v4 + dark theme tokens (@theme)
  layouts/
    BaseLayout.astro       HTML shell, per-page SEO meta (title, description, OG, Twitter, canonical, JSON-LD), imports NavBar + Footer
  pages/                   Astro file-based routing
    index.astro            / - Killers
    survivors.astro        /survivors - Survivors
    perks/killer.astro     /perks/killer - Killer perks
    perks/survivor.astro   /perks/survivor - Survivor perks
    disclaimer.astro       /disclaimer - Legal disclaimer (0 JS shipped)
    404.astro              Catch-all "not found" page (served via wrangler's 404-page)
    og-image.png.ts        Endpoint route: sharp renders a 1200x630 OG image at build time
  islands/                 React components hydrated on the client (client:load)
    KillersIsland.tsx      NuqsAdapter + FilterBar + KillerTable
    SurvivorsIsland.tsx    NuqsAdapter + SurvivorFilterBar + SurvivorTable
    PerksIsland.tsx        NuqsAdapter + PerkFilterBar + PerkGrid (shared by both perk pages)
  types/
    killer.ts              Killer data model, shared types (Gender, SortDirection, etc.)
    survivor.ts            Survivor data model + filter/sort types
    perk.ts                Perk data model + filter/sort types
  data/
    load.ts                Build-time private JSON loader (reads FOGDEX_DATA_DIR, defaults to .fogdex-data/)
    killers.schema.json    JSON schema artifact for killer data shape
  hooks/
    useFilters.ts          Killer filter/sort logic + nuqs URL state sync
    useSurvivorFilters.ts  Survivor filter/sort logic + nuqs URL state sync
    usePerkFilters.ts      Perk filter/sort logic + nuqs URL state sync
  components/
    NavBar.astro           Top navigation bar (static, uses Astro.url.pathname for active link)
    Footer.tsx             Shared footer (rendered as static HTML, no client directive)
    MultiSelect.tsx        Reusable multi-select dropdown
    FilterBar.tsx          Killer filter bar (search, ranges, multi-selects, licensed toggle)
    SurvivorFilterBar.tsx  Survivor filter bar
    PerkFilterBar.tsx      Perk filter bar (search, tags, owner, chapter, sort)
    KillerTable.tsx        Desktop table + mobile cards, sortable columns
    KillerRow.tsx          Killer table row + mobile card + TR audio + perks link
    SurvivorTable.tsx      Survivor desktop table + mobile cards
    SurvivorRow.tsx        Survivor table row + mobile card + perks link
    PerkGrid.tsx           Responsive perk card grid
    PerkCard.tsx           Perk card (icon, name, aliases, owner, description, tags)
    PerkDescription.tsx    Renders perk description with tier values + status effect tooltips
    StatusEffectTooltip.tsx Hover tooltip for status effect names
    TrPlayer.tsx           Bottom audio player (portrait + name + scrubber + volume + close); mounts only while a TR is playing
public/
  favicon.svg
  robots.txt               Points crawlers at /sitemap-index.xml
scripts/
  prepare-data.ts          Ensures private JSON data exists before production build, pulling from R2 if needed
  sync-data.ts             Pulls/pushes private JSON data from/to Cloudflare R2 via the S3-compatible API
  validate-data.ts         Validates all JSON data files with zod schemas
```

## Pages

| Route | Description |
|---|---|
| `/` | Killers — sortable table with filters, TR audio, perks link per row |
| `/survivors` | Survivors — sortable table with filters, perks link per row |
| `/perks/killer` | Killer perks — filterable card grid with tier values and status effect tooltips |
| `/perks/survivor` | Survivor perks — filterable card grid with tier values and status effect tooltips |
| `/disclaimer` | Legal disclaimer (static HTML, zero JS) |

Routing is file-based (Astro). Each page loads private JSON in the `.astro` frontmatter with `src/data/load.ts` and passes it to a React island as props — initial list is server-rendered into HTML for SEO, and the island hydrates with `client:load` for interactive filtering/sorting.

## SEO

- Per-page `<title>`, meta description, canonical URL, `<h1>`, Open Graph + Twitter Card tags via `BaseLayout.astro`.
- Per-page JSON-LD (WebSite / ItemList) injected via the `jsonLd` prop to `BaseLayout`. List items anchor to `#{id}` on each row/card (`KillerRow`, `SurvivorRow`, `PerkCard`).
- `src/pages/og-image.png.ts` renders the 1200x630 OG PNG at build time with sharp — derived output, not committed.
- `@astrojs/sitemap` auto-generates `/sitemap-index.xml` with per-entry `lastmod` stamped at build time.
- `public/robots.txt` points crawlers at the sitemap.
- `site` in `astro.config.mjs` is the canonical base URL — update if the production domain changes.

## Data model

Killer, survivor, perk, and status-effect JSON is private build input. It is pulled from Cloudflare R2 into `FOGDEX_DATA_DIR` (default `.fogdex-data/`) and is ignored by git. Types live in `src/types/killer.ts`, `src/types/survivor.ts`, and `src/types/perk.ts`.

Const arrays (`GENDERS`, `ATTACK_CATEGORIES`, `HEIGHTS`, `SORT_COLUMNS`, `PERK_ROLES`, etc.) are the single source of truth — used by types, nuqs parsers, filter UI, and zod validation.

**Perk descriptions** use named placeholders (`{speed}`, `{duration}`) with a `tierValues` tuple of 3 objects. Rendered with slash notation (`3/4/5`), collapsing when all tiers match. Status effect names in descriptions are bolded with hover tooltips.

Perk aliases are supported by the UI/schema but are not manually overridden; keep them game-sourced if alias extraction is added.

## Static assets

Killer portraits, survivor portraits, perk icons (all 256x256 WebP), and terror radius audio (OGG) are stored outside the repo. The `VITE_CDN_URL` env var (set in `.env`) provides the base URL — kept working via `envPrefix: ["PUBLIC_", "VITE_"]` in `astro.config.mjs`. Paths in private JSON data are relative (e.g. `/images/killers/trapper.webp`, `/images/survivors/meg-thomas.webp`, `/images/perks/sprint-burst.webp`) and prefixed at render time. Public asset buckets may use CORS for browser access; do not use the public asset bucket for private JSON data.

## Data Updates

Gameplay data is generated outside this public app repository and stored in a private Cloudflare R2 bucket. Required object keys:
- `killers.json`
- `survivors.json`
- `killer-perks.json`
- `survivor-perks.json`
- `status-effects.json`

Set `FOGDEX_DATA_BUCKET`, `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY`, then run `pnpm run data:pull` before `pnpm run validate-data` or `pnpm run dev`. Production builds run `data:pull` automatically when `.fogdex-data/` is missing. In GitHub Actions and Cloudflare builds, keep those values as secrets and use an R2 token scoped to the private data bucket. After local data changes, run `pnpm run validate-data` and `pnpm run data:push`.

## Conventions

- Tabs for indentation, double quotes (Biome default)
- Use `.ts`/`.tsx` extensions in imports
- Const arrays for enum-like values, types derived with `(typeof X)[number]`
- `node:fs/promises` in scripts, `import.meta.dirname` over `process.cwd()`
- No `tsx` package — Node 24 runs TypeScript natively
- React components that need browser APIs (`window`, `document`, `ResizeObserver`) must live in islands and run inside `useEffect`, not top-level
