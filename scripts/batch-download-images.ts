import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const WIKI_API = "https://deadbydaylight.wiki.gg/api.php";
const BUCKET = "fogdex";
const CONCURRENCY = 2;
const DELAY_BETWEEN_DOWNLOADS_MS = 300;
const MAX_RETRIES = 3;
const TMP_DIR = join(import.meta.dirname, "../.tmp-images");

type ImageTask = { id: string; wikiPageName: string; r2Path: string };

// --- Helpers ---

async function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
	for (let attempt = 0; attempt <= retries; attempt++) {
		const resp = await fetch(url);
		if (resp.ok) return resp;
		if (resp.status === 429 && attempt < retries) {
			const backoff = 2000 * 2 ** attempt;
			console.log(`    Rate limited, retrying in ${backoff / 1000}s...`);
			await sleep(backoff);
			continue;
		}
		throw new Error(`${resp.status} ${resp.statusText}`);
	}
	throw new Error("Max retries exceeded");
}

// Batch-resolve page main images via MediaWiki API (50 titles per request)
async function resolveImageUrls(pageTitles: string[]): Promise<Map<string, string>> {
	const result = new Map<string, string>();
	const batchSize = 50;

	for (let i = 0; i < pageTitles.length; i += batchSize) {
		const batch = pageTitles.slice(i, i + batchSize);
		const titles = batch.join("|");
		const url = `${WIKI_API}?action=query&titles=${encodeURIComponent(titles)}&prop=pageimages&piprop=original&format=json&redirects=1`;

		const resp = await fetchWithRetry(url);
		const data = (await resp.json()) as {
			query: {
				pages: Record<string, { title: string; original?: { source: string } }>;
				redirects?: { from: string; to: string }[];
				normalized?: { from: string; to: string }[];
			};
		};

		// Build redirect/normalization maps so we can map back to original titles
		const redirectMap = new Map<string, string>();
		for (const r of data.query.redirects ?? []) {
			redirectMap.set(r.to, r.from);
		}
		const normalizeMap = new Map<string, string>();
		for (const n of data.query.normalized ?? []) {
			normalizeMap.set(n.to, n.from);
		}

		for (const page of Object.values(data.query.pages)) {
			if (page.original?.source) {
				// Try to map back to the original title we queried with
				let originalTitle = page.title;
				originalTitle = redirectMap.get(originalTitle) ?? originalTitle;
				originalTitle = normalizeMap.get(originalTitle) ?? originalTitle;
				result.set(originalTitle, page.original.source);
				// Also store under the resolved title for fallback matching
				result.set(page.title, page.original.source);
			}
		}

		if (i + batchSize < pageTitles.length) {
			await sleep(500);
		}
	}

	return result;
}

async function downloadAndProcess(imageUrl: string, outputPath: string) {
	const resp = await fetchWithRetry(imageUrl);
	const buffer = Buffer.from(await resp.arrayBuffer());
	await sharp(buffer).resize(256, 256, { fit: "cover" }).webp({ quality: 85 }).toFile(outputPath);
}

function uploadToR2(localPath: string, r2Key: string) {
	execSync(`npx wrangler r2 object put "${BUCKET}/${r2Key}" --file="${localPath}" --remote`, {
		env: {
			...process.env,
			CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID ?? "c4679be27f813b0665fb140d255f1850",
		},
		stdio: "pipe",
	});
}

// --- Main ---

const dataDir = join(import.meta.dirname, "../src/data");

const args = process.argv.slice(2);
const validTypes = ["survivors", "perks", "all"];
const type = args[0] ?? "all";
if (!validTypes.includes(type)) {
	console.error(`Usage: node scripts/batch-download-images.ts [survivors|perks|all]`);
	process.exit(1);
}

const doSurvivors = type === "survivors" || type === "all";
const doPerks = type === "perks" || type === "all";

await mkdir(TMP_DIR, { recursive: true });

const tasks: ImageTask[] = [];

