import type { Gender, LicensedOption, SortDirection } from "./killer.ts";

export const SURVIVOR_SORT_COLUMNS = ["name", "origin", "releaseDate", "licensed"] as const;
export type SurvivorSortColumn = (typeof SURVIVOR_SORT_COLUMNS)[number];

export interface Survivor {
	aliases: string[];
	chapter: string;
	commonName: string;
	displayName: string;
	gender: Gender;
	id: string;
	licensed: boolean;
	origin: string;
	portraitPath: string;
	realName: string | null;
	releaseDate: string;
	wikiUrl: string;
}

export interface SurvivorFilters {
	genders: Gender[];
	licensed: LicensedOption;
	origins: string[];
	search: string;
}

export interface SurvivorSortState {
	column: SurvivorSortColumn;
	direction: SortDirection;
}
