import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DATA_FILE_NAMES, getDataDir, UPDATED_AT_FILE_NAME } from "../src/data/load.ts";

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

async function fetchObject(fileName: string): Promise<{ body: Uint8Array; lastModified: Date | undefined }> {
	const response = await s3.send(
		new GetObjectCommand({
			Bucket: bucket,
			Key: fileName,
		}),
	);

	if (!response.Body) {
		throw new Error(`Failed to download ${fileName}: response body was empty.`);
	}

	return { body: await response.Body.transformToByteArray(), lastModified: response.LastModified };
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

const lastModifiedDates: Date[] = [];

for (const fileName of DATA_FILE_NAMES) {
	const localPath = resolve(dataDir, fileName);

	if (action === "pull") {
		console.log(`Downloading ${fileName} from ${bucket}.`);
		await mkdir(dirname(localPath), { recursive: true });
		const { body, lastModified } = await fetchObject(fileName);
		await writeFile(localPath, body);
		if (lastModified) {
			lastModifiedDates.push(lastModified);
		}
	} else {
		console.log(`Uploading ${fileName} to ${bucket}.`);
		await putObject(fileName, await readFile(localPath));
	}
}

if (action === "pull") {
	if (lastModifiedDates.length !== DATA_FILE_NAMES.length) {
		console.error("R2 did not report a last-modified timestamp for every data file.");
		process.exit(1);
	}

	const updatedAt = lastModifiedDates.reduce((latest, date) => (date > latest ? date : latest));
	const updatedAtPath = resolve(dataDir, UPDATED_AT_FILE_NAME);
	console.log(`Writing ${updatedAtPath}.`);
	await writeFile(updatedAtPath, `${JSON.stringify({ updatedAt: updatedAt.toISOString() }, null, "\t")}\n`);
}
