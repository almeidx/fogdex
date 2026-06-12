import { useEffect, useMemo, useRef, useState } from "react";
import type { Perk, PerkFilters, PerkSortColumn, PerkSortState } from "../types/perk.ts";
import { PERK_SORT_COLUMNS } from "../types/perk.ts";
import { MultiSelect } from "./MultiSelect.tsx";

const SORT_LABELS: Record<PerkSortColumn, string> = {
	name: "Name",
	owner: "Owner",
};

function ownerFilterValue(perk: Perk): string {
	if (perk.owner) return perk.owner;
	if (perk.ownerName) return `__missing_owner__:${perk.ownerName}`;
	return "__universal__";
}

interface PerkFilterBarProps {
	filteredCount: number;
	filters: PerkFilters;
	onClear: () => void;
	onFilterChange: <K extends keyof PerkFilters>(key: K, value: PerkFilters[K]) => void;
	onSortChange: (sort: PerkSortState) => void;
	perks: Perk[];
	sort: PerkSortState;
	totalCount: number;
}

export function PerkFilterBar({
	filteredCount,
	filters,
	perks,
	onClear,
	onFilterChange,
	onSortChange,
	sort,
	totalCount,
}: PerkFilterBarProps) {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const searchRef = useRef<HTMLInputElement>(null);

	const allTags = useMemo(() => [...new Set(perks.flatMap((p) => p.tags))].sort(), [perks]);

	const ownerOptions = useMemo(() => {
		const owners = new Map<string, string>();
		for (const p of perks) {
			if (p.ownerName) {
				owners.set(ownerFilterValue(p), p.ownerName);
			}
		}
		const sorted = [...owners.entries()].sort((a, b) => a[1].localeCompare(b[1]));
		sorted.push(["__universal__", "Universal"]);
		return sorted;
	}, [perks]);

	const chapterOptions = useMemo(
		() => [...new Set(perks.map((p) => p.chapter).filter((c): c is string => c !== null))].sort(),
		[perks],
	);

	const searchValueRef = useRef(filters.search);
	searchValueRef.current = filters.search;

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
				e.preventDefault();
				searchRef.current?.focus();
			}
			if (e.key === "Escape" && document.activeElement === searchRef.current) {
				if (searchValueRef.current) {
					onFilterChange("search", "");
				} else {
					searchRef.current?.blur();
				}
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onFilterChange]);

	useEffect(() => {
		setMounted(true);
	}, []);

	const chips: { key: string; label: string; onRemove: () => void }[] = [];
	if (filters.search) {
		chips.push({ key: "search", label: `"${filters.search}"`, onRemove: () => onFilterChange("search", "") });
	}
	for (const tag of filters.tags) {
		chips.push({
			key: `tag-${tag}`,
			label: tag,
			onRemove: () =>
				onFilterChange(
					"tags",
					filters.tags.filter((t) => t !== tag),
				),
		});
	}
	for (const ownerSlug of filters.owners) {
		const ownerLabel = ownerOptions.find(([slug]) => slug === ownerSlug)?.[1] ?? ownerSlug;
		chips.push({
			key: `owner-${ownerSlug}`,
			label: ownerLabel,
			onRemove: () =>
				onFilterChange(
					"owners",
					filters.owners.filter((o) => o !== ownerSlug),
				),
		});
	}
	for (const chapter of filters.chapters) {
		chips.push({
			key: `chapter-${chapter}`,
			label: chapter,
			onRemove: () =>
				onFilterChange(
					"chapters",
					filters.chapters.filter((c) => c !== chapter),
				),
		});
	}

	return (
		<div className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur-sm">
			<span className="sr-only" role="status">
				{mounted ? `${filteredCount} of ${totalCount} perks` : ""}
			</span>
			<div className="md:hidden flex items-center justify-between px-4 py-3">
				<button
					aria-controls="perk-filter-panel"
					aria-expanded={mobileOpen}
					className="flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors"
					onClick={() => setMobileOpen(!mobileOpen)}
					type="button"
				>
					Filters
					{chips.length > 0 && <span className="rounded-full bg-accent px-1.5 text-xs text-white">{chips.length}</span>}
				</button>
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<span className="text-xs text-text-muted">Sort</span>
						<select
							aria-label="Sort perks by"
							className="rounded border border-border bg-surface px-2 py-1.5 text-sm text-text"
							onChange={(e) => onSortChange({ column: e.target.value as PerkSortColumn, direction: sort.direction })}
							value={sort.column}
						>
							{PERK_SORT_COLUMNS.map((col) => (
								<option key={col} value={col}>
									{SORT_LABELS[col]}
								</option>
							))}
						</select>
						<button
							className="rounded border border-border bg-surface px-2 py-1.5 text-sm text-text-muted hover:text-text transition-colors"
							onClick={() =>
								onSortChange({ column: sort.column, direction: sort.direction === "asc" ? "desc" : "asc" })
							}
							type="button"
						>
							{sort.direction === "asc" ? "\u2191" : "\u2193"}
						</button>
					</div>
					{chips.length > 0 && (
						<button className="text-xs text-accent-text hover:text-accent-light" onClick={onClear} type="button">
							Clear
						</button>
					)}
				</div>
			</div>

			<div className={`${mobileOpen ? "block" : "hidden"} md:block px-4 py-3`} id="perk-filter-panel">
				<div className="mx-auto max-w-350 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-2">
					<input
						aria-label="Search perks"
						className="w-full rounded border border-border bg-surface px-3 py-1.5 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors md:w-48"
						onChange={(e) => onFilterChange("search", e.target.value)}
						placeholder="Search perks..."
						ref={searchRef}
						type="text"
						value={filters.search}
					/>

					{allTags.length > 0 && (
						<MultiSelect
							label="Tags"
							onChange={(v) => onFilterChange("tags", v)}
							options={allTags}
							selected={filters.tags}
						/>
					)}

					<MultiSelect
						label="Owner"
						labelFn={(slug) => ownerOptions.find(([ownerSlug]) => ownerSlug === slug)?.[1] ?? slug}
						onChange={(v) => onFilterChange("owners", v)}
						options={ownerOptions.map(([slug]) => slug)}
						searchable
						selected={filters.owners}
					/>

					{chapterOptions.length > 0 && (
						<MultiSelect
							label="Chapter"
							onChange={(v) => onFilterChange("chapters", v)}
							options={chapterOptions}
							selected={filters.chapters}
						/>
					)}

					<div className="hidden md:flex items-center gap-2 ml-auto">
						<span className="text-xs text-text-muted">Sort</span>
						<select
							aria-label="Sort perks by"
							className="rounded border border-border bg-surface px-2 py-1.5 text-sm text-text"
							onChange={(e) => onSortChange({ column: e.target.value as PerkSortColumn, direction: sort.direction })}
							value={sort.column}
						>
							{PERK_SORT_COLUMNS.map((col) => (
								<option key={col} value={col}>
									{SORT_LABELS[col]}
								</option>
							))}
						</select>
						<button
							className="rounded border border-border bg-surface px-2 py-1.5 text-sm text-text-muted hover:text-text transition-colors"
							onClick={() =>
								onSortChange({ column: sort.column, direction: sort.direction === "asc" ? "desc" : "asc" })
							}
							type="button"
						>
							{sort.direction === "asc" ? "\u2191 Asc" : "\u2193 Desc"}
						</button>
					</div>
				</div>
			</div>

			{chips.length > 0 && (
				<div className="px-4 pb-3">
					<div className="mx-auto max-w-350 flex items-center gap-3">
						<div className="flex flex-1 flex-wrap gap-1.5">
							{chips.map((chip) => (
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
							<button className="text-accent-text hover:text-accent-light" onClick={onClear} type="button">
								Clear all
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
