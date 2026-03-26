import Link from "next/link";

const footerLinks = [
  { label: "Mint", href: "/mint" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Staking", href: "/staking" },
  { label: "Editor", href: "/editor" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div>
            <p className="font-display text-lg cubs-gradient-text">CUBS</p>
            <p className="mt-1 text-sm text-muted-foreground">The complete NFT ecosystem on Ethereum</p>
          </div>

          <nav className="flex flex-wrap justify-center gap-4">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-6 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          &copy; 2026 CUBS Platform. Built on Ethereum.
        </div>
      </div>
    </footer>
  );
}
