import { FilterBar, valueChips } from "../ui/FilterBar.tsx";
import { MultiSelect } from "../ui/MultiSelect.tsx";
import { SortSelect } from "../ui/Sorting.tsx";
import { perkOwnerOptions, type PerkFilteredList } from "./filters.ts";

export function PerkFilterBar({ list }: { list: PerkFilteredList }) {
	const { filters, setFilters } = list;
	const perks = list.items;
	const tags = [...new Set(perks.flatMap((p) => p.tags))].sort();
	const chapters = [...new Set(perks.flatMap((p) => (p.chapter === null ? [] : [p.chapter])))].sort();
	const owners = perkOwnerOptions(perks);
	const ownerLabel = (key: string) => owners.get(key) ?? key;

	const chips = [
		...valueChips("tag", filters.tags, (tags) => setFilters({ tags })),
		...valueChips("owner", filters.owners, (owners) => setFilters({ owners }), ownerLabel),
		...valueChips("chapter", filters.chapters, (chapters) => setFilters({ chapters })),
	];

	return (
		<FilterBar chips={chips} list={list} noun="perks" sortControl={<SortSelect list={list} noun="perks" />}>
			{tags.length > 0 && (
				<MultiSelect label="Tags" onChange={(tags) => setFilters({ tags })} options={tags} selected={filters.tags} />
			)}
			<MultiSelect
				label="Owner"
				labelFn={ownerLabel}
				onChange={(owners) => setFilters({ owners })}
				options={[...owners.keys()]}
				searchable
				selected={filters.owners}
			/>
			{chapters.length > 0 && (
				<MultiSelect
					label="Chapter"
					onChange={(chapters) => setFilters({ chapters })}
					options={chapters}
					selected={filters.chapters}
				/>
			)}
		</FilterBar>
	);
}
