function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="py-4">
			<h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</h3>
			<p className="mt-1.5 text-sm leading-relaxed text-text/80">{children}</p>
		</div>
	);
}

export function DisclaimerPage() {
	return (
		<div className="min-h-screen flex flex-col">
			<header className="border-b border-border px-6 py-8 text-center">
				<a className="inline-block" href="/">
					<h1 className="text-4xl font-bold tracking-tight">
						Fog<span className="text-accent">dex</span>
					</h1>
				</a>
			</header>

			<main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
				<h2 className="text-2xl font-bold text-text">Disclaimer</h2>

				<div className="mt-6 divide-y divide-border/50">
					<Section title="Purpose">
						Fogdex is a fan-made, non-commercial project created for educational and informational purposes. It serves
						as a quick-reference tool for Dead by Daylight killer statistics.
					</Section>

					<Section title="Copyright">
						Dead by Daylight is a registered trademark of Behaviour Interactive Inc. All killer names, portraits, terror
						radius audio, and related game content are the property of Behaviour Interactive Inc.
					</Section>

					<Section title="Content Sources">
						Killer data, images, and audio files are sourced from the{" "}
						<a
							className="text-accent hover:text-accent-light underline underline-offset-2"
							href="https://deadbydaylight.wiki.gg"
							rel="noopener noreferrer"
							target="_blank"
						>
							Dead by Daylight Wiki
						</a>
						, which hosts this content under a fair use claim for encyclopedic purposes.
					</Section>

					<Section title="Affiliation">
						This site is not affiliated with, endorsed by, or connected to Behaviour Interactive Inc. or any of its
						subsidiaries or affiliates in any way.
					</Section>

					<Section title="Takedown">
						If you are a rights holder and believe any content on this site infringes your copyright, please open an
						issue on the{" "}
						<a
							className="text-accent hover:text-accent-light underline underline-offset-2"
							href="https://github.com/almeidx/fogdex"
							rel="noopener noreferrer"
							target="_blank"
						>
							GitHub repository
						</a>{" "}
						and the content will be promptly removed.
					</Section>

					<Section title="Site License">
						The source code for this site is licensed under{" "}
						<a
							className="text-accent hover:text-accent-light underline underline-offset-2"
							href="https://www.gnu.org/licenses/agpl-3.0.html"
							rel="noopener noreferrer"
							target="_blank"
						>
							AGPL-3.0
						</a>
						. This license applies only to the code, not to any Dead by Daylight game content.
					</Section>
				</div>
			</main>

			<footer className="border-t border-border px-6 py-8 text-center text-sm text-text-muted">
				<a className="text-accent hover:text-accent-light underline" href="/">
					Back to Fogdex
				</a>
			</footer>
		</div>
	);
}
