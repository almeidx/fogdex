import { EmptyResults } from "../ui/Results.tsx";
import { HeaderCell, PlainHeader, SortHeader, SortSelect, SortStatus } from "../ui/Sorting.tsx";
import type { KillerFilteredList } from "./filters.ts";
import { KillerCard, KillerRow } from "./KillerRow.tsx";

export function KillerTable({ list }: { list: KillerFilteredList }) {
	const killers = list.results;
	if (killers.length === 0) return <EmptyResults noun="killers" onClear={list.clear} />;

	return (
		<>
			<SortStatus list={list} />
			<div className="hidden md:block">
				<table className="w-full">
					<caption className="sr-only">Dead by Daylight killers</caption>
					<thead>
						<tr className="border-b border-border text-left">
							<HeaderCell className="w-14" />
							<SortHeader column="name" list={list} />
							<SortHeader column="speed" list={list} />
							<SortHeader column="terrorRadius" list={list}>
								TR
							</SortHeader>
							<PlainHeader>Attack</PlainHeader>
							<SortHeader column="height" list={list} />
							<SortHeader column="origin" list={list} />
							<SortHeader column="releaseDate" list={list} />
							<SortHeader column="licensed" list={list} />
							<PlainHeader>Perks</PlainHeader>
						</tr>
					</thead>
					<tbody>
						{killers.map((killer, i) => (
							<KillerRow key={killer.slug} killer={killer} priority={i < 10} />
						))}
					</tbody>
				</table>
			</div>

			<div className="mb-3 md:hidden">
				<SortSelect list={list} noun="killers" />
			</div>
			<div className="space-y-3 md:hidden">
				{killers.map((killer, i) => (
					<KillerCard key={killer.slug} killer={killer} priority={i < 4} />
				))}
			</div>
		</>
	);
}
