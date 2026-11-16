import { parseAsArrayOf, parseAsString } from "nuqs";
import { defineList, type FilteredListOf } from "../ui/filteredList.ts";
import { matchesSearch, matchesSelection } from "../ui/match.ts";
import type { Perk } from "./schema.ts";

const UNIVERSAL_OWNER = "__universal__";

/** Owner filter value: the owner's slug, or a stand-in for perks without one. */
function perkOwnerKey(perk: Perk): string {
	if (perk.owner) return perk.owner;
	if (perk.ownerName) return `__missing_owner__:${perk.ownerName}`;
	return UNIVERSAL_OWNER;
}

/** Owner filter value → label, sorted by label, with Universal last. */
export function perkOwnerOptions(perks: Perk[]): Map<string, string> {
	const owners = new Map<string, string>();
	for (const perk of perks) {
		if (perk.ownerName) owners.set(perkOwnerKey(perk), perk.ownerName);
	}
	return new Map([...[...owners].sort((a, b) => a[1].localeCompare(b[1])), [UNIVERSAL_OWNER, "Universal"]]);
}

export const perkList = defineList({
	filters: {
		chapters: parseAsArrayOf(parseAsString).withDefault([]),
		owners: parseAsArrayOf(parseAsString).withDefault([]),
		search: parseAsString.withDefault(""),
		tags: parseAsArrayOf(parseAsString).withDefault([]),
	},
	matches: (perk: Perk, filters) =>
		matchesSearch(filters.search, [perk.name, ...perk.aliases, perk.description]) &&
		(filters.tags.length === 0 || filters.tags.some((tag) => perk.tags.includes(tag))) &&
		matchesSelection(filters.owners, perkOwnerKey(perk)) &&
		matchesSelection<string | null>(filters.chapters, perk.chapter),
	sorts: {
		name: { compare: (a, b) => a.name.localeCompare(b.name), label: "Name" },
		owner: {
			compare: (a, b) => (a.ownerName ?? "\uffff").localeCompare(b.ownerName ?? "\uffff"),
			label: "Owner",
		},
	},
	urlKeys: { chapters: "chapter", owners: "owner", search: "q", tags: "tag" },
});

export type PerkFilteredList = FilteredListOf<typeof perkList>;
