import Link from "next/link";

const footerLinks = [
  { label: "Mint", href: "/mint" },
  { label: "Explore", href: "/marketplace" },
  { label: "Drops", href: "/drops" },
  { label: "Cub Forge", href: "/forge" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Team", href: "/team" },
  { label: "Media Kit", href: "/media-kit" },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-3xl uppercase cubs-gradient-text">CUBS</p>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              The complete NFT ecosystem on Ethereum. Forge, drop, trade.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-3 md:justify-center">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2 md:items-end">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Follow</p>
            <div className="flex gap-3">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">Twitter</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">Discord</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">OpenSea</a>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="relative -mt-4 overflow-hidden whitespace-nowrap select-none"
      >
        <div className="cubs-marquee inline-block">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="font-display inline-block text-[18vw] leading-[0.8] tracking-[-0.04em] uppercase"
              style={{
                WebkitTextStroke: "2px oklch(0.85 0.25 145 / 0.55)",
                color: "transparent",
                paddingRight: "0.15em",
              }}
            >
              CUBS
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        &copy; 2026 CUBS Platform. Built on Ethereum.
      </div>
    </footer>
  );
}
