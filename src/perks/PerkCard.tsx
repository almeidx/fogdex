import { characterSearchHref } from "../characters/filters.ts";
import { CdnImage } from "../ui/CdnImage.tsx";
import { WikiLinkHint } from "../ui/WikiLinkHint.tsx";
import { PerkDescription } from "./PerkDescription.tsx";
import type { Perk, StatusEffects } from "./schema.ts";

/** Character slug → portrait path. */
export type OwnerPortraits = Record<string, string>;

function PerkOwner({ ownerPortraits, perk }: { ownerPortraits: OwnerPortraits; perk: Perk }) {
	if (!perk.ownerName) return <span className="mt-0.5 text-xs text-text-muted">Universal</span>;

	return (
		<div className="mt-0.5 flex items-center gap-1.5">
			{perk.owner ? (
				<>
					<CdnImage className="size-5 rounded-full bg-surface-light object-cover" path={ownerPortraits[perk.owner]} />
					<a
						className="text-xs text-text-muted hover:text-accent-text transition-colors"
						href={characterSearchHref(perk.role, perk.owner)}
					>
						{perk.ownerName}
					</a>
				</>
			) : (
				<span className="text-xs text-text-muted">{perk.ownerName}</span>
			)}
		</div>
	);
}

export function PerkCard({
	ownerPortraits,
	perk,
	priority,
	statusEffects,
}: {
	ownerPortraits: OwnerPortraits;
	perk: Perk;
	priority: boolean;
	statusEffects: StatusEffects;
}) {
	return (
		<div className="flex flex-col rounded-lg border border-border bg-surface p-4" id={perk.slug}>
			<div className="flex items-start gap-3">
				<CdnImage
					className="size-12 shrink-0 rounded bg-surface-light object-cover"
					path={perk.iconPath}
					priority={priority}
				/>
				<div className="min-w-0 flex-1">
					<a className="group" href={perk.wikiUrl} rel="noopener noreferrer" target="_blank">
						<h3 className="font-medium text-text group-hover:text-accent-text transition-colors">
							{perk.name}
							<WikiLinkHint />
						</h3>
						{perk.aliases.length > 0 && <p className="text-[0.65rem] text-text-muted">aka {perk.aliases.join(", ")}</p>}
					</a>
					<PerkOwner ownerPortraits={ownerPortraits} perk={perk} />
				</div>
			</div>

			<div className="mt-3">
				<PerkDescription perk={perk} statusEffects={statusEffects} />
			</div>

			{perk.tags.length > 0 && (
				<div className="mt-3 flex flex-wrap gap-1.5">
					{perk.tags.map((tag) => (
						<span className="rounded-full bg-surface-light px-2 py-0.5 text-[0.65rem] text-text-muted" key={tag}>
							{tag}
						</span>
					))}
				</div>
			)}
		</div>
	);
}
