export const GENDERS = ["Man", "Woman", "Unknown"] as const;
export type Gender = (typeof GENDERS)[number];

export const ATTACK_CATEGORIES = ["Melee", "Ranged", "Hybrid"] as const;
export type AttackCategory = (typeof ATTACK_CATEGORIES)[number];

export const HEIGHTS = ["Short", "Average", "Tall"] as const;
export type Height = (typeof HEIGHTS)[number];

export const SORT_COLUMNS = ["name", "speed", "terrorRadius", "height", "origin", "releaseDate", "licensed"] as const;
export type SortColumn = (typeof SORT_COLUMNS)[number];

export const SORT_DIRECTIONS = ["asc", "desc"] as const;
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

export const LICENSED_OPTIONS = ["all", "yes", "no"] as const;
export type LicensedOption = (typeof LICENSED_OPTIONS)[number];

export interface Killer {
	aliases: string[];
	attackCategory: AttackCategory;
	attackDetail: string;
	chapter: string;
	commonName: string;
	displayName: string;
	gender: Gender;
	height: Height;
	id: string;
	licensed: boolean;
	origin: string;
	portraitPath: string;
	powerName: string;
	realName: string | null;
	releaseDate: string;
	speed: {
		base: number;
		percentage: number;
		unit: string;
	};
	speedNotes: string | null;
	terrorRadius: number;
	terrorRadiusNotes: string | null;
	weapon: string;
	wikiUrl: string;
}

export interface Filters {
	attackCategories: AttackCategory[];
	genders: Gender[];
	heights: Height[];
	licensed: LicensedOption;
	origins: string[];
	search: string;
	speedMax: number | null;
	speedMin: number | null;
	trMax: number | null;
	trMin: number | null;
}

export interface SortState {
	column: SortColumn;
	direction: SortDirection;
}
