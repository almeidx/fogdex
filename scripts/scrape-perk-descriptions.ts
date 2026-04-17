import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Perk } from "../src/types/perk.ts";

const DATA_DIR = join(import.meta.dirname, "..", "src", "data");
const WIKI_API = "https://deadbydaylight.wiki.gg/api.php";
const FILES = ["killer-perks.json", "survivor-perks.json"] as const;
const RATE_LIMIT_MS = 150;

const DRY_RUN = process.argv.includes("--dry-run");
const VERBOSE = process.argv.includes("--verbose");
const LIMIT = numFlag("--limit");
const ONLY = strFlag("--only");

function strFlag(flag: string): string | null {
	const idx = process.argv.indexOf(flag);
	return idx === -1 ? null : (process.argv[idx + 1] ?? null);
}

function numFlag(flag: string): number | null {
	const v = strFlag(flag);
	return v === null ? null : Number(v);
}

type TierObj = Record<string, number | string>;
type TierTuple = [TierObj, TierObj, TierObj];

async function fetchRenderedHtml(wikiUrl: string): Promise<string> {
	const slug = wikiUrl.split("/wiki/")[1];
	const url = `${WIKI_API}?action=parse&page=${encodeURIComponent(decodeURIComponent(slug))}&prop=text&format=json&formatversion=2&redirects=1`;
	const res = await fetch(url, { headers: { "user-agent": "fogdex-scraper (https://github.com/almeidx/fogdex)" } });
	if (!res.ok) throw new Error(`HTTP ${res.status} for ${slug}`);
	const json = (await res.json()) as { parse?: { text?: string | { "*": string } }; error?: { info?: string } };
	if (json.error) throw new Error(`wiki error: ${json.error.info}`);
	const text = json.parse?.text;
	if (!text) throw new Error(`no parse.text for ${slug}`);
	return typeof text === "string" ? text : text["*"];
}

function parseDescription(html: string): { description: string; tierValues: TierTuple } {
	const blockMatch = html.match(/<div class="perkDesc divTableCell">([\s\S]*?)<\/div>\s*(?=<div|<\/div|$)/);
	if (!blockMatch) throw new Error("perkDesc block not found");
	let inner = blockMatch[1];

	inner = inner.replace(/<i>\s*<span[^>]*class="[^"]*clr9[^"]*"[^>]*>[\s\S]*?<\/span>\s*<\/i>/gi, "");

	const tierValues: TierTuple = [{}, {}, {}];
	const usedKeys = new Set<string>();

	const tierRegex =
		/<b>\s*<span[^>]*>([^<]+)<\/span>\s*<\/b>\s*\/\s*<b>\s*<span[^>]*>([^<]+)<\/span>\s*<\/b>\s*\/\s*<b>\s*<span[^>]*>([^<]+)<\/span>\s*<\/b>/g;

	inner = inner.replace(tierRegex, (match, v1: string, v2: string, v3: string, offset: number, full: string) => {
		const afterRaw = full.slice(offset + match.length, offset + match.length + 200);
		const afterText = stripHtml(afterRaw).trim();
		const unitMatch = afterText.match(/^\s*(%|[a-zA-Z]+)/);
		const unit = unitMatch?.[1]?.toLowerCase() ?? "value";
		const baseKey = unitToKey(unit);

		let key = baseKey;
		let n = 2;
		while (usedKeys.has(key)) {
			key = `${baseKey}${n}`;
			n++;
		}
		usedKeys.add(key);

		tierValues[0][key] = parseNum(v1);
		tierValues[1][key] = parseNum(v2);
		tierValues[2][key] = parseNum(v3);

		return `{${key}}`;
	});

	inner = inner.replace(/<li[^>]*>/gi, " ").replace(/<\/li>/gi, "");
	inner = inner.replace(/<ul[^>]*>/gi, "").replace(/<\/ul>/gi, "");
	inner = inner.replace(/<p>/gi, " ").replace(/<\/p>/gi, " ");
	inner = inner.replace(/<br\s*\/?>/gi, " ");

	let description = stripHtml(inner);
	description = description.replace(/\s+/g, " ").trim();
	description = description.replace(/\s+([.,;:!?])/g, "$1");
	description = description.replace(/\}\s+%/g, "}%");

	return { description, tierValues };
}

