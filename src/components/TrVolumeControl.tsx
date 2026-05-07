import { useEffect, useState } from "react";

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

export function TrVolumeControl() {
	const [volume, setVolume] = useState(DEFAULT_VOLUME);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const v = readStoredVolume();
		setVolume(v);
		document.dispatchEvent(new CustomEvent("tr-volume-change", { detail: v }));

		function handleAudio(e: Event) {
			if ((e as CustomEvent).detail !== null) setVisible(true);
		}
		document.addEventListener("tr-audio-change", handleAudio);
		return () => document.removeEventListener("tr-audio-change", handleAudio);
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const v = Number(e.target.value);
		setVolume(v);
		try {
			localStorage.setItem(VOLUME_KEY, String(v));
		} catch {}
		document.dispatchEvent(new CustomEvent("tr-volume-change", { detail: v }));
	};

	if (!visible) return null;

	const muted = volume === 0;
	const pct = Math.round(volume * 100);

	return (
		<div className="fixed bottom-4 right-4 z-30 flex items-center gap-2 rounded-full border border-border bg-surface/90 px-3 py-2 shadow-lg shadow-black/40 backdrop-blur-sm">
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
				aria-label="Terror radius volume"
				className="w-28 accent-accent"
				max={1}
				min={0}
				onChange={handleChange}
				step={0.05}
				title={`Terror radius volume: ${pct}%`}
				type="range"
				value={volume}
			/>
			<span className="w-8 text-xs text-text-muted tabular-nums">{pct}%</span>
		</div>
	);
}
