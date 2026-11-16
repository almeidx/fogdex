import { CdnImage } from "../ui/CdnImage.tsx";
import { BOTTOM_BAR_HEIGHT_VAR } from "../ui/layoutVars.ts";
import { useElementHeightVar } from "../ui/useElementHeightVar.ts";
import type { Killer } from "./schema.ts";
import { seek, setVolume, stop, togglePlayback, toggleTrack, useTrAudio } from "./trAudio.ts";

function PlayPauseIcon({ className, playing }: { className: string; playing: boolean }) {
	return playing ? (
		<svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 16 16">
			<rect height="12" width="3" x="3" y="2" />
			<rect height="12" width="3" x="10" y="2" />
		</svg>
	) : (
		<svg aria-hidden="true" className={`ml-0.5 ${className}`} fill="currentColor" viewBox="0 0 16 16">
			<path d="M4 2l10 6-10 6V2z" />
		</svg>
	);
}

export function TrPlayButton({ killer }: { killer: Killer }) {
	const loaded = useTrAudio((state) => state.track?.slug === killer.slug);

	return (
		<button
			className={`flex size-6 touch-target items-center justify-center rounded-full border transition-colors ${
				loaded
					? "border-accent bg-accent/20 text-accent-text"
					: "border-border bg-surface-light text-text-muted hover:border-accent/50 hover:text-accent-text"
			}`}
			onClick={() => toggleTrack(killer)}
			title={loaded ? "Stop terror radius" : "Play terror radius"}
			type="button"
		>
			<PlayPauseIcon className="size-2.5" playing={loaded} />
		</button>
	);
}

function formatTime(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${s.toString().padStart(2, "0")}`;
}

function SeekBar({ className, currentTime, duration }: { className: string; currentTime: number; duration: number }) {
	return (
		<input
			aria-label="Seek"
			className={`accent-accent ${className}`}
			disabled={!duration}
			max={duration}
			min={0}
			onChange={(e) => seek(Number(e.target.value))}
			step={0.1}
			type="range"
			value={Math.min(currentTime, duration)}
		/>
	);
}

/** Fixed bottom player for the loaded terror radius track; hidden when nothing is loaded. */
export function TrPlayer() {
	const { currentTime, duration, playing, track, volume } = useTrAudio((state) => state);
	const measureRef = useElementHeightVar(BOTTOM_BAR_HEIGHT_VAR);

	if (!track) return null;

	return (
		<div
			className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 shadow-lg shadow-black/40 backdrop-blur-md"
			ref={measureRef}
		>
			<div className="mx-auto flex max-w-350 items-center gap-3 px-3 py-2 sm:gap-4 sm:px-4 sm:py-3">
				<CdnImage
					className="size-10 shrink-0 rounded bg-surface-light object-cover sm:size-12"
					path={track.portraitPath}
				/>

				<div className="hidden min-w-0 flex-col sm:flex sm:w-40 sm:shrink-0">
					<div className="truncate text-sm font-medium text-text">{track.displayName}</div>
					<div className="text-xs text-text-muted">Terror Radius</div>
				</div>

				<div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
					<button
						aria-label={playing ? "Pause" : "Play"}
						className="flex size-8 touch-target shrink-0 items-center justify-center rounded-full border border-border bg-surface-light text-text-muted transition-colors hover:border-accent/50 hover:text-accent-text"
						onClick={togglePlayback}
						title={playing ? "Pause" : "Play"}
						type="button"
					>
						<PlayPauseIcon className="size-3" playing={playing} />
					</button>

					<div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:hidden">
						<div className="truncate text-xs font-medium text-text">{track.displayName}</div>
						<SeekBar className="w-full" currentTime={currentTime} duration={duration} />
					</div>

					<span className="hidden w-10 shrink-0 text-right text-xs tabular-nums text-text-muted sm:inline">
						{formatTime(currentTime)}
					</span>
					<SeekBar className="hidden min-w-0 flex-1 sm:block" currentTime={currentTime} duration={duration} />
					<span className="hidden w-10 shrink-0 text-xs tabular-nums text-text-muted sm:inline">
						{formatTime(duration)}
					</span>
				</div>

				<div className="hidden items-center gap-2 sm:flex">
					<svg aria-hidden="true" className="size-4 shrink-0 text-text-muted" fill="currentColor" viewBox="0 0 20 20">
						<path d="M9.383 3.076A1 1 0 0 1 10 4v12a1 1 0 0 1-1.707.707L4.586 13H2.5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h2.086l3.707-3.707a1 1 0 0 1 1.09-.217z" />
						{volume === 0 ? (
							<path d="M13.293 7.293a1 1 0 0 1 1.414 0L16 8.586l1.293-1.293a1 1 0 1 1 1.414 1.414L17.414 10l1.293 1.293a1 1 0 0 1-1.414 1.414L16 11.414l-1.293 1.293a1 1 0 0 1-1.414-1.414L14.586 10l-1.293-1.293a1 1 0 0 1 0-1.414z" />
						) : (
							<>
								<path d="M12.828 6.172a1 1 0 0 1 1.414 0 5 5 0 0 1 0 7.656 1 1 0 1 1-1.414-1.414 3 3 0 0 0 0-4.828 1 1 0 0 1 0-1.414z" />
								{volume > 0.5 && (
									<path d="M15.657 3.343a1 1 0 0 1 1.414 0 9 9 0 0 1 0 13.314 1 1 0 1 1-1.414-1.414 7 7 0 0 0 0-10.486 1 1 0 0 1 0-1.414z" />
								)}
							</>
						)}
					</svg>
					<input
						aria-label="Volume"
						className="w-24 accent-accent"
						max={1}
						min={0}
						onChange={(e) => setVolume(Number(e.target.value))}
						step={0.05}
						title={`Volume: ${Math.round(volume * 100)}%`}
						type="range"
						value={volume}
					/>
				</div>

				<button
					aria-label="Close player"
					className="flex size-7 touch-target shrink-0 items-center justify-center rounded text-text-muted transition-colors hover:bg-surface-light hover:text-text"
					onClick={stop}
					title="Close"
					type="button"
				>
					<svg
						aria-hidden="true"
						className="size-4"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						viewBox="0 0 24 24"
					>
						<path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
					</svg>
				</button>
			</div>
		</div>
	);
}
