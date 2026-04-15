# Fogdex

A filterable reference site for all [Dead by Daylight](https://deadbydaylight.com) killers.

**[fogdex.almeidx.dev](https://fogdex.almeidx.dev)**

## Features

- Stats for all 42+ killers: speed, terror radius, attack type, height, origin, release date, licensed status
- Terror radius audio playback for each killer
- Rich filtering: text search, numeric ranges, multi-select dropdowns, licensed toggle
- Active filter chips with one-click removal
- Sortable columns with shareable URL state (keyboard shortcut: `/` to search, `Escape` to clear)
- Sticky table header + filter bar
- Dark theme inspired by DBD's aesthetic
- Responsive: table on desktop, cards on mobile
- Static JSON API at `/data/killers.json`

## Development

```sh
pnpm install
pnpm run dev
```

## Data updates

Killer data is scraped from the [Dead by Daylight Wiki](https://deadbydaylight.wiki.gg) using the `update-data` Claude Code agent. Run it to refresh all killer stats and portraits.

## License

Code is licensed under [AGPL-3.0](LICENSE).

Dead by Daylight is a trademark of Behaviour Interactive Inc. Killer portraits, terror radius audio, and data are sourced from the [Dead by Daylight Wiki](https://deadbydaylight.wiki.gg). This site is for educational/informational purposes only and is not affiliated with Behaviour Interactive.
