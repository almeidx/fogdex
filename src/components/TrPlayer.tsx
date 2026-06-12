import { useEffect, useRef, useState } from "react";
import type { TrAudioPayload } from "./KillerRow.tsx";

const CDN_URL = import.meta.env.VITE_CDN_URL;
const VOLUME_KEY = "fogdex.tr.volume";
const DEFAULT_VOLUME = 0.25;

function readStoredVolume(): number {
	try {
		const stored = localStorage.getItem(VOLUME_KEY);
		if (stored === null) return DEFAULT_VOLUME;
		const n = Number(stored);
		return Number.isFinite(n) && n >= 0 && n <= 1 ? n : DEFAULT_VOLUME;
	} catch {
		return DEFAULT_VOLUME;
	}
}

function formatTime(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TrPlayer() {
	const [payload, setPayload] = useState<TrAudioPayload | null>(null);
	const [playing, setPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(DEFAULT_VOLUME);
	const playerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const v = readStoredVolume();
		setVolume(v);
		document.dispatchEvent(new CustomEvent("tr-volume-change", { detail: v }));

		function handleAudio(e: Event) {
			setPayload((e as CustomEvent<TrAudioPayload | null>).detail);
		}
		document.addEventListener("tr-audio-change", handleAudio);
		return () => document.removeEventListener("tr-audio-change", handleAudio);
	}, []);

	useEffect(() => {
		if (!payload) {
			setPlaying(false);
			setCurrentTime(0);
			setDuration(0);
			return;
		}
		const { audio } = payload;
		setPlaying(!audio.paused);
		setCurrentTime(audio.currentTime);
		setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);

		const onPlay = () => setPlaying(true);
		const onPause = () => setPlaying(false);
		const onTime = () => setCurrentTime(audio.currentTime);
		const onDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);

		audio.addEventListener("play", onPlay);
		audio.addEventListener("pause", onPause);
		audio.addEventListener("timeupdate", onTime);
		audio.addEventListener("loadedmetadata", onDuration);
		audio.addEventListener("durationchange", onDuration);

		return () => {
			audio.removeEventListener("play", onPlay);
			audio.removeEventListener("pause", onPause);
			audio.removeEventListener("timeupdate", onTime);
			audio.removeEventListener("loadedmetadata", onDuration);
			audio.removeEventListener("durationchange", onDuration);
		};
	}, [payload]);

	useEffect(() => {
		if (!payload) {
			document.documentElement.style.setProperty("--tr-player-h", "0px");
			return;
		}
		const el = playerRef.current;
		if (!el) return;
		const observer = new ResizeObserver(() => {
			document.documentElement.style.setProperty("--tr-player-h", `${el.offsetHeight}px`);
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, [payload]);

	if (!payload) return null;

	const handlePlayPause = () => {
		if (playing) payload.audio.pause();
		else payload.audio.play();
	};

	const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
		const t = Number(e.target.value);
		payload.audio.currentTime = t;
		setCurrentTime(t);
	};

	const handleClose = () => {
		document.dispatchEvent(new CustomEvent("tr-audio-stop"));
	};

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const v = Number(e.target.value);
		setVolume(v);
		try {
			localStorage.setItem(VOLUME_KEY, String(v));
		} catch {}
		document.dispatchEvent(new CustomEvent("tr-volume-change", { detail: v }));
	};

	const muted = volume === 0;
	const pct = Math.round(volume * 100);
	const seekMax = duration || 0;

	return (
		<div
			className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 shadow-lg shadow-black/40 backdrop-blur-md"
			ref={playerRef}
		>
			<div className="mx-auto flex max-w-350 items-center gap-3 px-3 py-2 sm:gap-4 sm:px-4 sm:py-3">
				<img
					alt=""
					className="size-10 shrink-0 rounded bg-surface-light object-cover sm:size-12"
					height={256}
					src={`${CDN_URL}${payload.portraitPath}`}
					width={256}
				/>

				<div className="hidden min-w-0 flex-col sm:flex sm:w-40 sm:shrink-0">
					<div className="truncate text-sm font-medium text-text">{payload.displayName}</div>
					<div className="text-xs text-text-muted">Terror Radius</div>
				</div>

				<div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
					<button
						aria-label={playing ? "Pause" : "Play"}
						className="flex size-8 touch-target shrink-0 items-center justify-center rounded-full border border-border bg-surface-light text-text-muted transition-colors hover:border-accent/50 hover:text-accent-text"
						onClick={handlePlayPause}
						title={playing ? "Pause" : "Play"}
						type="button"
					>
						{playing ? (
							<svg aria-hidden="true" className="size-3" fill="currentColor" viewBox="0 0 16 16">
								<rect height="12" width="3" x="3" y="2" />
								<rect height="12" width="3" x="10" y="2" />
							</svg>
						) : (
							<svg aria-hidden="true" className="ml-0.5 size-3" fill="currentColor" viewBox="0 0 16 16">
								<path d="M4 2l10 6-10 6V2z" />
							</svg>
						)}
					</button>

					<div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:hidden">
						<div className="truncate text-xs font-medium text-text">{payload.displayName}</div>
						<input
							aria-label="Seek"
							className="w-full accent-accent"
							disabled={!duration}
							max={seekMax}
							min={0}
							onChange={handleSeek}
							step={0.1}
							type="range"
							value={Math.min(currentTime, seekMax)}
						/>
					</div>

					<span className="hidden w-10 shrink-0 text-right text-xs tabular-nums text-text-muted sm:inline">
						{formatTime(currentTime)}
					</span>
					<input
						aria-label="Seek"
						className="hidden min-w-0 flex-1 accent-accent sm:block"
						disabled={!duration}
						max={seekMax}
						min={0}
						onChange={handleSeek}
						step={0.1}
						type="range"
						value={Math.min(currentTime, seekMax)}
					/>
					<span className="hidden w-10 shrink-0 text-xs tabular-nums text-text-muted sm:inline">
						{formatTime(duration)}
					</span>
				</div>

				<div className="hidden items-center gap-2 sm:flex">
					<svg aria-hidden="true" className="size-4 shrink-0 text-text-muted" fill="currentColor" viewBox="0 0 20 20">
						<path d="M9.383 3.076A1 1 0 0 1 10 4v12a1 1 0 0 1-1.707.707L4.586 13H2.5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h2.086l3.707-3.707a1 1 0 0 1 1.09-.217z" />
						{muted ? (
							<path d="M13.293 7.293a1 1 0 0 1 1.414 0L16 8.586l1.293-1.293a1 1 0 1 1 1.414 1.414L17.414 10l1.293 1.293a1 1 0 0 1-1.414 1.414L16 11.414l-1.293 1.293a1 1 0 0 1-1.414-1.414L14.586 10l-1.293-1.293a1 1 0 0 1 0-1.414z" />
						) : (
							<>
								{volume > 0 && (
									<path d="M12.828 6.172a1 1 0 0 1 1.414 0 5 5 0 0 1 0 7.656 1 1 0 1 1-1.414-1.414 3 3 0 0 0 0-4.828 1 1 0 0 1 0-1.414z" />
								)}
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
						onChange={handleVolumeChange}
						step={0.05}
						title={`Volume: ${pct}%`}
						type="range"
						value={volume}
					/>
				</div>

				<button
					aria-label="Close player"
					className="flex size-7 touch-target shrink-0 items-center justify-center rounded text-text-muted transition-colors hover:bg-surface-light hover:text-text"
					onClick={handleClose}
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
