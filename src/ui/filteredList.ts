import {
	createSerializer,
	parseAsStringLiteral,
	useQueryStates,
	type Nullable,
	type ParserMap,
	type UrlKeys,
	type UseQueryStatesKeysMap,
	type Values,
} from "nuqs";
import { SORT_DIRECTIONS, sortItems, type SortState, type Sorts } from "./sort.ts";
import { useHydrated } from "./useHydrated.ts";

const SORT_URL_KEYS = { column: "sort", direction: "order" } as const;
const DEFAULT_DIRECTION = "asc";

/** Parsers accepted by both `useQueryStates` and `createSerializer`. */
type Parsers = ParserMap & UseQueryStatesKeysMap;

interface ListSpec<T, P extends Parsers, C extends string> {
	filters: P;
	matches: (item: T, filters: Values<P>) => boolean;
	sorts: Sorts<T, C>;
	urlKeys: UrlKeys<P>;
}

/** URL-backed filter and sort state for one page's list of items. */
interface List<T, P extends Parsers, C extends string> extends ListSpec<T, P, C> {
	defaultFilters: Values<P>;
	defaultSort: SortState<C>;
	/** Builds a link to the page at `path` with `filters` applied. */
	href: (path: string, filters: Partial<Values<P>>) => string;
	sortParsers: UseQueryStatesKeysMap<SortState<C>>;
}

export function defineList<T, P extends Parsers, C extends string>(spec: ListSpec<T, P, C>): List<T, P, C> {
	const columns = Object.keys(spec.sorts) as [C, ...C[]];
	const serialize = createSerializer(spec.filters, { urlKeys: spec.urlKeys });

	return {
		...spec,
		defaultFilters: Object.fromEntries(
			Object.entries(spec.filters).map(([key, parser]) => [key, parser.defaultValue ?? null]),
		) as Values<P>,
		defaultSort: { column: columns[0], direction: DEFAULT_DIRECTION },
		href: (path, filters) => serialize(path, filters),
		sortParsers: {
			column: parseAsStringLiteral(columns).withDefault(columns[0]),
			direction: parseAsStringLiteral(SORT_DIRECTIONS).withDefault(DEFAULT_DIRECTION),
		},
	};
}

interface FilteredList<T, P extends Parsers, C extends string> {
	clear: () => void;
	filters: Values<P>;
	items: T[];
	results: T[];
	/** A null value resets that filter to its default. */
	setFilters: (patch: Partial<Nullable<Values<P>>>) => void;
	setSort: (sort: SortState<C>) => void;
	sort: SortState<C>;
	sorts: Sorts<T, C>;
}

export type FilteredListOf<L> = L extends List<infer T, infer P, infer C> ? FilteredList<T, P, C> : never;

export function useFilteredList<T, P extends Parsers, C extends string>(
	items: T[],
	list: List<T, P, C>,
): FilteredList<T, P, C> {
	const [urlFilters, setUrlFilters] = useQueryStates(list.filters, { history: "replace", urlKeys: list.urlKeys });
	const [urlSort, setUrlSort] = useQueryStates(list.sortParsers, { history: "replace", urlKeys: SORT_URL_KEYS });
	const hydrated = useHydrated();
	const filters = hydrated ? urlFilters : list.defaultFilters;
	const sort = hydrated ? (urlSort as SortState<C>) : list.defaultSort;

	return {
		clear: () => {
			void setUrlFilters(null);
			void setUrlSort(null);
		},
		filters,
		items,
		results: sortItems(
			items.filter((item) => list.matches(item, filters)),
			list.sorts,
			sort,
		),
		setFilters: (patch) => void setUrlFilters(patch),
		setSort: (next) => void setUrlSort(next),
		sort,
		sorts: list.sorts,
	};
}
