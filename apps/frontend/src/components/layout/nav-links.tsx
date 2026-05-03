"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { springBouncy } from "@/lib/animations";

const links = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Explore" },
  { href: "/drops", label: "Drops" },
  { href: "/forge", label: "Cub Forge" },
  { href: "/mint", label: "Mint" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/team", label: "Team" },
];

export function NavLinks({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {links.map((link) => {
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
                "relative block rounded-md px-3 py-2 text-sm font-medium uppercase tracking-wide transition-colors hover:text-foreground",
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
    </nav>
  );
}

export { links as allLinks };
