import { useSyncExternalStore } from "react";
import { cdnUrl } from "../ui/cdn.ts";
import type { Killer } from "./schema.ts";

type TrTrack = Pick<Killer, "displayName" | "portraitPath" | "slug">;

interface TrAudioState {
	currentTime: number;
	duration: number;
	playing: boolean;
	/** The loaded killer, playing or paused; null when the player is closed. */
	track: TrTrack | null;
	volume: number;
}

const VOLUME_KEY = "fogdex.tr.volume";

const INITIAL_STATE: TrAudioState = { currentTime: 0, duration: 0, playing: false, track: null, volume: 0.25 };

let state = INITIAL_STATE;
let audio: HTMLAudioElement | null = null;
let storedVolumeLoaded = false;
const listeners = new Set<() => void>();

function update(patch: Partial<TrAudioState>) {
	state = { ...state, ...patch };
	for (const listener of listeners) listener();
}

// Storage access throws when the browser blocks site data.
function loadStoredVolume() {
	storedVolumeLoaded = true;
	try {
		const stored = localStorage.getItem(VOLUME_KEY);
		const volume = Number(stored);
		if (stored !== null && Number.isFinite(volume) && volume >= 0 && volume <= 1) {
			state = { ...state, volume };
		}
	} catch {}
}

function subscribe(listener: () => void) {
	if (!storedVolumeLoaded) loadStoredVolume();
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function stop() {
	if (audio) {
		audio.pause();
		audio.src = "";
		audio = null;
	}
	update({ currentTime: 0, duration: 0, playing: false, track: null });
}

function play(killer: Killer) {
	stop();
	const element = new Audio(cdnUrl(`/audio/tr/${killer.slug}.ogg`));
	element.volume = state.volume;
	audio = element;

	const ifCurrent = (handler: () => void) => () => {
		if (audio === element) handler();
	};
	const syncDuration = ifCurrent(() => update({ duration: Number.isFinite(element.duration) ? element.duration : 0 }));
	element.addEventListener(
		"play",
		ifCurrent(() => update({ playing: true })),
	);
	element.addEventListener(
		"pause",
		ifCurrent(() => update({ playing: false })),
	);
	element.addEventListener(
		"timeupdate",
		ifCurrent(() => update({ currentTime: element.currentTime })),
	);
	element.addEventListener("loadedmetadata", syncDuration);
	element.addEventListener("durationchange", syncDuration);
	element.addEventListener("ended", ifCurrent(stop));

	update({
		currentTime: 0,
		duration: 0,
		playing: false,
		track: { displayName: killer.displayName, portraitPath: killer.portraitPath, slug: killer.slug },
	});
	void element.play();
}

/** Plays the killer's terror radius, or closes the player if it is already loaded. */
export function toggleTrack(killer: Killer) {
	if (state.track?.slug === killer.slug) stop();
	else play(killer);
}

export function togglePlayback() {
	if (!audio) return;
	if (audio.paused) void audio.play();
	else audio.pause();
}

export function seek(time: number) {
	if (!audio) return;
	audio.currentTime = time;
	update({ currentTime: time });
}

export function setVolume(volume: number) {
	if (audio) audio.volume = volume;
	update({ volume });
	try {
		localStorage.setItem(VOLUME_KEY, String(volume));
	} catch {}
}

export function useTrAudio<T>(select: (state: TrAudioState) => T): T {
	return useSyncExternalStore(
		subscribe,
		() => select(state),
		() => select(INITIAL_STATE),
	);
}
