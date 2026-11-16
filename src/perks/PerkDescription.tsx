import { formatTierValue, splitDescription } from "./description.ts";
import type { Perk, StatusEffects } from "./schema.ts";
import { StatusEffectTooltip } from "./StatusEffectTooltip.tsx";

function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function TextWithStatusEffects({ statusEffects, text }: { statusEffects: StatusEffects; text: string }) {
	const names = Object.keys(statusEffects);
	if (names.length === 0) return text;

	const pattern = new RegExp(`\\b(${names.map(escapeRegExp).join("|")})\\b`);
	return text
		.split(pattern)
		.map((part, i) =>
			i % 2 === 1 ? <StatusEffectTooltip description={statusEffects[part]} key={i} name={part} /> : part,
		);
}

export function PerkDescription({ perk, statusEffects }: { perk: Perk; statusEffects: StatusEffects }) {
	return (
		<p className="text-sm leading-relaxed text-text/80">
			{splitDescription(perk.description).map((part, i) =>
				"placeholder" in part ? (
					<span className="font-semibold text-accent-text" key={i}>
						{formatTierValue(perk.tierValues, part.placeholder)}
					</span>
				) : (
					<TextWithStatusEffects key={i} statusEffects={statusEffects} text={part.text} />
				),
			)}
		</p>
	);
}
