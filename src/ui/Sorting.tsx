import type { ComponentProps, ReactNode } from "react";
import { FILTER_BAR_HEIGHT_VAR } from "./layoutVars.ts";
import { flipDirection, type SortState, type Sorts } from "./sort.ts";

interface Sortable<C extends string> {
	setSort: (sort: SortState<C>) => void;
	sort: SortState<C>;
	sorts: Sorts<never, C>;
}

const DIRECTION_NAMES = { asc: "ascending", desc: "descending" } as const;

export function HeaderCell({ className, ...props }: ComponentProps<"th">) {
	return (
		<th
			className={["sticky bg-surface/95 backdrop-blur-sm py-3 px-2", className].filter(Boolean).join(" ")}
			style={{ top: `var(${FILTER_BAR_HEIGHT_VAR}, 0px)` }}
			{...props}
		/>
	);
}

export function PlainHeader({ children }: { children: ReactNode }) {
	return <HeaderCell className="text-sm font-medium text-text-muted">{children}</HeaderCell>;
}

export function SortHeader<C extends string>({
	children,
	column,
	list,
}: {
	/** Header text when it should be shorter than the column's label. */
	children?: string;
	column: C;
	list: Sortable<C>;
}) {
	const { sort, setSort } = list;
	const label = children ?? list.sorts[column].label;
	const active = sort.column === column;
	return (
		<HeaderCell aria-sort={active ? DIRECTION_NAMES[sort.direction] : "none"}>
			<button
				aria-label={`Sort by ${label}`}
				className={`flex items-center gap-1 text-left text-sm font-medium transition-colors ${
					active ? "text-accent-text" : "text-text-muted hover:text-text"
				}`}
				onClick={() => setSort({ column, direction: active ? flipDirection(sort.direction) : "asc" })}
				type="button"
			>
				{label}
				{active && <span className="text-xs">{sort.direction === "asc" ? "\u25b2" : "\u25bc"}</span>}
			</button>
		</HeaderCell>
	);
}

export function SortStatus<C extends string>({ list }: { list: Sortable<C> }) {
	return (
		<span className="sr-only" role="status">
			Sorted by {list.sorts[list.sort.column].label}, {DIRECTION_NAMES[list.sort.direction]}
		</span>
	);
}

export function SortSelect<C extends string>({ list, noun }: { list: Sortable<C>; noun: string }) {
	const { sort, setSort, sorts } = list;
	return (
		<div className="flex items-center gap-2">
			<span className="text-xs text-text-muted">Sort by</span>
			<select
				aria-label={`Sort ${noun} by`}
				className="rounded border border-border bg-surface px-2 py-1.5 text-sm text-text"
				onChange={(e) => setSort({ column: e.target.value as C, direction: sort.direction })}
				value={sort.column}
			>
				{(Object.keys(sorts) as C[]).map((column) => (
					<option key={column} value={column}>
						{sorts[column].label}
					</option>
				))}
			</select>
			<button
				className="rounded border border-border bg-surface px-2 py-1.5 text-sm text-text-muted hover:text-text transition-colors"
				onClick={() => setSort({ column: sort.column, direction: flipDirection(sort.direction) })}
				type="button"
			>
				{sort.direction === "asc" ? "\u2191 Asc" : "\u2193 Desc"}
			</button>
		</div>
	);
}
