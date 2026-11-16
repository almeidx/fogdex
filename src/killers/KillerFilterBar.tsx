import { characterChips, GenderFilter, LicensedToggle, OriginFilter } from "../characters/CharacterParts.tsx";
import { Divider, FilterBar, valueChips, type Chip } from "../ui/FilterBar.tsx";
import { MultiSelect } from "../ui/MultiSelect.tsx";
import type { KillerFilteredList } from "./filters.ts";
import { ATTACK_CATEGORIES, HEIGHTS } from "./killer.ts";

const INPUT_CLASS =
	"w-16 rounded border border-border bg-surface px-2 py-1.5 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors";

function RangeFilter({
	label,
	max,
	min,
	onChangeMax,
	onChangeMin,
	step,
	unit,
}: {
	label: string;
	max: number | null;
	min: number | null;
	onChangeMax: (value: number | null) => void;
	onChangeMin: (value: number | null) => void;
	step: number;
	unit: string;
}) {
	return (
		<div className="flex items-center gap-1.5 text-sm">
			<span className="text-text-muted">{label}</span>
			<input
				aria-label={`${label} minimum (${unit})`}
				className={INPUT_CLASS}
				onChange={(e) => onChangeMin(e.target.value ? Number(e.target.value) : null)}
				placeholder="min"
				step={step}
				type="number"
				value={min ?? ""}
			/>
			<span className="text-text-muted">&ndash;</span>
			<input
				aria-label={`${label} maximum (${unit})`}
				className={INPUT_CLASS}
				onChange={(e) => onChangeMax(e.target.value ? Number(e.target.value) : null)}
				placeholder="max"
				step={step}
				type="number"
				value={max ?? ""}
			/>
			<span className="text-xs text-text-muted">{unit}</span>
			{min !== null && max !== null && min > max && (
				<span className="text-xs text-accent-text" role="alert">
					Min is above max
				</span>
			)}
		</div>
	);
}

function rangeChip(
	key: string,
	label: string,
	unit: string,
	min: number | null,
	max: number | null,
	onRemove: () => void,
): Chip[] {
	if (min === null && max === null) return [];
	const bounds = [min !== null && `\u2265${min}`, max !== null && `\u2264${max}`].filter(Boolean);
	return [{ key, label: `${label}: ${bounds.join(", ")}${unit}`, onRemove }];
}

export function KillerFilterBar({ list }: { list: KillerFilteredList }) {
	const { filters, setFilters } = list;

	const chips: Chip[] = [
		...rangeChip("speed", "Speed", " m/s", filters.speedMin, filters.speedMax, () =>
			setFilters({ speedMax: null, speedMin: null }),
		),
		...rangeChip("tr", "TR", "m", filters.trMin, filters.trMax, () => setFilters({ trMax: null, trMin: null })),
		...(filters.hasLullaby
			? [{ key: "lullaby", label: "Has lullaby", onRemove: () => setFilters({ hasLullaby: false }) }]
			: []),
		...valueChips("heights", filters.heights, (heights) => setFilters({ heights })),
		...valueChips("attackCategories", filters.attackCategories, (attackCategories) => setFilters({ attackCategories })),
		...characterChips(list),
	];

	return (
		<FilterBar chips={chips} list={list} noun="killers">
			<Divider />
			<RangeFilter
				label="Speed"
				max={filters.speedMax}
				min={filters.speedMin}
				onChangeMax={(speedMax) => setFilters({ speedMax })}
				onChangeMin={(speedMin) => setFilters({ speedMin })}
				step={0.05}
				unit="m/s"
			/>
			<RangeFilter
				label="TR"
				max={filters.trMax}
				min={filters.trMin}
				onChangeMax={(trMax) => setFilters({ trMax })}
				onChangeMin={(trMin) => setFilters({ trMin })}
				step={1}
				unit="m"
			/>
			<button
				aria-pressed={filters.hasLullaby}
				className={`rounded border px-2.5 py-1.5 text-sm font-medium transition-colors ${
					filters.hasLullaby
						? "border-accent bg-accent text-white"
						: "border-border bg-surface text-text-muted hover:border-accent/50 hover:text-text"
				}`}
				onClick={() => setFilters({ hasLullaby: !filters.hasLullaby })}
				type="button"
			>
				Has lullaby
			</button>
			<Divider />
			<MultiSelect
				label="Height"
				onChange={(heights) => setFilters({ heights })}
				options={HEIGHTS}
				selected={filters.heights}
			/>
			<GenderFilter list={list} />
			<MultiSelect
				label="Attack"
				onChange={(attackCategories) => setFilters({ attackCategories })}
				options={ATTACK_CATEGORIES}
				selected={filters.attackCategories}
			/>
			<Divider />
			<OriginFilter list={list} searchable />
			<LicensedToggle list={list} noun="killers" />
		</FilterBar>
	);
}
