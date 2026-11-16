import { ROLE_LABELS, ROLES, type Role } from "./roles.ts";

export const WIKI_URL = "https://deadbydaylight.wiki.gg";
export const REPO_URL = "https://github.com/almeidx/fogdex";

const CHARACTERS_PATHS: Record<Role, string> = { killer: "/", survivor: "/survivors" };

export function charactersPath(role: Role): string {
	return CHARACTERS_PATHS[role];
}

export const DISCLAIMER_PATH = "/disclaimer";

export function perksPath(role: Role): string {
	return `/perks/${role}`;
}

export const NAV_LINKS: { href: string; label: string }[] = [
	{ href: charactersPath("killer"), label: "Killers" },
	{ href: charactersPath("survivor"), label: "Survivors" },
	...ROLES.map((role) => ({ href: perksPath(role), label: `${ROLE_LABELS[role]} Perks` })),
];
