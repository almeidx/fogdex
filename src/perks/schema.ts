import { z } from "zod";
import { slugSchema } from "../characters/schema.ts";
import { ROLES } from "../roles.ts";

const tierValues = z.record(z.string(), z.union([z.number(), z.string()]));

export const perkSchema = z.object({
	aliases: z.array(z.string()),
	chapter: z.string().nullable(),
	description: z.string().min(1),
	iconPath: z.string(),
	name: z.string().min(1),
	owner: slugSchema.nullable(),
	ownerName: z.string().nullable(),
	role: z.enum(ROLES),
	slug: slugSchema,
	tags: z.array(z.string()),
	tierValues: z.tuple([tierValues, tierValues, tierValues]),
	wikiUrl: z.url(),
});

export type Perk = z.infer<typeof perkSchema>;

export const statusEffectsSchema = z.record(z.string().min(1), z.string().min(1));

/** Status effect name → explanation. */
export type StatusEffects = z.infer<typeof statusEffectsSchema>;
