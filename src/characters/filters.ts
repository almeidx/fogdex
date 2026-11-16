import { createSerializer, parseAsArrayOf, parseAsString, parseAsStringLiteral, type Values } from "nuqs";
import type { Role } from "../roles.ts";
import { charactersPath } from "../routes.ts";
import { matchesSearch, matchesSelection } from "../ui/match.ts";
import type { Sorts } from "../ui/sort.ts";
import { GENDERS } from "./character.ts";
import type { Character } from "./schema.ts";

export const LICENSED_OPTIONS = ["all", "yes", "no"] as const;
export type LicensedOption = (typeof LICENSED_OPTIONS)[number];

/** Filters every character page has. */
export const characterFilters = {
	genders: parseAsArrayOf(parseAsStringLiteral(GENDERS)).withDefault([]),
	licensed: parseAsStringLiteral(LICENSED_OPTIONS).withDefault("all"),
	origins: parseAsArrayOf(parseAsString).withDefault([]),
	search: parseAsString.withDefault(""),
};

export const characterUrlKeys = { genders: "gender", origins: "origin", search: "q" } as const;

export type CharacterFilters = Values<typeof characterFilters>;

const characterHref = createSerializer(characterFilters, { urlKeys: characterUrlKeys });

/** Link to a character page searched for one character. */
export function characterSearchHref(role: Role, slug: string): string {
	return characterHref(charactersPath(role), { search: slug });
}

export function matchesCharacter(
	character: Character,
	filters: CharacterFilters,
	extraSearchFields: readonly string[] = [],
): boolean {
	return (
		matchesSearch(filters.search, [
			character.slug,
			character.displayName,
			character.id,
			character.realName,
			...character.aliases,
			...character.gameTags,
			...extraSearchFields,
		]) &&
		matchesSelection(filters.genders, character.gender) &&
		matchesSelection(filters.origins, character.origin) &&
		(filters.licensed === "all" || character.licensed === (filters.licensed === "yes"))
	);
}

export const characterSorts = {
	name: { compare: (a, b) => a.displayName.localeCompare(b.displayName), label: "Name" },
	origin: { compare: (a, b) => a.origin.localeCompare(b.origin), label: "Origin" },
	releaseDate: { compare: (a, b) => a.releaseDate.localeCompare(b.releaseDate), label: "Released" },
	licensed: { compare: (a, b) => Number(a.licensed) - Number(b.licensed), label: "Licensed" },
} satisfies Sorts<Character, string>;
