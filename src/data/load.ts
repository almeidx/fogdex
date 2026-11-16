import { readFile, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import { killerSchema } from "../killers/schema.ts";
import { perkSchema, statusEffectsSchema } from "../perks/schema.ts";
import type { Role } from "../roles.ts";
import { survivorSchema } from "../survivors/schema.ts";

export const DATA_FILES = {
	"killer-perks.json": z.array(perkSchema),
	"killers.json": z.array(killerSchema),
	"status-effects.json": statusEffectsSchema,
	"survivor-perks.json": z.array(perkSchema),
	"survivors.json": z.array(survivorSchema),
};

type DataFileName = keyof typeof DATA_FILES;

export const DATA_FILE_NAMES = Object.keys(DATA_FILES) as DataFileName[];

export function charactersFile(role: Role) {
	return `${role}s.json` as const;
}

export function perksFile(role: Role) {
	return `${role}-perks.json` as const;
}

const UPDATED_AT_FILE_NAME = "updated-at.json";

export function getDataDir(): string {
	return resolve(process.cwd(), process.env.FOGDEX_DATA_DIR ?? ".fogdex-data");
}

export function isMissingFile(error: unknown): boolean {
	return error instanceof Error && "code" in error && error.code === "ENOENT";
}

/** Reads a data file as JSON; validation is `pnpm validate-data`'s job. */
export async function loadDataFile<F extends DataFileName>(fileName: F): Promise<z.infer<(typeof DATA_FILES)[F]>> {
	const filePath = resolve(getDataDir(), fileName);

	try {
		return JSON.parse(await readFile(filePath, "utf8"));
	} catch (error) {
		if (error instanceof SyntaxError) {
			throw new Error(`Invalid JSON in private data file: ${filePath}`, { cause: error });
		}
		if (isMissingFile(error)) {
			throw new Error(
				`Missing private data file: ${filePath}. Run pnpm run data:pull or set FOGDEX_DATA_DIR to a populated data directory.`,
				{ cause: error },
			);
		}
		throw error;
	}
}

export async function writeDataUpdatedAt(updatedAt: Date): Promise<void> {
	const json = JSON.stringify({ updatedAt: updatedAt.toISOString() }, null, "\t");
	await writeFile(resolve(getDataDir(), UPDATED_AT_FILE_NAME), `${json}\n`);
}

/** When the data was last published, falling back to file times for data pulled before that was recorded. */
export async function getDataUpdatedAt(): Promise<Date> {
	try {
		const { updatedAt } = JSON.parse(await readFile(resolve(getDataDir(), UPDATED_AT_FILE_NAME), "utf8"));
		return new Date(z.iso.datetime().parse(updatedAt));
	} catch (error) {
		if (!isMissingFile(error)) throw error;
	}

	const stats = await Promise.all(DATA_FILE_NAMES.map((fileName) => stat(resolve(getDataDir(), fileName))));
	return stats.reduce((latest, { mtime }) => (mtime > latest ? mtime : latest), new Date(0));
}
