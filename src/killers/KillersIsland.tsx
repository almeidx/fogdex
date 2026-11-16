import { NuqsAdapter } from "nuqs/adapters/react";
import { useFilteredList } from "../ui/filteredList.ts";
import { Results } from "../ui/Results.tsx";
import { killerList } from "./filters.ts";
import { KillerFilterBar } from "./KillerFilterBar.tsx";
import { KillerTable } from "./KillerTable.tsx";
import type { Killer } from "./schema.ts";
import { TrPlayer } from "./TrPlayer.tsx";

function KillersView({ killers }: { killers: Killer[] }) {
	const list = useFilteredList(killers, killerList);

	return (
		<>
			<KillerFilterBar list={list} />
			<Results>
				<KillerTable list={list} />
			</Results>
			<TrPlayer />
		</>
	);
}

export function KillersIsland({ killers }: { killers: Killer[] }) {
	return (
		<NuqsAdapter>
			<KillersView killers={killers} />
		</NuqsAdapter>
	);
}
