import { NuqsAdapter } from "nuqs/adapters/react";
import { useEffect, useRef } from "react";
import { FilterBar } from "../components/FilterBar.tsx";
import { KillerTable } from "../components/KillerTable.tsx";
import { useFilters } from "../hooks/useFilters.ts";
import type { Killer } from "../types/killer.ts";

function KillersView({ killers }: { killers: Killer[] }) {
	const { filters, sort, setFilter, setSort, filteredKillers, clearFilters } = useFilters(killers);
	const filterBarRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = filterBarRef.current;
		if (!el) return;
		const observer = new ResizeObserver(() => {
			document.documentElement.style.setProperty("--filter-bar-h", `${el.offsetHeight}px`);
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<>
			<FilterBar
				filteredCount={filteredKillers.length}
				filters={filters}
				killers={killers}
				onClear={clearFilters}
				onFilterChange={setFilter}
				ref={filterBarRef}
				totalCount={killers.length}
			/>
			<main className="mx-auto w-full max-w-350 flex-1 px-4 py-6">
				<KillerTable killers={filteredKillers} onSortChange={setSort} sort={sort} />
			</main>
		</>
	);
}

export function KillersIsland({ killers }: { killers: Killer[] }) {
	return (
		<NuqsAdapter>
			<KillersView killers={killers} />
		</NuqsAdapter>
	);
}
