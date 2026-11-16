import { formatReleaseDate } from "../characters/character.ts";
import { CharacterNameLink, LicensedBadge, LicensedLabel } from "../characters/CharacterParts.tsx";
import { ViewPerksLink } from "../perks/ViewPerksLink.tsx";
import { CdnImage } from "../ui/CdnImage.tsx";
import type { Survivor } from "./schema.ts";

export function SurvivorRow({ survivor, priority }: { survivor: Survivor; priority: boolean }) {
	return (
		<tr className="border-b border-border/50 transition-colors hover:bg-surface-light/50" id={survivor.slug}>
			<td className="py-2 px-2">
				<CdnImage
					className="h-12 w-12 rounded bg-surface object-cover"
					path={survivor.portraitPath}
					priority={priority}
				/>
			</td>
			<td className="py-2 px-2">
				<CharacterNameLink character={survivor} />
			</td>
			<td className="py-2 px-2 text-sm">{survivor.gender}</td>
			<td className="py-2 px-2 text-sm">{survivor.origin}</td>
			<td className="py-2 px-2 text-sm">{survivor.chapter}</td>
			<td className="py-2 px-2 text-sm tabular-nums">{formatReleaseDate(survivor.releaseDate)}</td>
			<td className="py-2 px-2">
				<LicensedLabel licensed={survivor.licensed} />
			</td>
			<td className="py-2 px-2">
				<ViewPerksLink role="survivor" slug={survivor.slug} />
			</td>
		</tr>
	);
}

export function SurvivorCard({ survivor, priority }: { survivor: Survivor; priority: boolean }) {
	return (
		<div className="flex gap-3 rounded-lg border border-border bg-surface p-3" id={`card-${survivor.slug}`}>
			<CdnImage
				className="size-16 shrink-0 rounded bg-surface-light object-cover"
				path={survivor.portraitPath}
				priority={priority}
			/>
			<div className="min-w-0 flex-1">
				<div className="flex items-start justify-between gap-2">
					<CharacterNameLink character={survivor} />
					<ViewPerksLink className="shrink-0" role="survivor" slug={survivor.slug} />
				</div>
				<div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
					<span>{survivor.origin}</span>
					<span>{survivor.chapter}</span>
					<LicensedBadge licensed={survivor.licensed} />
				</div>
			</div>
		</div>
	);
}
