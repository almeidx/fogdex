import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DATA_FILE_NAMES, getDataDir, writeDataUpdatedAt } from "../src/data/load.ts";

const R2_ENV_VARS = [
	"CLOUDFLARE_ACCOUNT_ID",
	"FOGDEX_DATA_BUCKET",
	"R2_ACCESS_KEY_ID",
	"R2_SECRET_ACCESS_KEY",
] as const;

function connect() {
	const missing = R2_ENV_VARS.filter((name) => !process.env[name]);
	if (missing.length > 0) {
		throw new Error(`Set ${missing.join(", ")} to sync private data with R2.`);
	}

	const env = process.env as Record<(typeof R2_ENV_VARS)[number], string>;
	const s3 = new S3Client({
		credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
		endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		region: "auto",
	});
	return { bucket: env.FOGDEX_DATA_BUCKET, s3 };
}

/** Downloads every data file and records the newest upload time as the data's update date. */
export async function pullData(): Promise<void> {
	const { bucket, s3 } = connect();
	const dataDir = getDataDir();
	await mkdir(dataDir, { recursive: true });

	let updatedAt = new Date(0);
	for (const fileName of DATA_FILE_NAMES) {
		console.log(`Downloading ${fileName} from ${bucket}.`);
		const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: fileName }));
		if (!response.Body || !response.LastModified) {
			throw new Error(`R2 returned no body or last-modified date for ${fileName}.`);
		}
		await writeFile(resolve(dataDir, fileName), await response.Body.transformToByteArray());
		if (response.LastModified > updatedAt) updatedAt = response.LastModified;
	}

	await writeDataUpdatedAt(updatedAt);
}

export async function pushData(): Promise<void> {
	const { bucket, s3 } = connect();
	const dataDir = getDataDir();

	for (const fileName of DATA_FILE_NAMES) {
		console.log(`Uploading ${fileName} to ${bucket}.`);
		await s3.send(
			new PutObjectCommand({
				Body: await readFile(resolve(dataDir, fileName)),
				Bucket: bucket,
				ContentType: "application/json",
				Key: fileName,
			}),
		);
	}
}
