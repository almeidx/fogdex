import { STATUS_EFFECTS } from "../data/status-effects.ts";

export function StatusEffectTooltip({ name }: { name: string }) {
	const description = STATUS_EFFECTS[name];
	if (!description) return <strong className="text-text">{name}</strong>;

	return (
		<span className="relative group/tooltip inline">
			<strong className="text-text cursor-help border-b border-dotted border-text-muted/50">{name}</strong>
			<span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-64 -translate-x-1/2 rounded border border-border bg-surface p-2 text-xs font-normal text-text-muted shadow-lg shadow-black/40 group-hover/tooltip:block">
				<span className="font-medium text-text">{name}</span>
				<br />
				{description}
			</span>
		</span>
	);
}
