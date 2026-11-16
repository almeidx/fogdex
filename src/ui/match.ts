export function matchesSearch(query: string, fields: readonly (string | null)[]): boolean {
	if (!query) return true;
	const q = query.toLowerCase();
	return fields.some((field) => field?.toLowerCase().includes(q));
}

export function matchesSelection<V>(selected: readonly V[], value: V): boolean {
	return selected.length === 0 || selected.includes(value);
}

export function inRange(value: number, min: number | null, max: number | null): boolean {
	return (min === null || value >= min) && (max === null || value <= max);
}
