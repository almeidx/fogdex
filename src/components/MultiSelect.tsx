import { useEffect, useMemo, useRef, useState } from "react";

interface MultiSelectProps<T extends string> {
	label: string;
	labelFn?: (option: T) => string;
	onChange: (selected: T[]) => void;
	options: readonly T[];
	searchable?: boolean;
	selected: T[];
}

export function MultiSelect<T extends string>({
	label,
	labelFn,
	options,
	searchable,
	selected,
	onChange,
}: MultiSelectProps<T>) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const ref = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		if (!open) return;
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				setOpen(false);
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open]);

	useEffect(() => {
		if (open && searchable) {
			searchRef.current?.focus();
		}
		if (!open) {
			setSearch("");
		}
	}, [open, searchable]);

	const filtered = useMemo(() => {
		if (!search) return options;
		const q = search.toLowerCase();
		return options.filter((o) => {
			const text = labelFn ? labelFn(o) : o;
			return text.toLowerCase().includes(q);
		});
	}, [options, search, labelFn]);

	const toggle = (option: T) => {
		if (selected.includes(option)) {
			onChange(selected.filter((s) => s !== option));
		} else {
			onChange([...selected, option]);
		}
	};

	return (
		<div className="relative" ref={ref}>
			<button
				className="flex items-center gap-1.5 rounded border border-border bg-surface px-3 py-1.5 text-sm text-text-muted hover:border-accent/50 hover:text-text transition-colors"
				onClick={() => setOpen(!open)}
				type="button"
			>
				{label}
				{selected.length > 0 && (
					<span className="rounded-full bg-accent px-1.5 text-xs text-white">{selected.length}</span>
				)}
				<span className="ml-0.5 text-xs">{open ? "\u25b4" : "\u25be"}</span>
			</button>
			{open && (
				<div className="absolute top-full left-0 z-20 mt-1 min-w-48 rounded border border-border bg-surface shadow-lg shadow-black/40">
					{searchable && (
						<div className="p-1.5 border-b border-border">
							<input
								className="w-full rounded border border-border bg-surface-light px-2 py-1 text-sm text-text placeholder:text-text-muted/50 focus:border-accent/50 focus:outline-none transition-colors"
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search..."
								ref={searchRef}
								type="text"
								value={search}
							/>
						</div>
					)}
					<div className="max-h-64 overflow-y-auto p-1">
						{filtered.length === 0 ? (
							<div className="px-2 py-1.5 text-sm text-text-muted/50">No matches</div>
						) : (
							filtered.map((option) => (
								<label
									className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-surface-light transition-colors"
									key={option}
								>
									<input
										checked={selected.includes(option)}
										className="accent-accent"
										onChange={() => toggle(option)}
										type="checkbox"
									/>
									<span className={selected.includes(option) ? "text-text" : "text-text-muted"}>
										{labelFn ? labelFn(option) : option}
									</span>
								</label>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}
