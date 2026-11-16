import { useCallback } from "react";

/** Ref callback that mirrors the element's height into a CSS variable on the document root. */
export function useElementHeightVar(name: string): (element: HTMLElement | null) => (() => void) | undefined {
	return useCallback(
		(element: HTMLElement | null) => {
			if (!element) return;
			const rootStyle = document.documentElement.style;
			const observer = new ResizeObserver(() => rootStyle.setProperty(name, `${element.offsetHeight}px`));
			observer.observe(element);
			return () => {
				observer.disconnect();
				rootStyle.removeProperty(name);
			};
		},
		[name],
	);
}
