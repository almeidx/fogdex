import { z } from "zod";
import { getDataDir, loadDataFile } from "../src/data/load.ts";
import { ATTACK_CATEGORIES, GENDERS, HEIGHTS } from "../src/types/killer.ts";
import { PERK_ROLES } from "../src/types/perk.ts";

const killerSchema = z.object({
	aliases: z.array(z.string()),
	attackCategory: z.enum(ATTACK_CATEGORIES),
	attackDetail: z.string().min(1),
	chapter: z.string().min(1),
	displayName: z.string().min(1),
	gameTags: z.array(z.string().min(1)),
	gender: z.enum(GENDERS),
	height: z.enum(HEIGHTS),
	id: z.string().regex(/^K\d{2}$/),
	licensed: z.boolean(),
	lullabyNotes: z.string().nullable(),
	lullabyRadius: z.number().nonnegative().nullable(),
	origin: z.string().min(1),
	portraitPath: z.string(),
	powerName: z.string().min(1),
	realName: z.string().nullable(),
	releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	slug: z.string().regex(/^[a-z0-9-]+$/),
	speed: z.number().nonnegative(),
	speedNotes: z.string().nullable(),
	terrorRadius: z.number().nonnegative(),
	terrorRadiusNotes: z.string().nullable(),
	weapon: z.string().min(1),
	wikiUrl: z.url(),
});

const survivorSchema = z.object({
	aliases: z.array(z.string()),
	chapter: z.string().min(1),
	displayName: z.string().min(1),
	gameTags: z.array(z.string().min(1)),
	gender: z.enum(GENDERS),
	id: z.string().regex(/^S\d{2}$/),
	licensed: z.boolean(),
	origin: z.string().min(1),
	portraitPath: z.string(),
	realName: z.string().nullable(),
	releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	slug: z.string().regex(/^[a-z0-9-]+$/),
	wikiUrl: z.url(),
});

const tierValueEntry = z.record(z.string(), z.union([z.number(), z.string()]));
const tierValuesSchema = z.tuple([tierValueEntry, tierValueEntry, tierValueEntry]);

const perkSchema = z.object({
	aliases: z.array(z.string()),
	chapter: z.string().nullable(),
	description: z.string().min(1),
	iconPath: z.string(),
	name: z.string().min(1),
	owner: z
		.string()
		.regex(/^[a-z0-9-]+$/)
		.nullable(),
	ownerName: z.string().nullable(),
	role: z.enum(PERK_ROLES),
	slug: z.string().regex(/^[a-z0-9-]+$/),
	tags: z.array(z.string()),
	tierValues: tierValuesSchema,
	wikiUrl: z.url(),
});

const statusEffectsSchema = z.record(z.string().min(1), z.string().min(1));

let hasErrors = false;

function validate<T>(name: string, schema: z.ZodType<T>, data: unknown): T | null {
	const result = schema.safeParse(data);
	if (result.success) {
		const count =
			typeof result.data === "object" && result.data !== null
				? Object.keys(result.data).length
				: Number(Boolean(result.data));
		console.log(`Valid: ${count} ${name} passed schema validation.`);
		return result.data;
	} else {
		hasErrors = true;
		console.error(`${name} validation errors:`);
		for (const issue of result.error.issues) {
			console.error(`  ${issue.path.join(".")}: ${issue.message}`);
		}
		return null;
	}
}

function validatePerkOwners(
	name: string,
	perks: Array<{ owner: string | null; slug: string }>,
	owners: Array<{ slug: string }>,
) {
	const ownerSlugs = new Set(owners.map((owner) => owner.slug));
	const invalid = perks.filter((perk) => perk.owner !== null && !ownerSlugs.has(perk.owner));
	if (invalid.length === 0) {
		console.log(`Valid: ${name} owner slugs all reference known characters.`);
		return;
	}

	hasErrors = true;
	console.error(`${name} owner reference errors:`);
	for (const perk of invalid) {
		console.error(`  ${perk.slug}: unknown owner slug ${perk.owner}`);
	}
}

function validatePerkTierPlaceholders(
	name: string,
	perks: Array<{
		description: string;
		slug: string;
		tierValues: [Record<string, number | string>, Record<string, number | string>, Record<string, number | string>];
	}>,
) {
	const errors: string[] = [];

	for (const perk of perks) {
		const placeholders = new Set([...perk.description.matchAll(/\{([^{}]+)\}/g)].map((match) => match[1]));
		const tierValueKeys = new Set(perk.tierValues.flatMap((tier) => Object.keys(tier)));

		for (const placeholder of placeholders) {
			if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(placeholder)) {
				errors.push(`${perk.slug}: invalid placeholder {${placeholder}}`);
				continue;
			}

			for (let tier = 0; tier < perk.tierValues.length; tier++) {
				if (!(placeholder in perk.tierValues[tier])) {
					errors.push(`${perk.slug}: missing tier ${tier + 1} value for {${placeholder}}`);
				}
			}
		}

		for (const tierValueKey of tierValueKeys) {
			if (!placeholders.has(tierValueKey)) {
				errors.push(`${perk.slug}: unused tier value ${tierValueKey}`);
			}
		}
	}

	if (errors.length === 0) {
		console.log(`Valid: ${name} descriptions and tier values are aligned.`);
		return;
	}

	hasErrors = true;
	console.error(`${name} tier value errors:`);
	for (const error of errors) {
		console.error(`  ${error}`);
	}
}

console.log(`Validating private data from ${getDataDir()}`);

const killers = validate("killer(s)", z.array(killerSchema), await loadDataFile<unknown>("killers.json"));

const survivors = validate("survivor(s)", z.array(survivorSchema), await loadDataFile<unknown>("survivors.json"));

const killerPerks = validate("killer perk(s)", z.array(perkSchema), await loadDataFile<unknown>("killer-perks.json"));
if (killerPerks && killers) {
	validatePerkOwners("killer perk(s)", killerPerks, killers);
	validatePerkTierPlaceholders("killer perk(s)", killerPerks);
}

const survivorPerks = validate(
	"survivor perk(s)",
	z.array(perkSchema),
	await loadDataFile<unknown>("survivor-perks.json"),
);
if (survivorPerks && survivors) {
	validatePerkOwners("survivor perk(s)", survivorPerks, survivors);
	validatePerkTierPlaceholders("survivor perk(s)", survivorPerks);
}

validate("status effect(s)", statusEffectsSchema, await loadDataFile<unknown>("status-effects.json"));

if (hasErrors) {
	process.exit(1);
}