function deriveTags(name: string, description: string): string[] {
	const tags: string[] = [];

	if (/^Boon:/i.test(name)) tags.push("Boon");
	if (/^Hex:/i.test(name)) tags.push("Hex");
	if (/^Invocation:/i.test(name)) tags.push("Invocation");
	if (/^Scourge Hook:/i.test(name)) tags.push("Scourge Hook");
	if (/^Teamwork:/i.test(name)) tags.push("Teamwork");

	const hasAuraReveal =
		/\bAura[s]?\b/.test(description) &&
		(/Aura[s]?\b[^.]*?\b(?:revealed|highlight(?:ed)?|shown)\b/i.test(description) ||
			/\b(?:reveal|highlight|show)[a-z]*\b[^.]*?\bAura/i.test(description));
	if (hasAuraReveal) tags.push("Aura Reading");

	if (/\bExhaust(?:ion|ed)\b/.test(description)) tags.push("Exhaustion");
	if (/\bExposed\b/.test(description)) tags.push("Exposed");
	if (/\bHaste\b/.test(description)) tags.push("Haste");
	if (/\bHindered\b/.test(description)) tags.push("Hindered");
	if (/\bObsession\b/.test(description)) tags.push("Obsession");
	if (/\bUndetectable\b/.test(description)) tags.push("Undetectable");

	return tags.sort();
}

function parseNum(s: string): number | string {
	const t = s.trim();
	return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : t;
}

function unitToKey(unit: string): string {
	switch (unit) {
		case "%":
		case "percent":
			return "percentage";
		case "seconds":
		case "second":
		case "s":
			return "duration";
		case "metres":
		case "meters":
		case "metre":
		case "meter":
		case "m":
			return "range";
		case "tokens":
		case "token":
			return "tokens";
		case "points":
		case "point":
			return "points";
		default:
			return "value";
	}
}

function stripHtml(s: string): string {
	return s
		.replace(/<[^>]+>/g, "")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#0?39;/g, "'")
		.replace(/&#(\d+);/g, (_m, n: string) => String.fromCharCode(Number(n)))
		.replace(/&#x([0-9a-f]+);/gi, (_m, n: string) => String.fromCharCode(Number.parseInt(n, 16)));
}

function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}

function filterPerks(perks: Perk[]): Perk[] {
	let result = perks;
	if (ONLY) {
		const ids = new Set(ONLY.split(","));
		result = result.filter((p) => ids.has(p.id));
	}
	if (LIMIT) result = result.slice(0, LIMIT);
	return result;
}

async function processFile(file: string): Promise<{ ok: number; fail: number; changed: number }> {
	const path = join(DATA_DIR, file);
	const perks: Perk[] = JSON.parse(await readFile(path, "utf8"));
	const target = filterPerks(perks);
	let ok = 0;
	let fail = 0;
	let changed = 0;

	console.log(`\n=== ${file} (processing ${target.length}/${perks.length}) ===\n`);

	for (const perk of target) {
		try {
			const html = await fetchRenderedHtml(perk.wikiUrl);
			const { description, tierValues } = parseDescription(html);
			const tags = deriveTags(perk.name, description);

			const descChanged = description !== perk.description;
			const tiersChanged = JSON.stringify(tierValues) !== JSON.stringify(perk.tierValues);
			const tagsChanged = JSON.stringify(tags) !== JSON.stringify([...perk.tags].sort());

			if (descChanged || tiersChanged || tagsChanged) {
				changed++;
				console.log(`[${perk.id}]`);
				if (descChanged) {
					console.log(`  - ${perk.description}`);
					console.log(`  + ${description}`);
				}
				if (tiersChanged) {
					console.log(`  tiers: ${JSON.stringify(perk.tierValues)} -> ${JSON.stringify(tierValues)}`);
				}
				if (tagsChanged) {
					console.log(`  tags:  ${JSON.stringify([...perk.tags].sort())} -> ${JSON.stringify(tags)}`);
				}
			} else if (VERBOSE) {
				console.log(`[${perk.id}] unchanged`);
			}

			perk.description = description;
			perk.tierValues = tierValues;
			perk.tags = tags;
			ok++;
		} catch (err) {
			fail++;
			console.error(`[${perk.id}] FAIL: ${(err as Error).message}`);
		}

		await sleep(RATE_LIMIT_MS);
	}

	if (!DRY_RUN && changed > 0) {
		await writeFile(path, `${JSON.stringify(perks, null, "\t")}\n`, "utf8");
	}

	return { changed, fail, ok };
}

async function main(): Promise<void> {
	const totals = { changed: 0, fail: 0, ok: 0 };
	for (const file of FILES) {
		const r = await processFile(file);
		totals.ok += r.ok;
		totals.fail += r.fail;
		totals.changed += r.changed;
	}
	console.log(`\n=== summary ===`);
	console.log(
		`ok: ${totals.ok}, failed: ${totals.fail}, changed: ${totals.changed}${DRY_RUN ? " (dry run — no files written)" : ""}`,
	);
}

await main();
