import { parseAsArrayOf, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GENDERS, LICENSED_OPTIONS, SORT_DIRECTIONS } from "../types/killer.ts";
import type { Survivor, SurvivorFilters, SurvivorSortState } from "../types/survivor.ts";
import { SURVIVOR_SORT_COLUMNS } from "../types/survivor.ts";

const filterParsers = {
	gender: parseAsArrayOf(parseAsStringLiteral(GENDERS)).withDefault([]),
	licensed: parseAsStringLiteral(LICENSED_OPTIONS).withDefault("all"),
	origin: parseAsArrayOf(parseAsString).withDefault([]),
	q: parseAsString.withDefault(""),
};

const sortParsers = {
	order: parseAsStringLiteral(SORT_DIRECTIONS).withDefault("asc"),
	sort: parseAsStringLiteral(SURVIVOR_SORT_COLUMNS).withDefault("name"),
};

function filterSurvivors(survivors: Survivor[], filters: SurvivorFilters): Survivor[] {
	return survivors.filter((s) => {
		if (filters.search) {
			const q = filters.search.toLowerCase();
			const matches =
				s.slug.toLowerCase().includes(q) ||
				s.displayName.toLowerCase().includes(q) ||
				s.id.toLowerCase().includes(q) ||
				(s.realName?.toLowerCase().includes(q) ?? false) ||
				s.aliases.some((a) => a.toLowerCase().includes(q)) ||
				s.gameTags.some((tag) => tag.toLowerCase().includes(q));
			if (!matches) return false;
		}

		if (filters.genders.length > 0 && !filters.genders.includes(s.gender)) return false;
		if (filters.origins.length > 0 && !filters.origins.includes(s.origin)) return false;
		if (filters.licensed === "yes" && !s.licensed) return false;
		if (filters.licensed === "no" && s.licensed) return false;

		return true;
	});
}

function sortSurvivors(survivors: Survivor[], sort: SurvivorSortState): Survivor[] {
	return [...survivors].sort((a, b) => {
		let cmp = 0;
		switch (sort.column) {
			case "name":
				cmp = a.displayName.localeCompare(b.displayName);
				break;
			case "origin":
				cmp = a.origin.localeCompare(b.origin);
				break;
			case "releaseDate":
				cmp = a.releaseDate.localeCompare(b.releaseDate);
				break;
			case "licensed":
				cmp = Number(a.licensed) - Number(b.licensed);
				break;
		}
		return sort.direction === "desc" ? -cmp : cmp;
	});
}

const DEFAULT_FILTERS: SurvivorFilters = {
	genders: [],
	licensed: "all",
	origins: [],
	search: "",
};

const DEFAULT_SORT: SurvivorSortState = { column: "name", direction: "asc" };

export function useSurvivorFilters(survivors: Survivor[]) {
	const [filterParams, setFilterParams] = useQueryStates(filterParsers, { history: "replace" });
	const [sortParams, setSortParams] = useQueryStates(sortParsers, { history: "replace" });

	const realFilters: SurvivorFilters = useMemo(
		() => ({
			genders: filterParams.gender,
			licensed: filterParams.licensed,
			origins: filterParams.origin,
			search: filterParams.q,
		}),
		[filterParams],
	);

	const realSort: SurvivorSortState = useMemo(
		() => ({
			column: sortParams.sort,
			direction: sortParams.order,
		}),
		[sortParams],
	);

	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	const filters = mounted ? realFilters : DEFAULT_FILTERS;
	const sort = mounted ? realSort : DEFAULT_SORT;

	const setFilter = useCallback(
		<K extends keyof SurvivorFilters>(key: K, value: SurvivorFilters[K]) => {
			const paramMap: Record<string, string> = {
				genders: "gender",
				licensed: "licensed",
				origins: "origin",
				search: "q",
			};
			setFilterParams({ [paramMap[key]]: value });
		},
		[setFilterParams],
	);

	const setSort = useCallback(
		(newSort: SurvivorSortState) => {
			setSortParams({ order: newSort.direction, sort: newSort.column });
		},
		[setSortParams],
	);

	const clearFilters = useCallback(() => {
		setFilterParams({
			gender: [],
			licensed: "all",
			origin: [],
			q: "",
		});
		setSortParams({ order: "asc", sort: "name" });
	}, [setFilterParams, setSortParams]);

	const filteredSurvivors = useMemo(() => {
		return sortSurvivors(filterSurvivors(survivors, filters), sort);
	}, [survivors, filters, sort]);

	return { clearFilters, filteredSurvivors, filters, setFilter, setSort, sort };
}
