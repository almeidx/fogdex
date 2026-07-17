# Fogdex

Fogdex is a static Astro site with React islands for interactive Dead by
Daylight reference tables. Cloudflare Workers serves the built assets.

`README.md` covers setup and `package.json` is the command source of truth. The
notes below capture project-specific boundaries rather than mirroring the file
tree.

## Architecture and data boundaries

- Astro pages load data at build time through `src/data/load.ts` and pass it to
  React islands. Do not expose R2 credentials or add client-side access to the
  private data bucket.
- The private JSON inputs live in `FOGDEX_DATA_DIR` (default
  `.fogdex-data/`) and are intentionally untracked. Use `pnpm data:pull` and
  `pnpm data:push`; never commit those files.
- Keep `src/types/` const arrays as the source of truth for enum-like values
  used by types, URL parsers, filters, and validation.
- Interactive filtering state belongs in React islands and `nuqs`. Static
  layout, metadata, and non-interactive content should stay in Astro where
  practical.
- Components that need browser globals must be hydrated and access those
  globals from an effect or event handler, not during server/build rendering.
- Image and audio paths in data are relative to `VITE_CDN_URL`. Keep private
  JSON storage separate from the public asset CDN.
- Perk descriptions use named placeholders plus three-tier value objects.
  Preserve that representation through validation and rendering.

## Useful areas

- `src/pages/` — routes and build-time data loading
- `src/islands/` and `src/hooks/` — interactive state and filtering
- `src/components/` — shared Astro and React presentation
- `src/types/` — data types and shared value sets
- `scripts/` — R2 synchronization, preparation, and validation

## Validation

Run the checks relevant to the change:

```sh
pnpm lint
pnpm build:typecheck
pnpm validate-data  # data schema or loader changes; requires local data
pnpm build          # routing, rendering, or deployment changes
```

Do not push private data or run `data:push` unless the user explicitly asks.
