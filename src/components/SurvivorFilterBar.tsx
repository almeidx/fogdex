import { useEffect, useMemo, useRef, useState } from "react";
import type { Gender, LicensedOption } from "../types/killer.ts";
import { GENDERS } from "../types/killer.ts";
import type { Survivor, SurvivorFilters } from "../types/survivor.ts";
import { MultiSelect } from "./MultiSelect.tsx";

interface SurvivorFilterBarProps {
	filteredCount: number;
	filters: SurvivorFilters;
	onClear: () => void;
	onFilterChange: <K extends keyof SurvivorFilters>(key: K, value: SurvivorFilters[K]) => void;
	ref?: React.Ref<HTMLDivElement>;
	survivors: Survivor[];
	totalCount: number;
}

export function SurvivorFilterBar({
	filteredCount,
	filters,
	onFilterChange,
	onClear,
	survivors,
	ref,
	totalCount,
}: SurvivorFilterBarProps) {
	const [mobileOpen, setMobileOpen] = useState(false);
	const searchRef = useRef<HTMLInputElement>(null);
	const origins = useMemo(() => [...new Set(survivors.map((s) => s.origin))].sort(), [survivors]);

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

	const chips: { key: string; label: string; onRemove: () => void }[] = [];
	if (filters.search) {
		chips.push({ key: "search", label: `"${filters.search}"`, onRemove: () => onFilterChange("search", "") });
	}
	for (const [key, values] of [
		["genders", filters.genders],
		["origins", filters.origins],
	] as const) {
		for (const v of values) {
			chips.push({
				key: `${key}-${v}`,
				label: v,
				onRemove: () => onFilterChange(key, values.filter((x) => x !== v) as SurvivorFilters[typeof key]),
			});
		}
	}
	if (filters.licensed !== "all") {
		chips.push({
			key: "licensed",
			label: filters.licensed === "yes" ? "Licensed" : "Original",
			onRemove: () => onFilterChange("licensed", "all"),
		});
	}

	return (
		<div className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur-sm" ref={ref}>
			<div className="md:hidden flex items-center justify-between px-4 py-3">
				<button
					className="flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors"
					onClick={() => setMobileOpen(!mobileOpen)}
					type="button"
				>
					Filters
					{chips.length > 0 && <span className="rounded-full bg-accent px-1.5 text-xs text-white">{chips.length}</span>}
				</button>
				{chips.length > 0 && (
					<button className="text-xs text-accent hover:text-accent-light" onClick={onClear} type="button">
						Clear all
					</button>
				)}
			</div>

			<div className={`${mobileOpen ? "block" : "hidden"} md:block px-4 py-3`}>
				<div className="mx-auto max-w-350 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-2">
					<input
						className="w-full rounded border border-border bg-surface px-3 py-1.5 text-sm text-text placeholder:text-text-muted/50 focus:border-accent/50 focus:outline-none transition-colors md:w-48"
						onChange={(e) => onFilterChange("search", e.target.value)}
						placeholder="Search survivors..."
						ref={searchRef}
						type="text"
						value={filters.search}
					/>

					<MultiSelect
						label="Gender"
						onChange={(v) => onFilterChange("genders", v as Gender[])}
						options={GENDERS}
						selected={filters.genders}
					/>
					<MultiSelect
						label="Origin"
						onChange={(v) => onFilterChange("origins", v)}
						options={origins}
						selected={filters.origins}
					/>

					<div className="flex items-center gap-1">
						{(["all", "yes", "no"] as const).map((v) => (
							<button
								className={`rounded border border-border px-2.5 py-1.5 text-sm font-medium transition-colors ${
									filters.licensed === v
										? "bg-accent border-accent text-white"
										: "bg-surface text-text-muted hover:border-accent/50 hover:text-text"
								}`}
								key={v}
								onClick={() => onFilterChange("licensed", v as LicensedOption)}
								type="button"
							>
								{v === "all" ? "All" : v === "yes" ? "Licensed" : "Original"}
							</button>
						))}
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
										className="ml-0.5 text-text-muted/70 hover:text-text transition-colors"
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
							<button className="text-accent hover:text-accent-light" onClick={onClear} type="button">
								Clear all
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
