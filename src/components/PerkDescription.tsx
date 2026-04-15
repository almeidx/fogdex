import { useMemo } from "react";
import { STATUS_EFFECTS } from "../data/status-effects.ts";
import type { Perk } from "../types/perk.ts";
import { StatusEffectTooltip } from "./StatusEffectTooltip.tsx";

function resolveTierValue(tierValues: Perk["tierValues"], name: string): string {
	const v1 = tierValues[0][name];
	const v2 = tierValues[1][name];
	const v3 = tierValues[2][name];
	if (v1 === v2 && v2 === v3) return String(v1 ?? name);
	return `${v1}/${v2}/${v3}`;
}

function resolveDescription(description: string, tierValues: Perk["tierValues"]): string {
	return description.replace(/\{(\w+)\}/g, (_, name: string) => resolveTierValue(tierValues, name));
}

function collectTierPatterns(tierValues: Perk["tierValues"]): Set<string> {
	const patterns = new Set<string>();
	for (const key of Object.keys(tierValues[0])) {
		const v1 = tierValues[0][key];
		const v2 = tierValues[1][key];
		const v3 = tierValues[2][key];
		patterns.add(v1 === v2 && v2 === v3 ? String(v1) : `${v1}/${v2}/${v3}`);
	}
	return patterns;
}

// Splits text into segments, tagging each as plain text, a tier value, or a status effect.
// Returns a flat array that can be mapped to JSX without needing keys.
type Segment = { type: "text" | "tier" | "status"; value: string; offset: number };

function segmentDescription(text: string, tierPatterns: Set<string>): Segment[] {
	// First pass: split on tier value patterns
	const tierSegments: Segment[] = [];

	if (tierPatterns.size > 0) {
		const escaped = [...tierPatterns].map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
		const pattern = new RegExp(`(${escaped.join("|")})`, "g");
		let offset = 0;
		for (const part of text.split(pattern)) {
			if (part) tierSegments.push({ offset, type: tierPatterns.has(part) ? "tier" : "text", value: part });
			offset += part.length;
		}
	} else {
		tierSegments.push({ offset: 0, type: "text", value: text });
	}

	// Second pass: split text segments on status effect names
	const statusNames = Object.keys(STATUS_EFFECTS);
	if (statusNames.length === 0) return tierSegments;

	const statusPattern = new RegExp(
		`\\b(${statusNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
		"g",
	);

	const result: Segment[] = [];
	for (const seg of tierSegments) {
		if (seg.type !== "text") {
			result.push(seg);
			continue;
		}

		let lastIndex = 0;
		for (const match of seg.value.matchAll(statusPattern)) {
			if (match.index > lastIndex) {
				result.push({ offset: seg.offset + lastIndex, type: "text", value: seg.value.slice(lastIndex, match.index) });
			}
			result.push({ offset: seg.offset + match.index, type: "status", value: match[1] });
			lastIndex = match.index + match[0].length;
		}
		if (lastIndex < seg.value.length) {
			result.push({ offset: seg.offset + lastIndex, type: "text", value: seg.value.slice(lastIndex) });
		}
	}

	return result;
}

export function PerkDescription({ description, tierValues }: { description: string; tierValues: Perk["tierValues"] }) {
	const segments = useMemo(() => {
		const resolved = resolveDescription(description, tierValues);
		return segmentDescription(resolved, collectTierPatterns(tierValues));
	}, [description, tierValues]);

	return (
		<p className="text-sm leading-relaxed text-text/80">
			{segments.map((seg) => {
				switch (seg.type) {
					case "tier":
						return (
							<span className="font-semibold text-accent" key={seg.offset}>
								{seg.value}
							</span>
						);
					case "status":
						return <StatusEffectTooltip key={seg.offset} name={seg.value} />;
					default:
						return seg.value;
				}
			})}
		</p>
	);
}
