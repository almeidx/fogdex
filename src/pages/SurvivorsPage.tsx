import { useEffect, useRef, useState } from "react";
import { SurvivorFilterBar } from "../components/SurvivorFilterBar.tsx";
import { SurvivorTable } from "../components/SurvivorTable.tsx";
import { useSurvivorFilters } from "../hooks/useSurvivorFilters.ts";
import type { Survivor } from "../types/survivor.ts";

export function SurvivorsPage() {
	const [survivors, setSurvivors] = useState<Survivor[]>([]);
	const [loading, setLoading] = useState(true);
	const filterBarRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		import("../data/survivors.json").then((m) => {
			setSurvivors(m.default as Survivor[]);
			setLoading(false);
		});
	}, []);

	useEffect(() => {
		const el = filterBarRef.current;
		if (!el) return;
		const observer = new ResizeObserver(() => {
			document.documentElement.style.setProperty("--filter-bar-h", `${el.offsetHeight}px`);
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const { filters, sort, setFilter, setSort, filteredSurvivors, clearFilters } = useSurvivorFilters(survivors);

	if (loading) {
		return (
			<main className="flex-1 flex items-center justify-center px-4">
				<p className="text-text-muted">Loading survivors...</p>
			</main>
		);
	}

	if (survivors.length === 0) {
		return (
			<main className="flex-1 flex items-center justify-center px-4">
				<div className="text-center text-text-muted">
					<p className="text-lg">No survivor data loaded yet</p>
					<p className="mt-2 text-sm">Run the update-data agent to populate the database.</p>
				</div>
			</main>
		);
	}

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
