import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * True once the component has hydrated; false during SSR and the hydration
 * render. Keeps server HTML stable while client-only values (URL state) settle.
 */
export function useHydrated(): boolean {
	return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
