import { useEffect, useMemo, useRef, useState } from "react";
import type { AttackCategory, Filters, Gender, Height, Killer } from "../types/killer.ts";
import { ATTACK_CATEGORIES, GENDERS, HEIGHTS } from "../types/killer.ts";

interface FilterBarProps {
	filters: Filters;
	killers: Killer[];
	onClear: () => void;
	onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
}

function MultiSelect<T extends string>({
	label,
	options,
	selected,
	onChange,
}: {
	label: string;
	options: readonly T[];
	selected: T[];
	onChange: (selected: T[]) => void;
}) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const toggle = (option: T) => {
		if (selected.includes(option)) {
			onChange(selected.filter((s) => s !== option));
		} else {
			onChange([...selected, option]);
		}
	};

	return (
		<div className="relative" ref={ref}>
			<button
				className="flex items-center gap-1.5 rounded border border-border bg-surface px-3 py-1.5 text-sm text-text-muted hover:border-accent/50 hover:text-text transition-colors"
				onClick={() => setOpen(!open)}
				type="button"
			>
				{label}
				{selected.length > 0 && (
					<span className="rounded-full bg-accent px-1.5 text-xs text-white">{selected.length}</span>
				)}
				<span className="ml-0.5 text-xs">{open ? "\u25b4" : "\u25be"}</span>
			</button>
			{open && (
				<div className="absolute top-full left-0 z-20 mt-1 min-w-40 rounded border border-border bg-surface p-1 shadow-lg shadow-black/40">
					{options.map((option) => (
						<label
							className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-surface-light transition-colors"
							key={option}
						>
							<input
								checked={selected.includes(option)}
								className="accent-accent"
								onChange={() => toggle(option)}
								type="checkbox"
							/>
							<span className={selected.includes(option) ? "text-text" : "text-text-muted"}>{option}</span>
						</label>
					))}
				</div>
			)}
		</div>
	);
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
				className="w-16 rounded border border-border bg-surface px-2 py-1.5 text-sm text-text placeholder:text-text-muted/50 focus:border-accent/50 focus:outline-none transition-colors"
				onChange={(e) => onChangeMin(e.target.value ? Number(e.target.value) : null)}
				placeholder="min"
				step={step}
				type="number"
				value={valueMin ?? ""}
			/>
			<span className="text-text-muted">&ndash;</span>
			<input
				className="w-16 rounded border border-border bg-surface px-2 py-1.5 text-sm text-text placeholder:text-text-muted/50 focus:border-accent/50 focus:outline-none transition-colors"
				onChange={(e) => onChangeMax(e.target.value ? Number(e.target.value) : null)}
				placeholder="max"
				step={step}
				type="number"
				value={valueMax ?? ""}
			/>
			<span className="text-xs text-text-muted">{unit}</span>
		</div>
	);
}

export function FilterBar({ filters, onFilterChange, onClear, killers }: FilterBarProps) {
	const [mobileOpen, setMobileOpen] = useState(false);
	const origins = useMemo(() => [...new Set(killers.map((k) => k.origin))].sort(), [killers]);

	const activeCount = [
		filters.search,
		filters.speedMin !== null,
		filters.speedMax !== null,
		filters.trMin !== null,
		filters.trMax !== null,
		filters.heights.length > 0,
		filters.genders.length > 0,
		filters.attackCategories.length > 0,
		filters.licensed !== "all",
		filters.origins.length > 0,
	].filter(Boolean).length;

	return (
		<div className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur-sm">
			<div className="md:hidden flex items-center justify-between px-4 py-3">
				<button
					className="flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors"
					onClick={() => setMobileOpen(!mobileOpen)}
					type="button"
				>
					Filters
					{activeCount > 0 && <span className="rounded-full bg-accent px-1.5 text-xs text-white">{activeCount}</span>}
				</button>
				{activeCount > 0 && (
					<button className="text-xs text-accent hover:text-accent-light" onClick={onClear} type="button">
						Clear all
					</button>
				)}
			</div>

			<div className={`${mobileOpen ? "block" : "hidden"} md:block px-4 py-3`}>
				<div className="mx-auto max-w-350 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
					<input
						className="w-full rounded border border-border bg-surface px-3 py-1.5 text-sm text-text placeholder:text-text-muted/50 focus:border-accent/50 focus:outline-none transition-colors md:w-48"
						onChange={(e) => onFilterChange("search", e.target.value)}
						placeholder="Search killers..."
						type="text"
						value={filters.search}
					/>

					<div className="h-5 w-px bg-border hidden md:block" />

					<div className="flex flex-wrap items-center gap-2">
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
					</div>

					<div className="h-5 w-px bg-border hidden md:block" />

					<div className="flex flex-wrap items-center gap-2">
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
						<MultiSelect
							label="Origin"
							onChange={(v) => onFilterChange("origins", v)}
							options={origins}
							selected={filters.origins}
						/>

						<div className="flex items-center gap-1">
							{(["all", "yes", "no"] as const).map((v) => (
								<button
									className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
										filters.licensed === v ? "bg-accent text-white" : "bg-surface-light text-text-muted hover:text-text"
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

					{activeCount > 0 && (
						<button
							className="ml-auto hidden text-xs text-accent hover:text-accent-light md:inline"
							onClick={onClear}
							type="button"
						>
							Clear ({activeCount})
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
