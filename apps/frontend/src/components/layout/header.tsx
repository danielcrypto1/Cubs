"use client";

import Link from "next/link";
import { NavLinks } from "./nav-links";
import { MobileNav } from "./mobile-nav";
import { WalletButton } from "./wallet-button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-primary">
            CUBS
          </Link>
          <NavLinks className="hidden lg:flex" />
        </div>

        <div className="flex items-center gap-4">
          <WalletButton />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
