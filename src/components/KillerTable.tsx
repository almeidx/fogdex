import type { Killer, SortColumn, SortState } from "../types/killer.ts";
import { KillerCard, KillerRow } from "./KillerRow.tsx";

interface KillerTableProps {
	killers: Killer[];
	onSortChange: (sort: SortState) => void;
	sort: SortState;
}

function SortHeader({
	column,
	sort,
	onSort,
	children,
}: {
	column: SortColumn;
	sort: SortState;
	onSort: (column: SortColumn) => void;
	children: React.ReactNode;
}) {
	const active = sort.column === column;
	return (
		<th className="py-3 px-2">
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

export function KillerTable({ killers, sort, onSortChange }: KillerTableProps) {
	const toggleSort = (column: SortColumn) => {
		if (sort.column === column) {
			onSortChange({ column, direction: sort.direction === "asc" ? "desc" : "asc" });
		} else {
			onSortChange({ column, direction: "asc" });
		}
	};

	if (killers.length === 0) {
		return (
			<div className="py-16 text-center text-text-muted">
				<p className="text-lg">No killers match your filters</p>
				<p className="mt-2 text-sm">Try adjusting or clearing your filters.</p>
			</div>
		);
	}

	return (
		<>
			<div className="hidden overflow-x-auto md:block">
				<table className="w-full">
					<thead>
						<tr className="border-b border-border text-left">
							<th className="w-14 py-3 px-2" />
							<SortHeader column="name" onSort={toggleSort} sort={sort}>
								Name
							</SortHeader>
							<SortHeader column="speed" onSort={toggleSort} sort={sort}>
								Speed
							</SortHeader>
							<SortHeader column="terrorRadius" onSort={toggleSort} sort={sort}>
								TR
							</SortHeader>
							<th className="py-3 px-2 text-sm font-medium text-text-muted">Attack</th>
							<SortHeader column="height" onSort={toggleSort} sort={sort}>
								Height
							</SortHeader>
							<SortHeader column="origin" onSort={toggleSort} sort={sort}>
								Origin
							</SortHeader>
							<SortHeader column="releaseDate" onSort={toggleSort} sort={sort}>
								Released
							</SortHeader>
							<SortHeader column="licensed" onSort={toggleSort} sort={sort}>
								Licensed
							</SortHeader>
						</tr>
					</thead>
					<tbody>
						{killers.map((killer) => (
							<KillerRow key={killer.id} killer={killer} />
						))}
					</tbody>
				</table>
			</div>

			<div className="space-y-3 md:hidden">
				{killers.map((killer) => (
					<KillerCard key={killer.id} killer={killer} />
				))}
			</div>
		</>
	);
}
