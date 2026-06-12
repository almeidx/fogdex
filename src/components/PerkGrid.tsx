import type { Perk, StatusEffects } from "../types/perk.ts";
import { PerkCard } from "./PerkCard.tsx";

export function PerkGrid({
	perks,
	onClearFilters,
	statusEffects,
}: {
	perks: Perk[];
	onClearFilters: () => void;
	statusEffects: StatusEffects;
}) {
	if (perks.length === 0) {
		return (
			<div className="py-16 text-center text-text-muted" role="status">
				<p className="text-lg">No perks match your filters</p>
				<p className="mt-2 text-sm">Try adjusting or clearing your filters.</p>
				<button
					className="mt-4 rounded border border-accent bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-light"
					onClick={onClearFilters}
					type="button"
				>
					Clear all filters
				</button>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{perks.map((perk, i) => (
				<PerkCard key={perk.slug} perk={perk} priority={i < 8} statusEffects={statusEffects} />
			))}
		</div>
	);
}
