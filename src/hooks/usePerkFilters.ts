import { parseAsArrayOf, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useCallback, useMemo } from "react";
import { SORT_DIRECTIONS } from "../types/killer.ts";
import type { Perk, PerkFilters, PerkSortState } from "../types/perk.ts";
import { PERK_SORT_COLUMNS } from "../types/perk.ts";

const filterParsers = {
	chapter: parseAsArrayOf(parseAsString).withDefault([]),
	owner: parseAsArrayOf(parseAsString).withDefault([]),
	q: parseAsString.withDefault(""),
	tag: parseAsArrayOf(parseAsString).withDefault([]),
};

const sortParsers = {
	order: parseAsStringLiteral(SORT_DIRECTIONS).withDefault("asc"),
	sort: parseAsStringLiteral(PERK_SORT_COLUMNS).withDefault("name"),
};

function filterPerks(perks: Perk[], filters: PerkFilters): Perk[] {
	return perks.filter((p) => {
		if (filters.search) {
			const q = filters.search.toLowerCase();
			const nameMatch =
				p.name.toLowerCase().includes(q) ||
				p.aliases.some((a) => a.toLowerCase().includes(q)) ||
				p.description.toLowerCase().includes(q);
			if (!nameMatch) return false;
		}

		if (filters.tags.length > 0 && !filters.tags.some((t) => p.tags.includes(t))) return false;

		if (filters.owners.length > 0) {
			const ownerId = p.owner ?? "__universal__";
			if (!filters.owners.includes(ownerId)) return false;
		}

		if (filters.chapters.length > 0) {
			if (!p.chapter || !filters.chapters.includes(p.chapter)) return false;
		}

		return true;
	});
}

function sortPerks(perks: Perk[], sort: PerkSortState): Perk[] {
	return [...perks].sort((a, b) => {
		let cmp = 0;
		switch (sort.column) {
			case "name":
				cmp = a.name.localeCompare(b.name);
				break;
			case "owner":
				cmp = (a.ownerName ?? "\uffff").localeCompare(b.ownerName ?? "\uffff");
				break;
		}
		return sort.direction === "desc" ? -cmp : cmp;
	});
}

export function usePerkFilters(perks: Perk[]) {
	const [filterParams, setFilterParams] = useQueryStates(filterParsers, { history: "replace" });
	const [sortParams, setSortParams] = useQueryStates(sortParsers, { history: "replace" });

	const filters: PerkFilters = useMemo(
		() => ({
			chapters: filterParams.chapter,
			owners: filterParams.owner,
			search: filterParams.q,
			tags: filterParams.tag,
		}),
		[filterParams],
	);

	const sort: PerkSortState = useMemo(
		() => ({
			column: sortParams.sort,
			direction: sortParams.order,
		}),
		[sortParams],
	);

	const setFilter = useCallback(
		<K extends keyof PerkFilters>(key: K, value: PerkFilters[K]) => {
			const paramMap: Record<string, string> = {
				chapters: "chapter",
				owners: "owner",
				search: "q",
				tags: "tag",
			};
			setFilterParams({ [paramMap[key]]: value });
		},
		[setFilterParams],
	);

	const setSort = useCallback(
		(newSort: PerkSortState) => {
			setSortParams({ order: newSort.direction, sort: newSort.column });
		},
		[setSortParams],
	);

	const clearFilters = useCallback(() => {
		setFilterParams({
			chapter: [],
			owner: [],
			q: "",
			tag: [],
		});
		setSortParams({ order: "asc", sort: "name" });
	}, [setFilterParams, setSortParams]);

	const filteredPerks = useMemo(() => {
		return sortPerks(filterPerks(perks, filters), sort);
	}, [perks, filters, sort]);

	return { clearFilters, filteredPerks, filters, setFilter, setSort, sort };
}
