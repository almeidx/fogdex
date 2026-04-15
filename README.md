# Fogdex

A filterable reference site for [Dead by Daylight](https://deadbydaylight.com) killers, survivors, and perks.

**[fogdex.almeidx.dev](https://fogdex.almeidx.dev)**

## Features

- **Killers**: stats for all 42+ killers (speed, terror radius, attack type, height, origin, release date, licensed status), terror radius audio playback
- **Survivors**: all 52+ survivors with gender, origin, chapter, release date, licensed status
- **Perks**: 300+ killer and survivor perks with tier values (slash notation), status effect tooltips, wiki tags, and perk aliases for renamed perks
- Rich filtering: text search, multi-select dropdowns, licensed toggle, tag and owner filters
- Active filter chips with one-click removal
- Sortable columns with shareable URL state (keyboard shortcut: `/` to search, `Escape` to clear)
- Cross-linking between characters and their perks
- Dark theme inspired by DBD's aesthetic
- Responsive: tables on desktop, cards on mobile
- Static JSON API at `/data/killers.json`, `/data/survivors.json`, `/data/killer-perks.json`, `/data/survivor-perks.json`

## Development

```sh
pnpm install
pnpm run dev
```

## Data updates

Game data is scraped from the [Dead by Daylight Wiki](https://deadbydaylight.wiki.gg) Lua modules using the `update-data` Claude Code agent. Run it to refresh all stats, then `pnpm run download-images` to fetch and upload portraits/icons to R2.

## License

Code is licensed under [AGPL-3.0](LICENSE).

Dead by Daylight is a trademark of Behaviour Interactive Inc. Character portraits, perk icons, terror radius audio, and data are sourced from the [Dead by Daylight Wiki](https://deadbydaylight.wiki.gg). This site is for educational/informational purposes only and is not affiliated with Behaviour Interactive.
