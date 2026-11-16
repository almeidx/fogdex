import { EmptyResults } from "../ui/Results.tsx";
import { HeaderCell, PlainHeader, SortHeader, SortSelect, SortStatus } from "../ui/Sorting.tsx";
import type { SurvivorFilteredList } from "./filters.ts";
import { SurvivorCard, SurvivorRow } from "./SurvivorRow.tsx";

export function SurvivorTable({ list }: { list: SurvivorFilteredList }) {
	const survivors = list.results;
	if (survivors.length === 0) return <EmptyResults noun="survivors" onClear={list.clear} />;

	return (
		<>
			<SortStatus list={list} />
			<div className="hidden md:block">
				<table className="w-full">
					<caption className="sr-only">Dead by Daylight survivors</caption>
					<thead>
						<tr className="border-b border-border text-left">
							<HeaderCell className="w-14" />
							<SortHeader column="name" list={list} />
							<PlainHeader>Gender</PlainHeader>
							<SortHeader column="origin" list={list} />
							<PlainHeader>Chapter</PlainHeader>
							<SortHeader column="releaseDate" list={list} />
							<SortHeader column="licensed" list={list} />
							<PlainHeader>Perks</PlainHeader>
						</tr>
					</thead>
					<tbody>
						{survivors.map((survivor, i) => (
							<SurvivorRow key={survivor.slug} priority={i < 10} survivor={survivor} />
						))}
					</tbody>
				</table>
			</div>

			<div className="mb-3 md:hidden">
				<SortSelect list={list} noun="survivors" />
			</div>
			<div className="space-y-3 md:hidden">
				{survivors.map((survivor, i) => (
					<SurvivorCard key={survivor.slug} priority={i < 4} survivor={survivor} />
				))}
			</div>
		</>
	);
}
