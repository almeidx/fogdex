import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, type Plugin } from "vite";

function copyDataPlugin(): Plugin {
	return {
		name: "copy-data",
		writeBundle() {
			mkdirSync("dist/data", { recursive: true });
			copyFileSync("src/data/killers.json", "dist/data/killers.json");
		},
	};
}

function jsonLdPlugin(): Plugin {
	return {
		name: "json-ld",
		transformIndexHtml() {
			const killers = JSON.parse(readFileSync("src/data/killers.json", "utf-8")) as {
				displayName: string;
				id: string;
			}[];
			const jsonLd = {
				"@context": "https://schema.org",
				"@type": "WebSite",
				description: "Dead by Daylight Killer Reference",
				mainEntity: {
					"@type": "ItemList",
					itemListElement: killers.map((k, i) => ({
						"@type": "ListItem",
						name: k.displayName,
						position: i + 1,
						url: `https://fogdex.almeidx.dev/#${k.id}`,
					})),
					numberOfItems: killers.length,
				},
				name: "Fogdex",
				url: "https://fogdex.almeidx.dev",
			};
			return [
				{
					attrs: { type: "application/ld+json" },
					children: JSON.stringify(jsonLd),
					injectTo: "head" as const,
					tag: "script",
				},
			];
		},
	};
}

export default defineConfig({
	plugins: [react(), tailwindcss(), copyDataPlugin(), jsonLdPlugin()],
});
