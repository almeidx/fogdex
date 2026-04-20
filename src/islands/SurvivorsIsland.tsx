import { NuqsAdapter } from "nuqs/adapters/react";
import { useEffect, useRef } from "react";
import { SurvivorFilterBar } from "../components/SurvivorFilterBar.tsx";
import { SurvivorTable } from "../components/SurvivorTable.tsx";
import { useSurvivorFilters } from "../hooks/useSurvivorFilters.ts";
import type { Survivor } from "../types/survivor.ts";

function SurvivorsView({ survivors }: { survivors: Survivor[] }) {
	const { filters, sort, setFilter, setSort, filteredSurvivors, clearFilters } = useSurvivorFilters(survivors);
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
			<SurvivorFilterBar
				filteredCount={filteredSurvivors.length}
				filters={filters}
				onClear={clearFilters}
				onFilterChange={setFilter}
				ref={filterBarRef}
				survivors={survivors}
				totalCount={survivors.length}
			/>
			<main className="mx-auto w-full max-w-350 flex-1 px-4 py-6">
				<SurvivorTable onSortChange={setSort} sort={sort} survivors={filteredSurvivors} />
			</main>
		</>
	);
}

export function SurvivorsIsland({ survivors }: { survivors: Survivor[] }) {
	return (
		<NuqsAdapter>
			<SurvivorsView survivors={survivors} />
		</NuqsAdapter>
	);
}
