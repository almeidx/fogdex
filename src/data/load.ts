import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const DATA_FILE_NAMES = [
	"killers.json",
	"survivors.json",
	"killer-perks.json",
	"survivor-perks.json",
	"status-effects.json",
] as const;

export type DataFileName = (typeof DATA_FILE_NAMES)[number];

export function getDataDir(): string {
	return resolve(process.cwd(), process.env.FOGDEX_DATA_DIR ?? ".fogdex-data");
}

export async function loadDataFile<T>(fileName: DataFileName): Promise<T> {
	const filePath = resolve(getDataDir(), fileName);

	try {
		return JSON.parse(await readFile(filePath, "utf8")) as T;
	} catch (error) {
		if (error instanceof SyntaxError) {
			throw new Error(`Invalid JSON in private data file: ${filePath}`, { cause: error });
		}

		if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
			throw new Error(
				`Missing private data file: ${filePath}. Run pnpm run data:pull or set FOGDEX_DATA_DIR to a populated data directory.`,
				{ cause: error },
			);
		}

		throw error;
	}
}
