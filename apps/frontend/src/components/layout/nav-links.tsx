"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/mint", label: "Mint" },
  { href: "/my-cubs", label: "My Cubs" },
  { href: "/editor", label: "Cub Editor" },
  { href: "/crates", label: "Crates" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/staking", label: "Staking" },
  { href: "/token", label: "Token" },
];

export function NavLinks({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            pathname === link.href
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
