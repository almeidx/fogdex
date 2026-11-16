export const GENDERS = ["Male", "Female", "Other"] as const;

export function formatReleaseDate(iso: string): string {
	return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
