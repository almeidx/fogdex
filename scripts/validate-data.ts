import { charactersFile, DATA_FILE_NAMES, DATA_FILES, getDataDir, loadDataFile, perksFile } from "../src/data/load.ts";
import { PLACEHOLDER_NAME, splitDescription } from "../src/perks/description.ts";
import type { Perk } from "../src/perks/schema.ts";
import { ROLES } from "../src/roles.ts";

let hasErrors = false;

function report(subject: string, errors: string[]) {
	if (errors.length === 0) {
		console.log(`Valid: ${subject}.`);
		return;
	}
	hasErrors = true;
	console.error(`Invalid: ${subject}:`);
	for (const error of errors) console.error(`  ${error}`);
}

function tierValueErrors(perk: Perk): string[] {
	const placeholders = new Set(
		splitDescription(perk.description).flatMap((part) => ("placeholder" in part ? [part.placeholder] : [])),
	);
	const errors: string[] = [];

	for (const placeholder of placeholders) {
		if (!PLACEHOLDER_NAME.test(placeholder)) {
			errors.push(`${perk.slug}: invalid placeholder {${placeholder}}`);
			continue;
		}
		perk.tierValues.forEach((tier, i) => {
			if (!(placeholder in tier)) errors.push(`${perk.slug}: missing tier ${i + 1} value for {${placeholder}}`);
		});
	}
	for (const key of new Set(perk.tierValues.flatMap((tier) => Object.keys(tier)))) {
		if (!placeholders.has(key)) errors.push(`${perk.slug}: unused tier value ${key}`);
	}
	return errors;
}

console.log(`Validating private data from ${getDataDir()}`);

const schemaValid = new Set<string>();
for (const fileName of DATA_FILE_NAMES) {
	const result = DATA_FILES[fileName].safeParse(await loadDataFile(fileName));
	const count = result.success ? Object.keys(result.data).length : 0;
	report(
		`${fileName} schema (${count} entries)`,
		result.error?.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`) ?? [],
	);
	if (result.success) schemaValid.add(fileName);
}

for (const role of ROLES) {
	if (!schemaValid.has(perksFile(role)) || !schemaValid.has(charactersFile(role))) continue;

	const perks = await loadDataFile(perksFile(role));
	const owners = new Set((await loadDataFile(charactersFile(role))).map((character) => character.slug));
	report(
		`${perksFile(role)} owners exist in ${charactersFile(role)}`,
		perks.flatMap((perk) =>
			perk.owner !== null && !owners.has(perk.owner) ? [`${perk.slug}: unknown owner slug ${perk.owner}`] : [],
		),
	);
	report(
		`${perksFile(role)} perks are ${role} perks`,
		perks.flatMap((perk) => (perk.role === role ? [] : [`${perk.slug}: role is ${perk.role}`])),
	);
	report(`${perksFile(role)} descriptions match tier values`, perks.flatMap(tierValueErrors));
}

if (hasErrors) {
	process.exit(1);
}
