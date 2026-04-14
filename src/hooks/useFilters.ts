import { parseAsArrayOf, parseAsFloat, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useCallback, useMemo } from "react";
import type { Filters, Height, Killer, SortState } from "../types/killer.ts";
import {
	ATTACK_CATEGORIES,
	GENDERS,
	HEIGHTS,
	LICENSED_OPTIONS,
	SORT_COLUMNS,
	SORT_DIRECTIONS,
} from "../types/killer.ts";

const filterParsers = {
	attack: parseAsArrayOf(parseAsStringLiteral(ATTACK_CATEGORIES)).withDefault([]),
	gender: parseAsArrayOf(parseAsStringLiteral(GENDERS)).withDefault([]),
	height: parseAsArrayOf(parseAsStringLiteral(HEIGHTS)).withDefault([]),
	licensed: parseAsStringLiteral(LICENSED_OPTIONS).withDefault("all"),
	origin: parseAsArrayOf(parseAsString).withDefault([]),
	q: parseAsString.withDefault(""),
	speed_max: parseAsFloat.withDefault(null as unknown as number),
	speed_min: parseAsFloat.withDefault(null as unknown as number),
	tr_max: parseAsFloat.withDefault(null as unknown as number),
	tr_min: parseAsFloat.withDefault(null as unknown as number),
};

const sortParsers = {
	order: parseAsStringLiteral(SORT_DIRECTIONS).withDefault("asc"),
	sort: parseAsStringLiteral(SORT_COLUMNS).withDefault("name"),
};

function filterKillers(killers: Killer[], filters: Filters): Killer[] {
	return killers.filter((k) => {
		if (filters.search) {
			const q = filters.search.toLowerCase();
			const matches =
				k.displayName.toLowerCase().includes(q) ||
				k.commonName.toLowerCase().includes(q) ||
				(k.realName?.toLowerCase().includes(q) ?? false) ||
				k.aliases.some((a) => a.toLowerCase().includes(q));
			if (!matches) return false;
		}

		if (filters.speedMin !== null && k.speed.base < filters.speedMin) return false;
		if (filters.speedMax !== null && k.speed.base > filters.speedMax) return false;
		if (filters.trMin !== null && k.terrorRadius < filters.trMin) return false;
		if (filters.trMax !== null && k.terrorRadius > filters.trMax) return false;
		if (filters.heights.length > 0 && !filters.heights.includes(k.height)) return false;
		if (filters.genders.length > 0 && !filters.genders.includes(k.gender)) return false;
		if (filters.attackCategories.length > 0 && !filters.attackCategories.includes(k.attackCategory)) return false;
		if (filters.origins.length > 0 && !filters.origins.includes(k.origin)) return false;
		if (filters.licensed === "yes" && !k.licensed) return false;
		if (filters.licensed === "no" && k.licensed) return false;

		return true;
	});
}

const HEIGHT_ORDER: Record<Height, number> = { Average: 1, Short: 0, Tall: 2 };

function sortKillers(killers: Killer[], sort: SortState): Killer[] {
	return [...killers].sort((a, b) => {
		let cmp = 0;
		switch (sort.column) {
			case "name":
				cmp = a.displayName.localeCompare(b.displayName);
				break;
			case "speed":
				cmp = a.speed.base - b.speed.base;
				break;
			case "terrorRadius":
				cmp = a.terrorRadius - b.terrorRadius;
				break;
			case "height":
				cmp = HEIGHT_ORDER[a.height] - HEIGHT_ORDER[b.height];
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

export function useFilters(killers: Killer[]) {
	const [filterParams, setFilterParams] = useQueryStates(filterParsers, { history: "replace" });
	const [sortParams, setSortParams] = useQueryStates(sortParsers, { history: "replace" });

	const filters: Filters = useMemo(
		() => ({
			attackCategories: filterParams.attack,
			genders: filterParams.gender,
			heights: filterParams.height,
			licensed: filterParams.licensed,
			origins: filterParams.origin,
			search: filterParams.q,
			speedMax: filterParams.speed_max ?? null,
			speedMin: filterParams.speed_min ?? null,
			trMax: filterParams.tr_max ?? null,
			trMin: filterParams.tr_min ?? null,
		}),
		[filterParams],
	);

	const sort: SortState = useMemo(
		() => ({
			column: sortParams.sort,
			direction: sortParams.order,
		}),
		[sortParams],
	);

	const setFilter = useCallback(
		<K extends keyof Filters>(key: K, value: Filters[K]) => {
			const paramMap: Record<string, string> = {
				attackCategories: "attack",
				genders: "gender",
				heights: "height",
				licensed: "licensed",
				origins: "origin",
				search: "q",
				speedMax: "speed_max",
				speedMin: "speed_min",
				trMax: "tr_max",
				trMin: "tr_min",
			};
			setFilterParams({ [paramMap[key]]: value });
		},
		[setFilterParams],
	);

	const setSort = useCallback(
		(newSort: SortState) => {
			setSortParams({ order: newSort.direction, sort: newSort.column });
		},
		[setSortParams],
	);

	const clearFilters = useCallback(() => {
		setFilterParams({
			attack: [],
			gender: [],
			height: [],
			licensed: "all",
			origin: [],
			q: "",
			speed_max: null as unknown as number,
			speed_min: null as unknown as number,
			tr_max: null as unknown as number,
			tr_min: null as unknown as number,
		});
		setSortParams({ order: "asc", sort: "name" });
	}, [setFilterParams, setSortParams]);

	const filteredKillers = useMemo(() => {
		return sortKillers(filterKillers(killers, filters), sort);
	}, [killers, filters, sort]);

	return { clearFilters, filteredKillers, filters, setFilter, setSort, sort };
}
