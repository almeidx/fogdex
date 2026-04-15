import type { SortDirection } from "./killer.ts";

export const PERK_ROLES = ["killer", "survivor"] as const;
export type PerkRole = (typeof PERK_ROLES)[number];

export const PERK_SORT_COLUMNS = ["name", "owner"] as const;
export type PerkSortColumn = (typeof PERK_SORT_COLUMNS)[number];

export interface Perk {
	aliases: string[];
	chapter: string | null;
	description: string;
	iconPath: string;
	id: string;
	name: string;
	owner: string | null;
	ownerName: string | null;
	role: PerkRole;
	tags: string[];
	tierValues: [Record<string, number | string>, Record<string, number | string>, Record<string, number | string>];
	wikiUrl: string;
}

export interface PerkFilters {
	chapters: string[];
	owners: string[];
	search: string;
	tags: string[];
}

export interface PerkSortState {
	column: PerkSortColumn;
	direction: SortDirection;
}
