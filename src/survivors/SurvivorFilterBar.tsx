import { characterChips, GenderFilter, LicensedToggle, OriginFilter } from "../characters/CharacterParts.tsx";
import { FilterBar } from "../ui/FilterBar.tsx";
import type { SurvivorFilteredList } from "./filters.ts";

export function SurvivorFilterBar({ list }: { list: SurvivorFilteredList }) {
	return (
		<FilterBar chips={characterChips(list)} list={list} noun="survivors">
			<GenderFilter list={list} />
			<OriginFilter list={list} />
			<LicensedToggle list={list} noun="survivors" />
		</FilterBar>
	);
}
