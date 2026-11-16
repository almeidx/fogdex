import { formatReleaseDate } from "../characters/character.ts";
import { CharacterNameLink, LicensedBadge, LicensedLabel } from "../characters/CharacterParts.tsx";
import { ViewPerksLink } from "../perks/ViewPerksLink.tsx";
import { CdnImage } from "../ui/CdnImage.tsx";
import { speedPercentage, type AttackCategory } from "./killer.ts";
import type { Killer } from "./schema.ts";
import { TrPlayButton } from "./TrPlayer.tsx";

const ATTACK_BADGE_STYLES: Record<AttackCategory, string> = {
	Melee: "bg-steel/20 text-steel",
	Ranged: "bg-azure/20 text-azure",
};

function AttackBadge({ killer }: { killer: Killer }) {
	return (
		<span
			className={`inline-block rounded px-2 py-0.5 text-xs ${ATTACK_BADGE_STYLES[killer.attackCategory]}`}
			title={killer.attackDetail}
		>
			{killer.attackCategory}
		</span>
	);
}

function LullabyText({ killer }: { killer: Killer }) {
	return (
		<span>
			Lullaby {killer.lullabyRadius}m{killer.lullabyNotes && <span className="ml-0.5">({killer.lullabyNotes})</span>}
		</span>
	);
}

export function KillerRow({ killer, priority }: { killer: Killer; priority: boolean }) {
	return (
		<tr className="border-b border-border/50 transition-colors hover:bg-surface-light/50" id={killer.slug}>
			<td className="py-2 px-2">
				<CdnImage
					className="h-12 w-12 rounded bg-surface object-cover"
					path={killer.portraitPath}
					priority={priority}
				/>
			</td>
			<td className="py-2 px-2">
				<CharacterNameLink character={killer} />
			</td>
			<td className="py-2 px-2 tabular-nums">
				<span>{killer.speed} m/s</span>
				<span className="ml-1 text-xs text-text-muted">{speedPercentage(killer.speed)}%</span>
				{killer.speedNotes && <div className="text-[0.65rem] leading-tight text-text-muted">{killer.speedNotes}</div>}
			</td>
			<td className="py-2 px-2 tabular-nums">
				<div className="flex items-center gap-1.5">
					<TrPlayButton killer={killer} />
					<span>{killer.terrorRadius}m</span>
				</div>
				{killer.terrorRadiusNotes && (
					<div className="text-[0.65rem] leading-tight text-text-muted">{killer.terrorRadiusNotes}</div>
				)}
				{killer.lullabyRadius !== null && (
					<div className="text-[0.65rem] leading-tight text-text-muted">
						<LullabyText killer={killer} />
					</div>
				)}
			</td>
			<td className="py-2 px-2">
				<AttackBadge killer={killer} />
			</td>
			<td className="py-2 px-2 text-sm">{killer.height}</td>
			<td className="py-2 px-2 text-sm">{killer.origin}</td>
			<td className="py-2 px-2 text-sm tabular-nums">{formatReleaseDate(killer.releaseDate)}</td>
			<td className="py-2 px-2">
				<LicensedLabel licensed={killer.licensed} />
			</td>
			<td className="py-2 px-2">
				<ViewPerksLink role="killer" slug={killer.slug} />
			</td>
		</tr>
	);
}

export function KillerCard({ killer, priority }: { killer: Killer; priority: boolean }) {
	return (
		<div className="flex gap-3 rounded-lg border border-border bg-surface p-3" id={`card-${killer.slug}`}>
			<CdnImage
				className="size-16 shrink-0 rounded bg-surface-light object-cover"
				path={killer.portraitPath}
				priority={priority}
			/>
			<div className="min-w-0 flex-1">
				<CharacterNameLink character={killer} />
				<div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
					<span>
						{killer.speed} m/s
						{killer.speedNotes && <span className="ml-0.5 text-[0.65rem] text-text-muted">({killer.speedNotes})</span>}
					</span>
					<span className="inline-flex items-center gap-1">
						<TrPlayButton killer={killer} />
						TR {killer.terrorRadius}m
						{killer.terrorRadiusNotes && (
							<span className="ml-0.5 text-[0.65rem] text-text-muted">({killer.terrorRadiusNotes})</span>
						)}
						{killer.lullabyRadius !== null && (
							<span className="ml-0.5 text-[0.65rem] text-text-muted">
								(<LullabyText killer={killer} />)
							</span>
						)}
					</span>
					<AttackBadge killer={killer} />
					<span>{killer.height}</span>
					<LicensedBadge licensed={killer.licensed} />
				</div>
			</div>
			<ViewPerksLink className="shrink-0 self-start" role="killer" slug={killer.slug} />
		</div>
	);
}
