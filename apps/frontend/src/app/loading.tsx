"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Loading() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 1000), 60);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center bg-background">
      {/* Frame counter, top-right */}
      <span className="absolute right-6 top-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {String(tick).padStart(3, "0")}
      </span>

      {/* Two pulsing vertical bars */}
      <div className="flex items-center gap-12">
        {[0, 1].map((i) => (
          <motion.span
            key={i}
            className="block h-12 w-1 rounded-full bg-foreground"
            animate={{ scaleY: [1, 1.8, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
          />
        ))}
      </div>

      {/* Subtle CUBS label below */}
      <motion.span
        className="absolute bottom-10 left-1/2 -translate-x-1/2 font-display text-xs uppercase tracking-[0.6em] text-muted-foreground"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        Loading the den
      </motion.span>
    </div>
  );
}
