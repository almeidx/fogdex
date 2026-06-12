import { NuqsAdapter } from "nuqs/adapters/react";
import { PerkFilterBar } from "../components/PerkFilterBar.tsx";
import { PerkGrid } from "../components/PerkGrid.tsx";
import { usePerkFilters } from "../hooks/usePerkFilters.ts";
import type { Perk, StatusEffects } from "../types/perk.ts";

function PerksView({ perks, statusEffects }: { perks: Perk[]; statusEffects: StatusEffects }) {
	const { filters, sort, setFilter, setSort, filteredPerks, clearFilters } = usePerkFilters(perks);

	return (
		<>
			<PerkFilterBar
				filteredCount={filteredPerks.length}
				filters={filters}
				onClear={clearFilters}
				onFilterChange={setFilter}
				onSortChange={setSort}
				perks={perks}
				sort={sort}
				totalCount={perks.length}
			/>
			<main className="mx-auto w-full max-w-350 flex-1 px-4 py-6">
				<PerkGrid onClearFilters={clearFilters} perks={filteredPerks} statusEffects={statusEffects} />
			</main>
		</>
	);
}

export function PerksIsland({ perks, statusEffects }: { perks: Perk[]; statusEffects: StatusEffects }) {
	return (
		<NuqsAdapter>
			<PerksView perks={perks} statusEffects={statusEffects} />
		</NuqsAdapter>
	);
}
