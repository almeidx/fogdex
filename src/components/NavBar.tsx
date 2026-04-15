function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
	const active = window.location.pathname === href;
	return (
		<a
			className={`text-sm transition-colors ${active ? "text-accent font-medium" : "text-text-muted hover:text-text"}`}
			href={href}
		>
			{children}
		</a>
	);
}

export function NavBar() {
	return (
		<header className="border-b border-border bg-surface/95 backdrop-blur-sm">
			<div className="mx-auto max-w-350 flex items-center justify-between px-4 py-4">
				<a className="text-2xl font-bold tracking-tight" href="/">
					Fog<span className="text-accent">dex</span>
				</a>
				<nav className="flex flex-wrap items-center gap-3 sm:gap-6">
					<NavLink href="/">Killers</NavLink>
					<NavLink href="/survivors">Survivors</NavLink>
					<NavLink href="/perks/killer">Killer Perks</NavLink>
					<NavLink href="/perks/survivor">Survivor Perks</NavLink>
				</nav>
			</div>
		</header>
	);
}
