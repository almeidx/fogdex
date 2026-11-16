import { z } from "zod";
import { GENDERS } from "./character.ts";

export const slugSchema = z.string().regex(/^[a-z0-9-]+$/);

export const characterSchema = z.object({
	aliases: z.array(z.string()),
	chapter: z.string().min(1),
	displayName: z.string().min(1),
	gameTags: z.array(z.string().min(1)),
	gender: z.enum(GENDERS),
	id: z.string(),
	licensed: z.boolean(),
	origin: z.string().min(1),
	portraitPath: z.string(),
	realName: z.string().nullable(),
	releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	slug: slugSchema,
	wikiUrl: z.url(),
});

export type Character = z.infer<typeof characterSchema>;
