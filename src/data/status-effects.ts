export const STATUS_EFFECTS: Record<string, string> = {
	Blindness: "Unable to see the Auras of any Props, unless an extenuating circumstance applies.",
	Broken: "Unable to be healed past the Injured State.",
	Cursed: "Afflicted by a Hex Perk's secondary effects.",
	"Deep Wound": "Requires mending. If the Deep Wound timer runs out, the Survivor enters the Dying State.",
	Endurance: "Grants the ability to take a hit that would put you into the Dying State without going down.",
	Exhausted: "Prevents the use of other Perks that cause the Exhausted Status Effect.",
	Exposed: "Survivors can be downed in one hit from a basic attack, regardless of their Health State.",
	Glyph: "A Glyph has spawned in the Trial that can be interacted with.",
	Haemorrhage:
		"Increases the rate at which blood pools are created and moderately regresses healing progress when not being healed.",
	Haste: "Grants a percentage-based increase to Movement Speed.",
	Hindered: "Applies a percentage-based decrease to Movement Speed.",
	Incapacitated:
		"Unable to perform any interactions, including self-healing, repairing, cleansing, and other interactions.",
	Mangled: "Increases the time required to heal by a percentage.",
	Oblivious:
		"Unable to hear the Killer's Terror Radius and is not affected by abilities that require being inside the Terror Radius.",
	Undetectable:
		"The Killer's Terror Radius is suppressed and their Red Stain is hidden. They are also immune to Aura-reading abilities.",
};

export const STATUS_EFFECT_NAMES = Object.keys(STATUS_EFFECTS);
