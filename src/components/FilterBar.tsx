import { useEffect, useMemo, useRef, useState } from "react";
import type { AttackCategory, Filters, Gender, Height, Killer } from "../types/killer.ts";
import { ATTACK_CATEGORIES, GENDERS, HEIGHTS } from "../types/killer.ts";
import { MultiSelect } from "./MultiSelect.tsx";

interface FilterBarProps {
	filteredCount: number;
	filters: Filters;
	killers: Killer[];
	onClear: () => void;
	onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
	ref?: React.Ref<HTMLDivElement>;
	totalCount: number;
}

function RangeFilter({
	label,
	unit,
	step,
	valueMin,
	valueMax,
	onChangeMin,
	onChangeMax,
}: {
	label: string;
	unit: string;
	step: number;
	valueMin: number | null;
	valueMax: number | null;
	onChangeMin: (v: number | null) => void;
	onChangeMax: (v: number | null) => void;
}) {
	return (
		<div className="flex items-center gap-1.5 text-sm">
			<span className="text-text-muted">{label}</span>
			<input
				aria-label={`${label} minimum (${unit})`}
				className="w-16 rounded border border-border bg-surface px-2 py-1.5 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
				onChange={(e) => onChangeMin(e.target.value ? Number(e.target.value) : null)}
				placeholder="min"
				step={step}
				type="number"
				value={valueMin ?? ""}
			/>
			<span className="text-text-muted">&ndash;</span>
			<input
				aria-label={`${label} maximum (${unit})`}
				className="w-16 rounded border border-border bg-surface px-2 py-1.5 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
				onChange={(e) => onChangeMax(e.target.value ? Number(e.target.value) : null)}
				placeholder="max"
				step={step}
				type="number"
				value={valueMax ?? ""}
			/>
			<span className="text-xs text-text-muted">{unit}</span>
			{valueMin !== null && valueMax !== null && valueMin > valueMax && (
				<span className="text-xs text-accent-text" role="alert">
					Min is above max
				</span>
			)}
		</div>
	);
}

