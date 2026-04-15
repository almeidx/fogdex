export function Footer() {
	return (
		<footer className="border-t border-border px-6 py-8 text-center text-sm text-text-muted">
			<p>
				Dead by Daylight is a trademark of Behaviour Interactive Inc. Data sourced from the{" "}
				<a
					className="text-accent hover:text-accent-light underline"
					href="https://deadbydaylight.wiki.gg"
					rel="noopener noreferrer"
					target="_blank"
				>
					Dead by Daylight Wiki
				</a>
				. This site is not affiliated with Behaviour Interactive.
			</p>
			<p className="mt-2">
				<a
					className="text-accent hover:text-accent-light underline"
					href="https://github.com/almeidx/fogdex"
					rel="noopener noreferrer"
					target="_blank"
				>
					Source Code
				</a>
				{" \u00b7 "}
				AGPL-3.0
				{" \u00b7 "}
				<a className="text-accent hover:text-accent-light underline" href="/disclaimer">
					Disclaimer
				</a>
			</p>
		</footer>
	);
}
