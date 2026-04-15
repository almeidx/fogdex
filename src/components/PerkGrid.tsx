import type { Perk } from "../types/perk.ts";
import { PerkCard } from "./PerkCard.tsx";

export function PerkGrid({ perks }: { perks: Perk[] }) {
	if (perks.length === 0) {
		return (
			<div className="py-16 text-center text-text-muted">
				<p className="text-lg">No perks match your filters</p>
				<p className="mt-2 text-sm">Try adjusting or clearing your filters.</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{perks.map((perk, i) => (
				<PerkCard key={perk.id} perk={perk} priority={i < 8} />
			))}
		</div>
	);
}