export function FilterBar({
	filteredCount,
	filters,
	onFilterChange,
	onClear,
	killers,
	ref,
	totalCount,
}: FilterBarProps) {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const searchRef = useRef<HTMLInputElement>(null);
	const origins = useMemo(() => [...new Set(killers.map((k) => k.origin))].sort(), [killers]);

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
	if (filters.speedMin !== null || filters.speedMax !== null) {
		const parts: string[] = [];
		if (filters.speedMin !== null) parts.push(`\u2265${filters.speedMin}`);
		if (filters.speedMax !== null) parts.push(`\u2264${filters.speedMax}`);
		chips.push({
			key: "speed",
			label: `Speed: ${parts.join(", ")} m/s`,
			onRemove: () => {
				onFilterChange("speedMin", null);
				onFilterChange("speedMax", null);
			},
		});
	}
	if (filters.trMin !== null || filters.trMax !== null) {
		const parts: string[] = [];
		if (filters.trMin !== null) parts.push(`\u2265${filters.trMin}`);
		if (filters.trMax !== null) parts.push(`\u2264${filters.trMax}`);
		chips.push({
			key: "tr",
			label: `TR: ${parts.join(", ")}m`,
			onRemove: () => {
				onFilterChange("trMin", null);
				onFilterChange("trMax", null);
			},
		});
	}
	if (filters.hasLullaby) {
		chips.push({
			key: "lullaby",
			label: "Has lullaby",
			onRemove: () => onFilterChange("hasLullaby", false),
		});
	}
	for (const [key, values] of [
		["heights", filters.heights],
		["genders", filters.genders],
		["attackCategories", filters.attackCategories],
		["origins", filters.origins],
	] as const) {
		for (const v of values) {
			chips.push({
				key: `${key}-${v}`,
				label: v,
				onRemove: () => onFilterChange(key, values.filter((x) => x !== v) as Filters[typeof key]),
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
			<span className="sr-only" role="status">
				{mounted ? `${filteredCount} of ${totalCount} killers` : ""}
			</span>
			<div className="md:hidden flex items-center justify-between px-4 py-3">
				<button
					aria-controls="killer-filter-panel"
					aria-expanded={mobileOpen}
					className="flex items-center gap-2 py-1.5 text-sm text-text-muted hover:text-text transition-colors"
					onClick={() => setMobileOpen(!mobileOpen)}
					type="button"
				>
					Filters
					{chips.length > 0 && <span className="rounded-full bg-accent px-1.5 text-xs text-white">{chips.length}</span>}
				</button>
				{chips.length > 0 && (
					<button className="text-xs text-accent-text hover:text-accent-light" onClick={onClear} type="button">
						Clear all
					</button>
				)}
			</div>

			<div className={`${mobileOpen ? "block" : "hidden"} md:block px-4 py-3`} id="killer-filter-panel">
				<div className="mx-auto max-w-350 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-2">
					<input
						aria-label="Search killers"
						className="w-full rounded border border-border bg-surface px-3 py-1.5 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors md:w-48"
						onChange={(e) => onFilterChange("search", e.target.value)}
						placeholder="Search killers..."
						ref={searchRef}
						type="text"
						value={filters.search}
					/>

					<span aria-hidden="true" className="hidden h-6 w-px self-center bg-border md:block" />

					<RangeFilter
						label="Speed"
						onChangeMax={(v) => onFilterChange("speedMax", v)}
						onChangeMin={(v) => onFilterChange("speedMin", v)}
						step={0.05}
						unit="m/s"
						valueMax={filters.speedMax}
						valueMin={filters.speedMin}
					/>
					<RangeFilter
						label="TR"
						onChangeMax={(v) => onFilterChange("trMax", v)}
						onChangeMin={(v) => onFilterChange("trMin", v)}
						step={1}
						unit="m"
						valueMax={filters.trMax}
						valueMin={filters.trMin}
					/>
					<button
						aria-pressed={filters.hasLullaby}
						className={`rounded border px-2.5 py-1.5 text-sm font-medium transition-colors ${
							filters.hasLullaby
								? "border-accent bg-accent text-white"
								: "border-border bg-surface text-text-muted hover:border-accent/50 hover:text-text"
						}`}
						onClick={() => onFilterChange("hasLullaby", !filters.hasLullaby)}
						type="button"
					>
						Has lullaby
					</button>

					<span aria-hidden="true" className="hidden h-6 w-px self-center bg-border md:block" />

					<MultiSelect
						label="Height"
						onChange={(v) => onFilterChange("heights", v as Height[])}
						options={HEIGHTS}
						selected={filters.heights}
					/>
					<MultiSelect
						label="Gender"
						onChange={(v) => onFilterChange("genders", v as Gender[])}
						options={GENDERS}
						selected={filters.genders}
					/>
					<MultiSelect
						label="Attack"
						onChange={(v) => onFilterChange("attackCategories", v as AttackCategory[])}
						options={ATTACK_CATEGORIES}
						selected={filters.attackCategories}
					/>
					<span aria-hidden="true" className="hidden h-6 w-px self-center bg-border md:block" />
					<MultiSelect
						label="Origin"
						onChange={(v) => onFilterChange("origins", v)}
						options={origins}
						searchable
						selected={filters.origins}
					/>

					<div className="flex items-center gap-1">
						{(["all", "yes", "no"] as const).map((v) => (
							<button
								aria-label={
									v === "all" ? "All killers" : v === "yes" ? "Licensed killers only" : "Original killers only"
								}
								aria-pressed={filters.licensed === v}
								className={`rounded border border-border px-2.5 py-1.5 text-sm font-medium transition-colors ${
									filters.licensed === v
										? "bg-accent border-accent text-white"
										: "bg-surface text-text-muted hover:border-accent/50 hover:text-text"
								}`}
								key={v}
								onClick={() => onFilterChange("licensed", v)}
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
