import type { Perk } from "../types/perk.ts";
import { PerkDescription } from "./PerkDescription.tsx";

const CDN_URL = import.meta.env.VITE_CDN_URL;

function ownerPageUrl(perk: Perk): string | null {
	if (!perk.owner) return null;
	if (perk.role === "killer") return `/?q=${perk.owner}`;
	return `/survivors?q=${perk.owner}`;
}

function ownerPortraitPath(perk: Perk): string | null {
	if (!perk.owner) return null;
	if (perk.role === "killer") return `/images/killers/${perk.owner}.webp`;
	return `/images/survivors/${perk.owner}.webp`;
}

export function PerkCard({ perk, priority }: { perk: Perk; priority: boolean }) {
	const ownerUrl = ownerPageUrl(perk);
	const portraitSrc = ownerPortraitPath(perk);

	return (
		<div className="flex flex-col rounded-lg border border-border bg-surface p-4">
			<div className="flex items-start gap-3">
				<img
					alt=""
					className="size-12 shrink-0 rounded bg-surface-light object-cover"
					fetchPriority={priority ? "high" : "auto"}
					loading={priority ? "eager" : "lazy"}
					src={`${CDN_URL}${perk.iconPath}`}
				/>
				<div className="min-w-0 flex-1">
					<a className="group" href={perk.wikiUrl} rel="noopener noreferrer" target="_blank">
						<h3 className="font-medium text-text group-hover:text-accent transition-colors">{perk.name}</h3>
						{perk.aliases.length > 0 && (
							<p className="text-[0.65rem] text-text-muted/70">aka {perk.aliases.join(", ")}</p>
						)}
					</a>
					{perk.ownerName ? (
						<div className="mt-0.5 flex items-center gap-1.5">
							{portraitSrc && (
								<img
									alt=""
									className="size-5 rounded-full bg-surface-light object-cover"
									loading="lazy"
									src={`${CDN_URL}${portraitSrc}`}
								/>
							)}
							{ownerUrl ? (
								<a className="text-xs text-text-muted hover:text-accent transition-colors" href={ownerUrl}>
									{perk.ownerName}
								</a>
							) : (
								<span className="text-xs text-text-muted">{perk.ownerName}</span>
							)}
						</div>
					) : (
						<span className="mt-0.5 text-xs text-text-muted/70">Universal</span>
					)}
				</div>
			</div>

			<div className="mt-3">
				<PerkDescription description={perk.description} tierValues={perk.tierValues} />
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
