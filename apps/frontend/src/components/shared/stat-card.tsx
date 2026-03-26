"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CountUp } from "@/components/shared/count-up";
import { fadeInUp } from "@/lib/animations";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  colour?: string;
}

export function StatCard({ label, value, subtitle, icon: Icon, colour = "text-primary" }: StatCardProps) {
  return (
    <motion.div variants={fadeInUp}>
      <Card className="cubs-card-hover">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${colour}`}><CountUp value={value} /></p>
              {subtitle && (
                <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {Icon && (
              <div className={`rounded-xl bg-muted p-2.5 ${colour}`}>
                <Icon className="h-5 w-5" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
