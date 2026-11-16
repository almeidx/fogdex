import { valueChips, type Chip } from "../ui/FilterBar.tsx";
import { MultiSelect } from "../ui/MultiSelect.tsx";
import { WikiLinkHint } from "../ui/WikiLinkHint.tsx";
import { GENDERS } from "./character.ts";
import { LICENSED_OPTIONS, type CharacterFilters, type LicensedOption } from "./filters.ts";
import type { Character } from "./schema.ts";

/** The part of a character page's filtered list that the shared character filters use. */
interface CharacterList {
	filters: CharacterFilters;
	items: Character[];
	setFilters: (patch: Partial<CharacterFilters>) => void;
}

const LICENSED_LABELS: Record<LicensedOption, string> = { all: "All", no: "Original", yes: "Licensed" };

export function CharacterNameLink({ character }: { character: Character }) {
	return (
		<a className="group" href={character.wikiUrl} rel="noopener noreferrer" target="_blank">
			<div className="font-medium text-text group-hover:text-accent-text transition-colors">
				{character.displayName}
				<WikiLinkHint />
			</div>
			{character.realName && <div className="text-xs text-text-muted">{character.realName}</div>}
		</a>
	);
}

export function LicensedLabel({ licensed }: { licensed: boolean }) {
	return licensed ? (
		<span className="text-xs font-medium text-accent-text">{LICENSED_LABELS.yes}</span>
	) : (
		<span className="text-xs text-text-muted">{LICENSED_LABELS.no}</span>
	);
}

/** Card form of the licensed label: shown only for licensed characters. */
export function LicensedBadge({ licensed }: { licensed: boolean }) {
	return licensed && <span className="text-accent-text">{LICENSED_LABELS.yes}</span>;
}

export function GenderFilter({ list }: { list: CharacterList }) {
	return (
		<MultiSelect
			label="Gender"
			onChange={(genders) => list.setFilters({ genders })}
			options={GENDERS}
			selected={list.filters.genders}
		/>
	);
}

export function OriginFilter({ list, searchable }: { list: CharacterList; searchable?: boolean }) {
	return (
		<MultiSelect
			label="Origin"
			onChange={(origins) => list.setFilters({ origins })}
			options={[...new Set(list.items.map((c) => c.origin))].sort()}
			searchable={searchable}
			selected={list.filters.origins}
		/>
	);
}

export function LicensedToggle({ list, noun }: { list: CharacterList; noun: string }) {
	return (
		<div className="flex items-center gap-1">
			{LICENSED_OPTIONS.map((option) => (
				<button
					aria-label={option === "all" ? `All ${noun}` : `${LICENSED_LABELS[option]} ${noun} only`}
					aria-pressed={list.filters.licensed === option}
					className={`rounded border border-border px-2.5 py-1.5 text-sm font-medium transition-colors ${
						list.filters.licensed === option
							? "bg-accent border-accent text-white"
							: "bg-surface text-text-muted hover:border-accent/50 hover:text-text"
					}`}
					key={option}
					onClick={() => list.setFilters({ licensed: option })}
					type="button"
				>
					{LICENSED_LABELS[option]}
				</button>
			))}
		</div>
	);
}

export function characterChips({ filters, setFilters }: CharacterList): Chip[] {
	const chips = [
		...valueChips("genders", filters.genders, (genders) => setFilters({ genders })),
		...valueChips("origins", filters.origins, (origins) => setFilters({ origins })),
	];
	if (filters.licensed !== "all") {
		chips.push({
			key: "licensed",
			label: LICENSED_LABELS[filters.licensed],
			onRemove: () => setFilters({ licensed: "all" }),
		});
	}
	return chips;
}
