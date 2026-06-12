import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { DATA_FILE_NAMES, getDataDir } from "../src/data/load.ts";

const dataDir = getDataDir();
const missingFiles: string[] = [];

for (const fileName of DATA_FILE_NAMES) {
	try {
		await access(resolve(dataDir, fileName));
	} catch {
		missingFiles.push(fileName);
	}
}

if (missingFiles.length === 0) {
	console.log(`Private data already available in ${dataDir}`);
	process.exit(0);
}

if (!process.env.FOGDEX_DATA_BUCKET) {
	console.error(`Missing private data in ${dataDir}: ${missingFiles.join(", ")}`);
	console.error(
		"Run pnpm run data:pull or set FOGDEX_DATA_BUCKET, CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY so the build can pull private data from R2.",
	);
	process.exit(1);
}

console.log(`Missing private data in ${dataDir}: ${missingFiles.join(", ")}`);
console.log("Pulling private data from R2...");

await new Promise<void>((resolvePromise, reject) => {
	const child = spawn("pnpm", ["run", "data:pull"], {
		shell: process.platform === "win32",
		stdio: "inherit",
	});

	child.on("error", reject);
	child.on("close", (code) => {
		if (code === 0) {
			resolvePromise();
			return;
		}

		reject(new Error(`data:pull exited with status ${code}`));
	});
});
