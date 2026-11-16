import { z } from "zod";
import { characterSchema } from "../characters/schema.ts";
import { ATTACK_CATEGORIES, HEIGHTS } from "./killer.ts";

export const killerSchema = characterSchema.extend({
	attackCategory: z.enum(ATTACK_CATEGORIES),
	attackDetail: z.string().min(1),
	height: z.enum(HEIGHTS),
	id: z.string().regex(/^K\d{2}$/),
	lullabyNotes: z.string().nullable(),
	lullabyRadius: z.number().nonnegative().nullable(),
	powerName: z.string().min(1),
	speed: z.number().nonnegative(),
	speedNotes: z.string().nullable(),
	terrorRadius: z.number().nonnegative(),
	terrorRadiusNotes: z.string().nullable(),
	weapon: z.string().min(1),
});

export type Killer = z.infer<typeof killerSchema>;
