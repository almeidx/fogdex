import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const [url, slug] = process.argv.slice(2);

if (!url || !slug) {
	console.error("Usage: node scripts/download-image.ts <url> <slug>");
	process.exit(1);
}

const response = await fetch(url);
if (!response.ok) {
	console.error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
	process.exit(1);
}

const buffer = Buffer.from(await response.arrayBuffer());
const outputDir = join(import.meta.dirname, "../public/images/killers");
await mkdir(outputDir, { recursive: true });

const outputPath = join(outputDir, `${slug}.webp`);
await sharp(buffer).resize(256, 256, { fit: "cover" }).webp({ quality: 85 }).toFile(outputPath);

console.log(`Saved: public/images/killers/${slug}.webp`);
