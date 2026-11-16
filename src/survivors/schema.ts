import { z } from "zod";
import { characterSchema } from "../characters/schema.ts";

export const survivorSchema = characterSchema.extend({
	id: z.string().regex(/^S\d{2}$/),
});

export type Survivor = z.infer<typeof survivorSchema>;
