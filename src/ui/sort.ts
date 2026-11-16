export const SORT_DIRECTIONS = ["asc", "desc"] as const;
type SortDirection = (typeof SORT_DIRECTIONS)[number];

interface SortOption<T> {
	compare: (a: T, b: T) => number;
	label: string;
}

/** Sortable columns in display order; the first one is the default. */
export type Sorts<T, C extends string> = Record<C, SortOption<T>>;

export interface SortState<C extends string> {
	column: C;
	direction: SortDirection;
}

export function flipDirection(direction: SortDirection): SortDirection {
	return direction === "asc" ? "desc" : "asc";
}

export function sortItems<T, C extends string>(items: T[], sorts: Sorts<T, C>, sort: SortState<C>): T[] {
	const { compare } = sorts[sort.column];
	const sign = sort.direction === "desc" ? -1 : 1;
	return items.toSorted((a, b) => sign * compare(a, b));
}
