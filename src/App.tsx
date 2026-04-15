import { useEffect, useRef } from "react";
import { DisclaimerPage } from "./components/DisclaimerPage.tsx";
import { FilterBar } from "./components/FilterBar.tsx";
import { KillerTable } from "./components/KillerTable.tsx";
import killersData from "./data/killers.json";
import { useFilters } from "./hooks/useFilters.ts";
import type { Killer } from "./types/killer.ts";

const killers = killersData as Killer[];

export function App() {
	if (window.location.pathname === "/disclaimer") {
		return <DisclaimerPage />;
	}

	return <HomePage />;
}

function HomePage() {
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
		<div className="min-h-screen flex flex-col">
			<header className="border-b border-border px-6 py-8 text-center">
				<h1 className="text-4xl font-bold tracking-tight">
					Fog<span className="text-accent">dex</span>
				</h1>
				<p className="mt-2 text-text-muted">Dead by Daylight Killer Reference</p>
				{killers.length > 0 && <p className="mt-1 text-sm text-text-muted">{killers.length} Killers</p>}
			</header>

			{killers.length > 0 ? (
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
			) : (
				<main className="flex-1 flex items-center justify-center px-4">
					<div className="text-center text-text-muted">
						<p className="text-lg">No killer data loaded yet</p>
						<p className="mt-2 text-sm">Run the update-data agent to populate the database.</p>
					</div>
				</main>
			)}

			<footer className="border-t border-border px-6 py-8 text-center text-sm text-text-muted">
				<p>
					Dead by Daylight is a trademark of Behaviour Interactive Inc. Killer data sourced from the{" "}
					<a
						className="text-accent hover:text-accent-light underline"
						href="https://deadbydaylight.wiki.gg"
						rel="noopener noreferrer"
						target="_blank"
					>
						Dead by Daylight Wiki
					</a>
					. This site is not affiliated with Behaviour Interactive.
				</p>
				<p className="mt-2">
					<a
						className="text-accent hover:text-accent-light underline"
						href="https://github.com/almeidx/fogdex"
						rel="noopener noreferrer"
						target="_blank"
					>
						Source Code
					</a>
					{" \u00b7 "}
					AGPL-3.0
					{" \u00b7 "}
					<a className="text-accent hover:text-accent-light underline" href="/disclaimer">
						Disclaimer
					</a>
				</p>
			</footer>
		</div>
	);
}
