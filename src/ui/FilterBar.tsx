import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { FILTER_BAR_HEIGHT_VAR } from "./layoutVars.ts";
import { useElementHeightVar } from "./useElementHeightVar.ts";
import { useHydrated } from "./useHydrated.ts";

export interface Chip {
	key: string;
	label: string;
	onRemove: () => void;
}

export function valueChips<V extends string>(
	name: string,
	selected: V[],
	onChange: (next: V[]) => void,
	label: (value: V) => string = (value) => value,
): Chip[] {
	return selected.map((value) => ({
		key: `${name}-${value}`,
		label: label(value),
		onRemove: () => onChange(selected.filter((other) => other !== value)),
	}));
}

export function Divider() {
	return <span aria-hidden="true" className="hidden h-6 w-px self-center bg-border md:block" />;
}

/** The part of a filtered list the bar itself drives. */
interface SearchableList {
	clear: () => void;
	filters: { search: string };
	items: unknown[];
	results: unknown[];
	setFilters: (patch: { search: string }) => void;
}

/**
 * Sticky bar with a search box (focus with `/`, clear or blur with Escape), the page's filter controls,
 * and removable chips for every active filter. `sortControl` is for pages without sortable column headers.
 */
export function FilterBar({
	children,
	chips,
	list,
	noun,
	sortControl,
}: {
	children: ReactNode;
	chips: Chip[];
	list: SearchableList;
	noun: string;
	sortControl?: ReactNode;
}) {
	const [mobileOpen, setMobileOpen] = useState(false);
	const searchRef = useRef<HTMLInputElement>(null);
	const panelId = useId();
	const hydrated = useHydrated();
	const measureRef = useElementHeightVar(FILTER_BAR_HEIGHT_VAR);
	const { search } = list.filters;
	const { setFilters } = list;
	const filteredCount = list.results.length;
	const totalCount = list.items.length;

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
				e.preventDefault();
				searchRef.current?.focus();
			}
			if (e.key === "Escape" && document.activeElement === searchRef.current) {
				if (search) {
					setFilters({ search: "" });
				} else {
					searchRef.current?.blur();
				}
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [search, setFilters]);

	const allChips: Chip[] = search
		? [{ key: "search", label: `"${search}"`, onRemove: () => setFilters({ search: "" }) }, ...chips]
		: chips;

	return (
		<div className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur-sm" ref={measureRef}>
			<span className="sr-only" role="status">
				{hydrated ? `${filteredCount} of ${totalCount} ${noun}` : ""}
			</span>
			<div className="md:hidden flex items-center justify-between px-4 py-3">
				<button
					aria-controls={panelId}
					aria-expanded={mobileOpen}
					className="flex items-center gap-2 py-1.5 text-sm text-text-muted hover:text-text transition-colors"
					onClick={() => setMobileOpen(!mobileOpen)}
					type="button"
				>
					Filters
					{allChips.length > 0 && (
						<span className="rounded-full bg-accent px-1.5 text-xs text-white">{allChips.length}</span>
					)}
				</button>
				<div className="flex items-center gap-3">
					{sortControl}
					{allChips.length > 0 && (
						<button className="text-xs text-accent-text hover:text-accent-light" onClick={list.clear} type="button">
							Clear all
						</button>
					)}
				</div>
			</div>

			<div className={`${mobileOpen ? "block" : "hidden"} md:block px-4 py-3`} id={panelId}>
				<div className="mx-auto max-w-350 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-2">
					<input
						aria-label={`Search ${noun}`}
						className="w-full rounded border border-border bg-surface px-3 py-1.5 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors md:w-48"
						onChange={(e) => setFilters({ search: e.target.value })}
						placeholder={`Search ${noun}...`}
						ref={searchRef}
						type="text"
						value={search}
					/>
					{children}
					{sortControl && <div className="hidden md:block ml-auto">{sortControl}</div>}
				</div>
			</div>

			{allChips.length > 0 && (
				<div className="px-4 pb-3">
					<div className="mx-auto max-w-350 flex items-center gap-3">
						<div className="flex flex-1 flex-wrap gap-1.5">
							{allChips.map((chip) => (
								<span
									className="flex items-center gap-1 rounded-full bg-surface-light px-2.5 py-1 text-xs text-text-muted"
									key={chip.key}
								>
									{chip.label}
									<button
										className="ml-0.5 -my-1 p-1 text-text-muted hover:text-text transition-colors"
										onClick={chip.onRemove}
										type="button"
									>
										{"\u00d7"}
									</button>
								</span>
							))}
						</div>
						<div className="hidden shrink-0 items-center gap-2 text-xs text-text-muted md:flex">
							{filteredCount < totalCount && (
								<span>
									{filteredCount} of {totalCount}
								</span>
							)}
							<button className="text-accent-text hover:text-accent-light" onClick={list.clear} type="button">
								Clear all
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
