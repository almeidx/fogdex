import { characterFilters, characterSorts, characterUrlKeys, matchesCharacter } from "../characters/filters.ts";
import { defineList, type FilteredListOf } from "../ui/filteredList.ts";
import type { Survivor } from "./schema.ts";

export const survivorList = defineList({
	filters: characterFilters,
	matches: (survivor: Survivor, filters) => matchesCharacter(survivor, filters),
	sorts: characterSorts,
	urlKeys: characterUrlKeys,
});

export type SurvivorFilteredList = FilteredListOf<typeof survivorList>;
