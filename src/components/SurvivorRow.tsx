import type { Survivor } from "../types/survivor.ts";

const CDN_URL = import.meta.env.VITE_CDN_URL;

function formatDate(iso: string): string {
	const date = new Date(`${iso}T00:00:00`);
	return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function SurvivorRow({ survivor, priority }: { survivor: Survivor; priority: boolean }) {
	return (
		<tr className="border-b border-border/50 transition-colors hover:bg-surface-light/50" id={survivor.id}>
			<td className="py-2 px-2">
				<img
					alt=""
					className="h-12 w-12 rounded bg-surface object-cover"
					fetchPriority={priority ? "high" : "auto"}
					loading={priority ? "eager" : "lazy"}
					src={`${CDN_URL}${survivor.portraitPath}`}
				/>
			</td>
			<td className="py-2 px-2">
				<a className="group" href={survivor.wikiUrl} rel="noopener noreferrer" target="_blank">
					<div className="font-medium text-text group-hover:text-accent transition-colors">{survivor.displayName}</div>
					{survivor.realName && <div className="text-xs text-text-muted">{survivor.realName}</div>}
				</a>
			</td>
			<td className="py-2 px-2 text-sm">{survivor.gender}</td>
			<td className="py-2 px-2 text-sm">{survivor.origin}</td>
			<td className="py-2 px-2 text-sm">{survivor.chapter}</td>
			<td className="py-2 px-2 text-sm tabular-nums">{formatDate(survivor.releaseDate)}</td>
			<td className="py-2 px-2">
				{survivor.licensed ? (
					<span className="text-xs font-medium text-accent">Licensed</span>
				) : (
					<span className="text-xs text-text-muted">Original</span>
				)}
			</td>
			<td className="py-2 px-2">
				<a
					className="flex size-7 items-center justify-center rounded border border-border bg-surface-light text-text-muted hover:border-accent/50 hover:text-accent transition-colors"
					href={`/perks/survivor?owner=${survivor.id}`}
					title="View perks"
				>
					<span className="sr-only">View perks</span>
					<svg
						aria-hidden="true"
						className="size-3.5"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						viewBox="0 0 24 24"
					>
						<path
							d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</a>
			</td>
		</tr>
	);
}

export function SurvivorCard({ survivor, priority }: { survivor: Survivor; priority: boolean }) {
	return (
		<div className="flex gap-3 rounded-lg border border-border bg-surface p-3" id={`card-${survivor.id}`}>
			<img
				alt=""
				className="size-16 shrink-0 rounded bg-surface-light object-cover"
				fetchPriority={priority ? "high" : "auto"}
				loading={priority ? "eager" : "lazy"}
				src={`${CDN_URL}${survivor.portraitPath}`}
			/>
			<div className="min-w-0 flex-1">
				<div className="flex items-start justify-between gap-2">
					<a className="group" href={survivor.wikiUrl} rel="noopener noreferrer" target="_blank">
						<div className="font-medium text-text group-hover:text-accent transition-colors">
							{survivor.displayName}
						</div>
						{survivor.realName && <div className="text-xs text-text-muted">{survivor.realName}</div>}
					</a>
					<a
						className="flex size-7 shrink-0 items-center justify-center rounded border border-border bg-surface-light text-text-muted hover:border-accent/50 hover:text-accent transition-colors"
						href={`/perks/survivor?owner=${survivor.id}`}
						title="View perks"
					>
						<span className="sr-only">View perks</span>
						<svg
							aria-hidden="true"
							className="size-3.5"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<path
								d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</a>
				</div>
				<div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
					<span>{survivor.origin}</span>
					<span>{survivor.chapter}</span>
					{survivor.licensed && <span className="text-accent">Licensed</span>}
				</div>
			</div>
		</div>
	);
}
