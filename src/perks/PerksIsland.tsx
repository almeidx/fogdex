import { NuqsAdapter } from "nuqs/adapters/react";
import { useFilteredList } from "../ui/filteredList.ts";
import { Results } from "../ui/Results.tsx";
import { perkList } from "./filters.ts";
import type { OwnerPortraits } from "./PerkCard.tsx";
import { PerkFilterBar } from "./PerkFilterBar.tsx";
import { PerkGrid } from "./PerkGrid.tsx";
import type { Perk, StatusEffects } from "./schema.ts";

interface PerksProps {
	ownerPortraits: OwnerPortraits;
	perks: Perk[];
	statusEffects: StatusEffects;
}

function PerksView({ ownerPortraits, perks, statusEffects }: PerksProps) {
	const list = useFilteredList(perks, perkList);

	return (
		<>
			<PerkFilterBar list={list} />
			<Results>
				<PerkGrid list={list} ownerPortraits={ownerPortraits} statusEffects={statusEffects} />
			</Results>
		</>
	);
}

export function PerksIsland(props: PerksProps) {
	return (
		<NuqsAdapter>
			<PerksView {...props} />
		</NuqsAdapter>
	);
}
