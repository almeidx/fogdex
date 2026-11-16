export function WikiLinkHint() {
	return (
		<>
			<svg
				aria-hidden="true"
				className="ml-1 inline-block size-3 align-[-0.1em] text-text-muted"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
			>
				<path
					d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
			<span className="sr-only"> (opens on the Dead by Daylight Wiki in a new tab)</span>
		</>
	);
}
