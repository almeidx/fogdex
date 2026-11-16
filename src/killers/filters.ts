import { parseAsArrayOf, parseAsBoolean, parseAsFloat, parseAsStringLiteral } from "nuqs";
import { characterFilters, characterSorts, characterUrlKeys, matchesCharacter } from "../characters/filters.ts";
import { defineList, type FilteredListOf } from "../ui/filteredList.ts";
import { inRange, matchesSelection } from "../ui/match.ts";
import { ATTACK_CATEGORIES, HEIGHTS } from "./killer.ts";
import type { Killer } from "./schema.ts";

export const killerList = defineList({
	filters: {
		...characterFilters,
		attackCategories: parseAsArrayOf(parseAsStringLiteral(ATTACK_CATEGORIES)).withDefault([]),
		hasLullaby: parseAsBoolean.withDefault(false),
		heights: parseAsArrayOf(parseAsStringLiteral(HEIGHTS)).withDefault([]),
		speedMax: parseAsFloat,
		speedMin: parseAsFloat,
		trMax: parseAsFloat,
		trMin: parseAsFloat,
	},
	matches: (killer: Killer, filters) =>
		matchesCharacter(killer, filters, [killer.powerName, killer.weapon]) &&
		inRange(killer.speed, filters.speedMin, filters.speedMax) &&
		inRange(killer.terrorRadius, filters.trMin, filters.trMax) &&
		matchesSelection(filters.heights, killer.height) &&
		matchesSelection(filters.attackCategories, killer.attackCategory) &&
		(!filters.hasLullaby || killer.lullabyRadius !== null),
	sorts: {
		name: characterSorts.name,
		speed: { compare: (a, b) => a.speed - b.speed, label: "Speed" },
		terrorRadius: { compare: (a, b) => a.terrorRadius - b.terrorRadius, label: "Terror Radius" },
		height: { compare: (a, b) => HEIGHTS.indexOf(a.height) - HEIGHTS.indexOf(b.height), label: "Height" },
		origin: characterSorts.origin,
		releaseDate: characterSorts.releaseDate,
		licensed: characterSorts.licensed,
	},
	urlKeys: {
		...characterUrlKeys,
		attackCategories: "attack",
		hasLullaby: "lullaby",
		heights: "height",
		speedMax: "speed_max",
		speedMin: "speed_min",
		trMax: "tr_max",
		trMin: "tr_min",
	},
});

export type KillerFilteredList = FilteredListOf<typeof killerList>;
