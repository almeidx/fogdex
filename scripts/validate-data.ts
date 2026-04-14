import { join } from "node:path";
import { z } from "zod";
import { ATTACK_CATEGORIES, GENDERS, HEIGHTS } from "../src/types/killer.ts";

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

const killersSchema = z.array(killerSchema);

const dataPath = join(import.meta.dirname, "../src/data/killers.json");
const { default: data } = await import(dataPath, { with: { type: "json" } });

const result = killersSchema.safeParse(data);

if (result.success) {
	console.log(`Valid: ${result.data.length} killer(s) passed schema validation.`);
} else {
	console.error("Validation errors:");
	for (const issue of result.error.issues) {
		console.error(`  ${issue.path.join(".")}: ${issue.message}`);
	}
	process.exit(1);
}
