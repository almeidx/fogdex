import { EmptyResults } from "../ui/Results.tsx";
import { SortStatus } from "../ui/Sorting.tsx";
import type { PerkFilteredList } from "./filters.ts";
import { PerkCard, type OwnerPortraits } from "./PerkCard.tsx";
import type { StatusEffects } from "./schema.ts";

export function PerkGrid({
	list,
	ownerPortraits,
	statusEffects,
}: {
	list: PerkFilteredList;
	ownerPortraits: OwnerPortraits;
	statusEffects: StatusEffects;
}) {
	if (list.results.length === 0) return <EmptyResults noun="perks" onClear={list.clear} />;

	return (
		<>
			<SortStatus list={list} />
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{list.results.map((perk, i) => (
					<PerkCard
						key={perk.slug}
						ownerPortraits={ownerPortraits}
						perk={perk}
						priority={i < 8}
						statusEffects={statusEffects}
					/>
				))}
			</div>
		</>
	);
}
