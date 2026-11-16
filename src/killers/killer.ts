export const ATTACK_CATEGORIES = ["Melee", "Ranged"] as const;
export type AttackCategory = (typeof ATTACK_CATEGORIES)[number];

/** Shortest to tallest. */
export const HEIGHTS = ["Short", "Average", "Tall"] as const;

/** Killer speeds are shown as a percentage of this, in m/s. */
export const SURVIVOR_RUN_SPEED = 4;

export function speedPercentage(speed: number): number {
	return Number(((speed / SURVIVOR_RUN_SPEED) * 100).toFixed(2));
}
