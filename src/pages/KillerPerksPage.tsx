import { useEffect, useState } from "react";
import { PerkFilterBar } from "../components/PerkFilterBar.tsx";
import { PerkGrid } from "../components/PerkGrid.tsx";
import { usePerkFilters } from "../hooks/usePerkFilters.ts";
import type { Perk } from "../types/perk.ts";

export function KillerPerksPage() {
	const [perks, setPerks] = useState<Perk[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		import("../data/killer-perks.json").then((m) => {
			setPerks(m.default as unknown as Perk[]);
			setLoading(false);
		});
	}, []);

	const { filters, sort, setFilter, setSort, filteredPerks, clearFilters } = usePerkFilters(perks);

	if (loading) {
		return (
			<main className="flex-1 flex items-center justify-center px-4">
				<p className="text-text-muted">Loading killer perks...</p>
			</main>
		);
	}

	if (perks.length === 0) {
		return (
			<main className="flex-1 flex items-center justify-center px-4">
				<div className="text-center text-text-muted">
					<p className="text-lg">No killer perk data loaded yet</p>
					<p className="mt-2 text-sm">Run the update-data agent to populate the database.</p>
				</div>
			</main>
		);
	}

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
