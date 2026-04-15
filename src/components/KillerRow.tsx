import { useEffect, useState } from "react";
import type { AttackCategory, Killer } from "../types/killer.ts";

const CDN_URL = import.meta.env.VITE_CDN_URL;

let currentAudio: HTMLAudioElement | null = null;

function stopAudio() {
	if (currentAudio) {
		currentAudio.pause();
		currentAudio.src = "";
		currentAudio = null;
	}
	document.dispatchEvent(new CustomEvent("tr-audio-change", { detail: null }));
}

function PlayButton({ killerId }: { killerId: string }) {
	const [playing, setPlaying] = useState(false);

	useEffect(() => {
		function handleChange(e: Event) {
			setPlaying((e as CustomEvent).detail === killerId);
		}
		document.addEventListener("tr-audio-change", handleChange);
		return () => document.removeEventListener("tr-audio-change", handleChange);
	}, [killerId]);

	const toggle = () => {
		if (playing) {
			stopAudio();
		} else {
			stopAudio();
			const audio = new Audio(`${CDN_URL}/audio/tr/${killerId}.ogg`);
			currentAudio = audio;
			audio.play();
			document.dispatchEvent(new CustomEvent("tr-audio-change", { detail: killerId }));
			audio.addEventListener("ended", () => {
				if (currentAudio === audio) stopAudio();
			});
		}
	};

	return (
		<button
			className={`flex size-6 items-center justify-center rounded-full border transition-colors ${
				playing
					? "border-accent bg-accent/20 text-accent"
					: "border-border bg-surface-light text-text-muted hover:border-accent/50 hover:text-accent"
			}`}
			onClick={toggle}
			title={playing ? "Stop terror radius" : "Play terror radius"}
			type="button"
		>
			{playing ? (
				<svg aria-hidden="true" className="size-2.5" fill="currentColor" viewBox="0 0 16 16">
					<rect height="12" width="3" x="3" y="2" />
					<rect height="12" width="3" x="10" y="2" />
				</svg>
			) : (
				<svg aria-hidden="true" className="size-2.5 ml-0.5" fill="currentColor" viewBox="0 0 16 16">
					<path d="M4 2l10 6-10 6V2z" />
				</svg>
			)}
		</button>
	);
}

function formatDate(iso: string): string {
	const date = new Date(`${iso}T00:00:00`);
	return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const ATTACK_BADGE_STYLES: Record<AttackCategory, string> = {
	Melee: "bg-gray-500/20 text-gray-300",
	Ranged: "bg-blue-500/20 text-blue-300",
};

function AttackBadge({ category, detail }: { category: AttackCategory; detail: string }) {
	return (
		<span className={`inline-block rounded px-2 py-0.5 text-xs ${ATTACK_BADGE_STYLES[category] ?? ""}`} title={detail}>
			{category}
		</span>
	);
}

export function KillerRow({ killer, priority }: { killer: Killer; priority: boolean }) {
	return (
		<tr className="border-b border-border/50 transition-colors hover:bg-surface-light/50">
			<td className="py-2 px-2">
				<img
					alt=""
					className="h-12 w-12 rounded bg-surface object-cover"
					fetchPriority={priority ? "high" : "auto"}
					loading={priority ? "eager" : "lazy"}
					src={`${CDN_URL}${killer.portraitPath}`}
				/>
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
					<div className="text-[0.65rem] leading-tight text-text-muted/70">{killer.speedNotes}</div>
				)}
			</td>
			<td className="py-2 px-2 tabular-nums">
				<div className="flex items-center gap-1.5">
					<PlayButton killerId={killer.id} />
					<span>{killer.terrorRadius}m</span>
				</div>
				{killer.terrorRadiusNotes && (
					<div className="text-[0.65rem] leading-tight text-text-muted/70">{killer.terrorRadiusNotes}</div>
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
			<td className="py-2 px-2">
				<a
					className="flex size-7 items-center justify-center rounded border border-border bg-surface-light text-text-muted hover:border-accent/50 hover:text-accent transition-colors"
					href={`/perks/killer?owner=${killer.id}`}
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

export function KillerCard({ killer, priority }: { killer: Killer; priority: boolean }) {
	return (
		<div className="flex gap-3 rounded-lg border border-border bg-surface p-3">
			<img
				alt=""
				className="size-16 shrink-0 rounded bg-surface-light object-cover"
				fetchPriority={priority ? "high" : "auto"}
				loading={priority ? "eager" : "lazy"}
				src={`${CDN_URL}${killer.portraitPath}`}
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
							<span className="ml-0.5 text-[0.6rem] text-text-muted/70">({killer.speedNotes})</span>
						)}
					</span>
					<span className="inline-flex items-center gap-1">
						<PlayButton killerId={killer.id} />
						TR {killer.terrorRadius}m
						{killer.terrorRadiusNotes && (
							<span className="ml-0.5 text-[0.6rem] text-text-muted/70">({killer.terrorRadiusNotes})</span>
						)}
					</span>
					<AttackBadge category={killer.attackCategory} detail={killer.attackDetail} />
					<span>{killer.height}</span>
					{killer.licensed && <span className="text-accent">Licensed</span>}
				</div>
			</div>
			<a
				className="flex size-7 shrink-0 items-center justify-center rounded border border-border bg-surface-light text-text-muted hover:border-accent/50 hover:text-accent transition-colors self-start"
				href={`/perks/killer?owner=${killer.id}`}
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
	);
}
