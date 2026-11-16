import type { ReactNode } from "react";

export function Results({ children }: { children: ReactNode }) {
	return <main className="mx-auto w-full max-w-350 flex-1 px-4 py-6">{children}</main>;
}

export function EmptyResults({ noun, onClear }: { noun: string; onClear: () => void }) {
	return (
		<div className="py-16 text-center text-text-muted" role="status">
			<p className="text-lg">No {noun} match your filters</p>
			<p className="mt-2 text-sm">Try adjusting or clearing your filters.</p>
			<button
				className="mt-4 rounded border border-accent bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-light"
				onClick={onClear}
				type="button"
			>
				Clear all filters
			</button>
		</div>
	);
}
