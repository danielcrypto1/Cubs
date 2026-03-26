"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { CURSOR_ASSETS } from "@/lib/assets";

export function CustomCursor() {
  const prefersReduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const smoothX = useSpring(mouseX, { stiffness: 500, damping: 28, mass: 0.5 });
  const smoothY = useSpring(mouseY, { stiffness: 500, damping: 28, mass: 0.5 });

  useEffect(() => {
    // Only show on non-touch devices
    if (prefersReduced) return;
    const isFinePonter = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePonter) return;

    setVisible(true);
    document.body.classList.add("cubs-custom-cursor");

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [role='button'], .cursor-pointer, [data-cursor='pointer']")) {
        setIsPointer(true);
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [role='button'], .cursor-pointer, [data-cursor='pointer']")) {
        setIsPointer(false);
      }
    };

    const onMouseLeave = () => {
      mouseX.set(-100);
      mouseY.set(-100);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mouseout", onMouseOut, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    return () => {
      document.body.classList.remove("cubs-custom-cursor");
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [prefersReduced, mouseX, mouseY]);

  if (!visible) return null;

  const size = 48;
  const offset = size / 2;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[99999]"
      style={{
        x: smoothX,
        y: smoothY,
        translateX: -offset,
        translateY: -offset,
      }}
    >
      <motion.div
        animate={{
          scale: isPointer ? 1.2 : 1,
          rotate: isPointer ? -12 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={isPointer ? CURSOR_ASSETS.pointer : CURSOR_ASSETS.default}
          alt=""
          width={size}
          height={size}
          className="drop-shadow-lg"
        />
      </motion.div>
    </motion.div>
  );
}
