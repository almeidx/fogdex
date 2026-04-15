import { useEffect, useRef } from "react";
import { DisclaimerPage } from "./components/DisclaimerPage.tsx";
import { FilterBar } from "./components/FilterBar.tsx";
import { Footer } from "./components/Footer.tsx";
import { KillerTable } from "./components/KillerTable.tsx";
import { NavBar } from "./components/NavBar.tsx";
import killersData from "./data/killers.json";
import { useFilters } from "./hooks/useFilters.ts";
import { KillerPerksPage } from "./pages/KillerPerksPage.tsx";
import { SurvivorPerksPage } from "./pages/SurvivorPerksPage.tsx";
import { SurvivorsPage } from "./pages/SurvivorsPage.tsx";
import type { Killer } from "./types/killer.ts";

const killers = killersData as Killer[];

export function App() {
	const path = window.location.pathname;

	if (path === "/disclaimer") {
		return <DisclaimerPage />;
	}

	return (
		<div className="min-h-screen flex flex-col">
			<NavBar />
			{path === "/survivors" && <SurvivorsPage />}
			{path === "/perks/killer" && <KillerPerksPage />}
			{path === "/perks/survivor" && <SurvivorPerksPage />}
			{(path === "/" || !["/survivors", "/perks/killer", "/perks/survivor"].includes(path)) && <KillersPage />}
			<Footer />
		</div>
	);
}

function KillersPage() {
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

	if (killers.length === 0) {
		return (
			<main className="flex-1 flex items-center justify-center px-4">
				<div className="text-center text-text-muted">
					<p className="text-lg">No killer data loaded yet</p>
					<p className="mt-2 text-sm">Run the update-data agent to populate the database.</p>
				</div>
			</main>
		);
	}

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
