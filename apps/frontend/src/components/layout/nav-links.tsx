"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { springBouncy } from "@/lib/animations";

const primaryLinks = [
  { href: "/", label: "World Map" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/forge", label: "Cub Forge" },
  { href: "/drops", label: "Drops" },
  { href: "/marketplace", label: "Marketplace" },
];

const moreLinks = [
  { href: "/agents", label: "Agents" },
  { href: "/mint", label: "Mint" },
  { href: "/explore", label: "Explore" },
  { href: "/staking", label: "Staking" },
  { href: "/editor", label: "Media Kit" },
  { href: "/token", label: "Token" },
  { href: "/achievements", label: "Achievements" },
  { href: "/seasons", label: "Seasons" },
];

const allLinks = [...primaryLinks, ...moreLinks];

export function NavLinks({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isMoreActive = moreLinks.some((l) => pathname === l.href);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {primaryLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <motion.div
            key={link.href}
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Link
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "relative block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
            {isActive && (
              <motion.div
                layoutId="nav-active"
                className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-primary"
                transition={springBouncy}
              />
            )}
          </motion.div>
        );
      })}

      {/* More dropdown */}
      <div ref={dropdownRef} className="relative">
        <motion.button
          onClick={() => setOpen((prev) => !prev)}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={cn(
            "relative flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
            isMoreActive ? "text-foreground" : "text-muted-foreground",
          )}
        >
          More
          <motion.svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="mt-0.5"
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
          {isMoreActive && (
            <motion.div
              layoutId="nav-active"
              className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-primary"
              transition={springBouncy}
            />
          )}
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2 min-w-[180px] overflow-hidden rounded-xl border border-white/10 bg-card/95 shadow-xl backdrop-blur-xl"
            >
              {moreLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    className={cn(
                      "block px-4 py-2.5 text-sm transition-colors hover:bg-white/5",
                      isActive ? "text-foreground bg-white/5" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

/** Export all links for mobile nav */
export { allLinks };
