/** schema.org ItemList linking each item to its anchor on `pagePath`. */
export function itemListJsonLd(site: URL | undefined, pagePath: string, items: { name: string; slug: string }[]) {
	if (!site) throw new Error("Set `site` in astro.config.mjs.");
	return {
		"@type": "ItemList",
		itemListElement: items.map((item, i) => ({
			"@type": "ListItem",
			name: item.name,
			position: i + 1,
			url: new URL(`${pagePath}#${item.slug}`, site).href,
		})),
		numberOfItems: items.length,
	};
}
