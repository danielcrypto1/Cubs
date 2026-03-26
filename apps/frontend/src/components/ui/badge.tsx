import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow",
        outline: "text-foreground border-border",
        /* ── Rarity variants ─────────────────────────────────── */
        common: "border-transparent bg-rarity-common/20 text-rarity-common",
        uncommon: "border-transparent bg-rarity-uncommon/20 text-rarity-uncommon",
        rare: "border-transparent bg-rarity-rare/20 text-rarity-rare",
        epic: "border-transparent bg-rarity-epic/20 text-rarity-epic",
        legendary: "border-transparent bg-rarity-legendary/20 text-rarity-legendary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
