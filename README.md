# Fogdex

A filterable reference site for [Dead by Daylight](https://deadbydaylight.com) killers, survivors, and perks.

**[fogdex.almeidx.dev](https://fogdex.almeidx.dev)**

## What it includes

- Killer stats, including speed, terror radius, height, attack type, origin, release date, licensed status, and terror radius audio
- Survivor stats, including gender, origin, chapter, release date, and licensed status
- Killer and survivor perk references with tier values, owner links, tags, and status-effect tooltips
- Rich filtering: text search, multi-select dropdowns, licensed toggle, tag and owner filters
- Active filter chips with one-click removal
- Sortable columns and shareable filter state in the URL
- Cross-linking between characters and their perks
- Responsive layouts for desktop and mobile

## Development

```sh
pnpm install
pnpm run dev
```

Useful checks:

```sh
pnpm run lint
pnpm run build:typecheck
pnpm run validate-data
pnpm run build
```

## License

Code is licensed under [AGPL-3.0](LICENSE).

Dead by Daylight is a trademark of Behaviour Interactive Inc. This site is for educational/informational purposes only and is not affiliated with Behaviour Interactive.
