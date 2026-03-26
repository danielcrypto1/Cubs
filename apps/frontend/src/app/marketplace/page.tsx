"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingBackground } from "@/components/shared/floating-background";
import { ShoppingBag, Clock } from "lucide-react";

export default function MarketplacePage() {
  return (
    <div className="relative min-h-screen">
      <FloatingBackground count={6} />

      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <PageHeader
          title="Marketplace"
          description="Buy and sell Cubs, traits, and items on the open marketplace."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mx-auto max-w-xl">
            <CardContent className="flex flex-col items-center gap-6 p-10">
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <ShoppingBag className="h-10 w-10 text-primary" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold">Marketplace Coming Soon</h2>
                <p className="mt-2 text-muted-foreground">
                  The marketplace will launch alongside the Cubs collection on testnet.
                  Trade cubs, traits, and items with other collectors.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
                <Clock className="h-4 w-4" />
                Launching on Testnet
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
