"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { NavLinks } from "./nav-links";
import { MobileNav } from "./mobile-nav";
import { WalletButton } from "./wallet-button";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  return (
    <motion.header
      className="sticky top-0 z-50 backdrop-blur-md transition-colors duration-300"
      animate={{
        backgroundColor: scrolled
          ? "var(--header-scrolled-bg, oklch(1 0 0 / 0.12))"
          : "transparent",
        borderBottomColor: scrolled
          ? "var(--header-scrolled-border, oklch(1 0 0 / 0.15))"
          : "transparent",
      }}
      transition={{ duration: 0.3 }}
      style={{ borderBottomWidth: 1, borderBottomStyle: "solid" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-display text-2xl tracking-wide cubs-gradient-text">
            CUBS
          </Link>
          <NavLinks className="hidden lg:flex" />
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <WalletButton />
          <MobileNav />
        </div>
      </div>

      {/* Subtle glow line when scrolled */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        animate={{
          opacity: scrolled ? 1 : 0,
          background: scrolled
            ? "linear-gradient(90deg, transparent, oklch(0.82 0.17 80 / 0.3), transparent)"
            : "transparent",
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.header>
  );
}
