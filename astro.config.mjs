import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
	integrations: [
		react(),
		sitemap({
			serialize(item) {
				return { ...item, lastmod: new Date().toISOString() };
			},
		}),
	],
	output: "static",
	site: "https://fogdex.almeidx.dev",
	vite: {
		envPrefix: ["PUBLIC_", "VITE_"],
		plugins: [tailwindcss()],
	},
});
