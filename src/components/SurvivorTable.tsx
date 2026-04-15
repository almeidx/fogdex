import type { Survivor, SurvivorSortColumn, SurvivorSortState } from "../types/survivor.ts";
import { SURVIVOR_SORT_COLUMNS } from "../types/survivor.ts";
import { SurvivorCard, SurvivorRow } from "./SurvivorRow.tsx";

const SORT_LABELS: Record<SurvivorSortColumn, string> = {
	licensed: "Licensed",
	name: "Name",
	origin: "Origin",
	releaseDate: "Released",
};

interface SurvivorTableProps {
	onSortChange: (sort: SurvivorSortState) => void;
	sort: SurvivorSortState;
	survivors: Survivor[];
}

function SortHeader({
	column,
	sort,
	onSort,
	children,
}: {
	column: SurvivorSortColumn;
	sort: SurvivorSortState;
	onSort: (column: SurvivorSortColumn) => void;
	children: React.ReactNode;
}) {
	const active = sort.column === column;
	return (
		<th className="sticky bg-surface/95 backdrop-blur-sm py-3 px-2" style={{ top: "var(--filter-bar-h, 0px)" }}>
			<button
				className={`flex items-center gap-1 text-left text-sm font-medium transition-colors ${
					active ? "text-accent" : "text-text-muted hover:text-text"
				}`}
				onClick={() => onSort(column)}
				type="button"
			>
				{children}
				{active && <span className="text-xs">{sort.direction === "asc" ? "\u25b2" : "\u25bc"}</span>}
			</button>
		</th>
	);
}

export function SurvivorTable({ survivors, sort, onSortChange }: SurvivorTableProps) {
	const toggleSort = (column: SurvivorSortColumn) => {
		if (sort.column === column) {
			onSortChange({ column, direction: sort.direction === "asc" ? "desc" : "asc" });
		} else {
			onSortChange({ column, direction: "asc" });
		}
	};

	if (survivors.length === 0) {
		return (
			<div className="py-16 text-center text-text-muted">
				<p className="text-lg">No survivors match your filters</p>
				<p className="mt-2 text-sm">Try adjusting or clearing your filters.</p>
			</div>
		);
	}

	return (
		<>
			<div className="hidden md:block">
				<table className="w-full">
					<thead>
						<tr className="border-b border-border text-left">
							<th
								className="sticky bg-surface/95 backdrop-blur-sm w-14 py-3 px-2"
								style={{ top: "var(--filter-bar-h, 0px)" }}
							/>
							<SortHeader column="name" onSort={toggleSort} sort={sort}>
								Name
							</SortHeader>
							<th
								className="sticky bg-surface/95 backdrop-blur-sm py-3 px-2 text-sm font-medium text-text-muted"
								style={{ top: "var(--filter-bar-h, 0px)" }}
							>
								Gender
							</th>
							<SortHeader column="origin" onSort={toggleSort} sort={sort}>
								Origin
							</SortHeader>
							<th
								className="sticky bg-surface/95 backdrop-blur-sm py-3 px-2 text-sm font-medium text-text-muted"
								style={{ top: "var(--filter-bar-h, 0px)" }}
							>
								Chapter
							</th>
							<SortHeader column="releaseDate" onSort={toggleSort} sort={sort}>
								Released
							</SortHeader>
							<SortHeader column="licensed" onSort={toggleSort} sort={sort}>
								Licensed
							</SortHeader>
							<th
								className="sticky bg-surface/95 backdrop-blur-sm w-10 py-3 px-2"
								style={{ top: "var(--filter-bar-h, 0px)" }}
							/>
						</tr>
					</thead>
					<tbody>
						{survivors.map((survivor, i) => (
							<SurvivorRow key={survivor.id} priority={i < 10} survivor={survivor} />
						))}
					</tbody>
				</table>
			</div>

			<div className="flex items-center gap-2 mb-3 md:hidden">
				<span className="text-xs text-text-muted">Sort by</span>
				<select
					className="rounded border border-border bg-surface px-2 py-1.5 text-sm text-text"
					onChange={(e) => onSortChange({ column: e.target.value as SurvivorSortColumn, direction: sort.direction })}
					value={sort.column}
				>
					{SURVIVOR_SORT_COLUMNS.map((col) => (
						<option key={col} value={col}>
							{SORT_LABELS[col]}
						</option>
					))}
				</select>
				<button
					className="rounded border border-border bg-surface px-2 py-1.5 text-sm text-text-muted hover:text-text transition-colors"
					onClick={() => onSortChange({ column: sort.column, direction: sort.direction === "asc" ? "desc" : "asc" })}
					type="button"
				>
					{sort.direction === "asc" ? "\u2191 Asc" : "\u2193 Desc"}
				</button>
			</div>

			<div className="space-y-3 md:hidden">
				{survivors.map((survivor, i) => (
					<SurvivorCard key={survivor.id} priority={i < 4} survivor={survivor} />
				))}
			</div>
		</>
	);
}