if (doSurvivors) {
	const survivors = JSON.parse(await readFile(join(dataDir, "survivors.json"), "utf-8")) as {
		id: string;
		wikiUrl: string;
	}[];
	for (const s of survivors) {
		// Decode URL-encoded characters: %27 -> ', %26 -> &, %C3%A9 -> é, etc.
		const pageName = decodeURIComponent(s.wikiUrl.replace("https://deadbydaylight.wiki.gg/wiki/", "")).replaceAll(
			"_",
			" ",
		);
		tasks.push({ id: s.id, r2Path: `images/survivors/${s.id}.webp`, wikiPageName: pageName });
	}
}

if (doPerks) {
	const killerPerks = JSON.parse(await readFile(join(dataDir, "killer-perks.json"), "utf-8")) as {
		id: string;
		wikiUrl: string;
	}[];
	const survivorPerks = JSON.parse(await readFile(join(dataDir, "survivor-perks.json"), "utf-8")) as {
		id: string;
		wikiUrl: string;
	}[];
	for (const p of [...killerPerks, ...survivorPerks]) {
		const pageName = decodeURIComponent(p.wikiUrl.replace("https://deadbydaylight.wiki.gg/wiki/", "")).replaceAll(
			"_",
			" ",
		);
		tasks.push({ id: p.id, r2Path: `images/perks/${p.id}.webp`, wikiPageName: pageName });
	}
}

console.log(`Resolving image URLs for ${tasks.length} pages...`);
const imageUrls = await resolveImageUrls(tasks.map((t) => t.wikiPageName));

const resolved = tasks.filter((t) => imageUrls.has(t.wikiPageName));
const missing = tasks.filter((t) => !imageUrls.has(t.wikiPageName));

if (missing.length > 0) {
	console.warn(`\nCould not resolve images for ${missing.length} pages:`);
	for (const m of missing) {
		console.warn(`  - ${m.wikiPageName} (${m.id})`);
	}
}

console.log(`\nDownloading and processing ${resolved.length} images (concurrency: ${CONCURRENCY})...`);

let downloaded = 0;
let failed = 0;

// Sequential with delay to avoid rate limiting
for (let i = 0; i < resolved.length; i += CONCURRENCY) {
	const batch = resolved.slice(i, i + CONCURRENCY);
	const results = await Promise.allSettled(
		batch.map(async (task) => {
			const imageUrl = imageUrls.get(task.wikiPageName) as string;
			const localPath = join(TMP_DIR, `${task.id}.webp`);
			await downloadAndProcess(imageUrl, localPath);
			return task;
		}),
	);

	for (const result of results) {
		if (result.status === "fulfilled") {
			downloaded++;
		} else {
			failed++;
			console.error(`  Failed: ${result.reason}`);
		}
	}

	if (downloaded % 50 === 0 && downloaded > 0) {
		console.log(`  Progress: ${downloaded}/${resolved.length}`);
	}

	if (i + CONCURRENCY < resolved.length) {
		await sleep(DELAY_BETWEEN_DOWNLOADS_MS);
	}
}

console.log(`\nDownloaded: ${downloaded}, Failed: ${failed}`);

console.log(`\nUploading ${downloaded} images to R2 bucket "${BUCKET}"...`);

let uploaded = 0;
let uploadFailed = 0;

for (const task of resolved) {
	const localPath = join(TMP_DIR, `${task.id}.webp`);
	if (!existsSync(localPath)) continue;

	try {
		uploadToR2(localPath, task.r2Path);
		uploaded++;
		if (uploaded % 50 === 0) {
			console.log(`  Uploaded ${uploaded}/${downloaded}`);
		}
	} catch (err) {
		uploadFailed++;
		console.error(`  Upload failed: ${task.r2Path} - ${(err as Error).message}`);
	}
}

console.log(`\nUploaded: ${uploaded}, Failed: ${uploadFailed}`);

await rm(TMP_DIR, { recursive: true });
console.log("Done. Temp files cleaned up.");
