import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { DATA_FILE_NAMES, getDataDir, isMissingFile } from "../src/data/load.ts";
import { pullData } from "./r2.ts";

const dataDir = getDataDir();
const missingFiles: string[] = [];

for (const fileName of DATA_FILE_NAMES) {
	try {
		await access(resolve(dataDir, fileName));
	} catch (error) {
		if (!isMissingFile(error)) throw error;
		missingFiles.push(fileName);
	}
}

if (missingFiles.length === 0) {
	console.log(`Private data already available in ${dataDir}`);
} else {
	console.log(`Missing private data in ${dataDir}: ${missingFiles.join(", ")}`);
	console.log("Pulling private data from R2...");
	await pullData();
}
