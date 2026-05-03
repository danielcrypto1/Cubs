"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface CountUpProps {
  value: string;
  className?: string;
}

/**
 * Animates a numeric value from 0 to target on viewport entry.
 * Handles prefixes ($), suffixes (M, K, %, +), commas, and decimals.
 * Falls back to static text for non-numeric values.
 */
export function CountUp({ value, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!isInView) return;

    // Extract prefix ($ or +), numeric part, and suffix (M, K, %, etc.)
    const match = value.match(/^([+$]*)([0-9][0-9,]*\.?\d*)\s*(.*)$/);
    if (!match) {
      setDisplay(value);
      return;
    }

    const prefix = match[1];
    const numStr = match[2].replace(/,/g, "");
    const suffix = match[3];
    const target = parseFloat(numStr);
    const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
    const hasCommas = match[2].includes(",");

    if (isNaN(target)) {
      setDisplay(value);
      return;
    }

    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      let formatted = current.toFixed(decimals);
      if (hasCommas) {
        const [intPart, decPart] = formatted.split(".");
        formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (decPart) formatted += "." + decPart;
      }

      setDisplay(`${prefix}${formatted}${suffix ? " " + suffix : ""}`);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplay(value);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
