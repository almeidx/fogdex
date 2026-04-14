import type { Killer } from "../types/killer.ts";

function formatDate(iso: string): string {
	const date = new Date(`${iso}T00:00:00`);
	return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const ATTACK_BADGE_STYLES: Record<string, string> = {
	Hybrid: "bg-purple-500/20 text-purple-300",
	Melee: "bg-gray-500/20 text-gray-300",
	Ranged: "bg-blue-500/20 text-blue-300",
};

function AttackBadge({ category, detail }: { category: string; detail: string }) {
	return (
		<span className={`inline-block rounded px-2 py-0.5 text-xs ${ATTACK_BADGE_STYLES[category] ?? ""}`} title={detail}>
			{category}
		</span>
	);
}

export function KillerRow({ killer }: { killer: Killer }) {
	return (
		<tr className="border-b border-border/50 transition-colors hover:bg-surface-light/50">
			<td className="py-2 px-2">
				<img alt="" className="h-12 w-12 rounded bg-surface object-cover" loading="lazy" src={killer.portraitPath} />
			</td>
			<td className="py-2 px-2">
				<a className="group" href={killer.wikiUrl} rel="noopener noreferrer" target="_blank">
					<div className="font-medium text-text group-hover:text-accent transition-colors">{killer.displayName}</div>
					{killer.realName && <div className="text-xs text-text-muted">{killer.realName}</div>}
				</a>
			</td>
			<td className="py-2 px-2 tabular-nums">
				<span>{killer.speed.base} m/s</span>
				<span className="ml-1 text-xs text-text-muted">{killer.speed.percentage}%</span>
				{killer.speedNotes && (
					<span className="ml-1 cursor-help text-xs text-gold" title={killer.speedNotes}>
						*
					</span>
				)}
			</td>
			<td className="py-2 px-2 tabular-nums">
				{killer.terrorRadius}m
				{killer.terrorRadiusNotes && (
					<span className="ml-1 cursor-help text-xs text-gold" title={killer.terrorRadiusNotes}>
						*
					</span>
				)}
			</td>
			<td className="py-2 px-2">
				<AttackBadge category={killer.attackCategory} detail={killer.attackDetail} />
			</td>
			<td className="py-2 px-2 text-sm">{killer.height}</td>
			<td className="py-2 px-2 text-sm">{killer.origin}</td>
			<td className="py-2 px-2 text-sm tabular-nums">{formatDate(killer.releaseDate)}</td>
			<td className="py-2 px-2">
				{killer.licensed ? (
					<span className="text-xs font-medium text-accent">Licensed</span>
				) : (
					<span className="text-xs text-text-muted">Original</span>
				)}
			</td>
		</tr>
	);
}

export function KillerCard({ killer }: { killer: Killer }) {
	return (
		<div className="flex gap-3 rounded-lg border border-border bg-surface p-3">
			<img
				alt=""
				className="size-16 shrink-0 rounded bg-surface-light object-cover"
				loading="lazy"
				src={killer.portraitPath}
			/>
			<div className="min-w-0 flex-1">
				<a className="group" href={killer.wikiUrl} rel="noopener noreferrer" target="_blank">
					<div className="font-medium text-text group-hover:text-accent transition-colors">{killer.displayName}</div>
					{killer.realName && <div className="text-xs text-text-muted">{killer.realName}</div>}
				</a>
				<div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
					<span>
						{killer.speed.base} m/s
						{killer.speedNotes && (
							<span className="ml-0.5 text-gold" title={killer.speedNotes}>
								*
							</span>
						)}
					</span>
					<span>
						TR {killer.terrorRadius}m
						{killer.terrorRadiusNotes && (
							<span className="ml-0.5 text-gold" title={killer.terrorRadiusNotes}>
								*
							</span>
						)}
					</span>
					<AttackBadge category={killer.attackCategory} detail={killer.attackDetail} />
					<span>{killer.height}</span>
					{killer.licensed && <span className="text-accent">Licensed</span>}
				</div>
			</div>
		</div>
	);
}
