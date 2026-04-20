import { NuqsAdapter } from "nuqs/adapters/react";
import { PerkFilterBar } from "../components/PerkFilterBar.tsx";
import { PerkGrid } from "../components/PerkGrid.tsx";
import { usePerkFilters } from "../hooks/usePerkFilters.ts";
import type { Perk } from "../types/perk.ts";

function PerksView({ perks }: { perks: Perk[] }) {
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
				<PerkGrid perks={filteredPerks} />
			</main>
		</>
	);
}

export function PerksIsland({ perks }: { perks: Perk[] }) {
	return (
		<NuqsAdapter>
			<PerksView perks={perks} />
		</NuqsAdapter>
	);
}
