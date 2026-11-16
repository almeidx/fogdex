import { NuqsAdapter } from "nuqs/adapters/react";
import { useFilteredList } from "../ui/filteredList.ts";
import { Results } from "../ui/Results.tsx";
import { survivorList } from "./filters.ts";
import type { Survivor } from "./schema.ts";
import { SurvivorFilterBar } from "./SurvivorFilterBar.tsx";
import { SurvivorTable } from "./SurvivorTable.tsx";

function SurvivorsView({ survivors }: { survivors: Survivor[] }) {
	const list = useFilteredList(survivors, survivorList);

	return (
		<>
			<SurvivorFilterBar list={list} />
			<Results>
				<SurvivorTable list={list} />
			</Results>
		</>
	);
}

export function SurvivorsIsland({ survivors }: { survivors: Survivor[] }) {
	return (
		<NuqsAdapter>
			<SurvivorsView survivors={survivors} />
		</NuqsAdapter>
	);
}
