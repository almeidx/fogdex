import { join } from "node:path";
import { z } from "zod";
import { ATTACK_CATEGORIES, GENDERS, HEIGHTS } from "../src/types/killer.ts";
import { PERK_ROLES } from "../src/types/perk.ts";

const killerSchema = z.object({
	aliases: z.array(z.string()),
	attackCategory: z.enum(ATTACK_CATEGORIES),
	attackDetail: z.string().min(1),
	chapter: z.string().min(1),
	commonName: z.string().min(1),
	displayName: z.string().min(1),
	gender: z.enum(GENDERS),
	height: z.enum(HEIGHTS),
	id: z.string().regex(/^[a-z0-9-]+$/),
	licensed: z.boolean(),
	origin: z.string().min(1),
	portraitPath: z.string(),
	powerName: z.string().min(1),
	realName: z.string().nullable(),
	releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	speed: z.object({
		base: z.number().nonnegative(),
		percentage: z.number().nonnegative(),
		unit: z.string(),
	}),
	speedNotes: z.string().nullable(),
	terrorRadius: z.number().nonnegative(),
	terrorRadiusNotes: z.string().nullable(),
	weapon: z.string().min(1),
	wikiUrl: z.url(),
});

const survivorSchema = z.object({
	aliases: z.array(z.string()),
	chapter: z.string().min(1),
	commonName: z.string().min(1),
	displayName: z.string().min(1),
	gender: z.enum(GENDERS),
	id: z.string().regex(/^[a-z0-9-]+$/),
	licensed: z.boolean(),
	origin: z.string().min(1),
	portraitPath: z.string(),
	realName: z.string().nullable(),
	releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	wikiUrl: z.url(),
});

const tierValueEntry = z.record(z.string(), z.union([z.number(), z.string()]));
const tierValuesSchema = z.tuple([tierValueEntry, tierValueEntry, tierValueEntry]);

const perkSchema = z.object({
	aliases: z.array(z.string()),
	chapter: z.string().nullable(),
	description: z.string().min(1),
	iconPath: z.string(),
	id: z.string().regex(/^[a-z0-9-]+$/),
	name: z.string().min(1),
	owner: z.string().nullable(),
	ownerName: z.string().nullable(),
	role: z.enum(PERK_ROLES),
	tags: z.array(z.string()),
	tierValues: tierValuesSchema,
	wikiUrl: z.url(),
});

const dataDir = join(import.meta.dirname, "../src/data");

let hasErrors = false;

function validate(name: string, schema: z.ZodType, data: unknown) {
	const result = schema.safeParse(data);
	if (result.success) {
		const count = Array.isArray(result.data) ? result.data.length : 1;
		console.log(`Valid: ${count} ${name} passed schema validation.`);
	} else {
		hasErrors = true;
		console.error(`${name} validation errors:`);
		for (const issue of result.error.issues) {
			console.error(`  ${issue.path.join(".")}: ${issue.message}`);
		}
	}
}

const { default: killers } = await import(join(dataDir, "killers.json"), { with: { type: "json" } });
validate("killer(s)", z.array(killerSchema), killers);

const { default: survivors } = await import(join(dataDir, "survivors.json"), { with: { type: "json" } });
validate("survivor(s)", z.array(survivorSchema), survivors);

const { default: killerPerks } = await import(join(dataDir, "killer-perks.json"), { with: { type: "json" } });
validate("killer perk(s)", z.array(perkSchema), killerPerks);

const { default: survivorPerks } = await import(join(dataDir, "survivor-perks.json"), { with: { type: "json" } });
validate("survivor perk(s)", z.array(perkSchema), survivorPerks);

if (hasErrors) {
	process.exit(1);
}
