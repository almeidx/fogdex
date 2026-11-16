/** The two sides of a trial; each has a character page and a perk page. */
export const ROLES = ["killer", "survivor"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = { killer: "Killer", survivor: "Survivor" };
