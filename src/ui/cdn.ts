/** Image and audio paths in the data are relative to the public asset CDN. */
export function cdnUrl(path: string): string {
	return `${import.meta.env.VITE_CDN_URL}${path}`;
}
