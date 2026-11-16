import type { Perk } from "./schema.ts";

type DescriptionPart = { placeholder: string } | { text: string };

const PLACEHOLDER = /\{([^{}]+)\}/g;
export const PLACEHOLDER_NAME = /^[a-zA-Z][a-zA-Z0-9]*$/;

/** Splits a perk description into literal text and `{name}` placeholders for tier values. */
export function splitDescription(description: string): DescriptionPart[] {
	const parts: DescriptionPart[] = [];
	let index = 0;
	for (const match of description.matchAll(PLACEHOLDER)) {
		if (match.index > index) parts.push({ text: description.slice(index, match.index) });
		parts.push({ placeholder: match[1] });
		index = match.index + match[0].length;
	}
	if (index < description.length) parts.push({ text: description.slice(index) });
	return parts;
}

/** `5` when every tier has the same value, otherwise `3/4/5`. */
export function formatTierValue(tierValues: Perk["tierValues"], placeholder: string): string {
	const [v1, v2, v3] = tierValues.map((tier) => tier[placeholder]);
	return v1 === v2 && v2 === v3 ? String(v1) : `${v1}/${v2}/${v3}`;
}
