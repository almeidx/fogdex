import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DATA_FILE_NAMES, getDataDir } from "../src/data/load.ts";

const action = process.argv[2];

if (action !== "pull" && action !== "push") {
	console.error("Usage: pnpm run data:pull | pnpm run data:push");
	process.exit(1);
}

const dataDir = getDataDir();

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		console.error(`${name} is required.`);
		process.exit(1);
	}

	return value;
}

const accountId = requireEnv("CLOUDFLARE_ACCOUNT_ID");
const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
const bucket = requireEnv("FOGDEX_DATA_BUCKET");
const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");

const s3 = new S3Client({
	credentials: {
		accessKeyId,
		secretAccessKey,
	},
	endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
	region: "auto",
});

async function fetchObject(fileName: string): Promise<Uint8Array> {
	const response = await s3.send(
		new GetObjectCommand({
			Bucket: bucket,
			Key: fileName,
		}),
	);

	if (!response.Body) {
		throw new Error(`Failed to download ${fileName}: response body was empty.`);
	}

	return response.Body.transformToByteArray();
}

async function putObject(fileName: string, body: Buffer): Promise<void> {
	await s3.send(
		new PutObjectCommand({
			Body: body,
			Bucket: bucket,
			ContentType: "application/json",
			Key: fileName,
		}),
	);
}

for (const fileName of DATA_FILE_NAMES) {
	const localPath = resolve(dataDir, fileName);

	if (action === "pull") {
		console.log(`Downloading ${fileName} from ${bucket}.`);
		await mkdir(dirname(localPath), { recursive: true });
		await writeFile(localPath, await fetchObject(fileName));
	} else {
		console.log(`Uploading ${fileName} to ${bucket}.`);
		await putObject(fileName, await readFile(localPath));
	}
}
