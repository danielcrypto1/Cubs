"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FLOATING_CUB_IMAGES } from "@/lib/assets";

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  driftY: number;
  driftX: number;
  rotate: number;
  duration: number;
  delay: number;
  opacity: number;
  imageUrl: string;
}

interface FloatingBackgroundProps {
  count?: number;
}

/** How close the cursor needs to be to push a cub */
const CURSOR_RADIUS = 120;
/** Impulse strength when cursor overlaps a cub */
const IMPULSE = 1.2;
/** Friction per frame (0-1, lower = more floaty) */
const FRICTION = 0.98;
/** Spin impulse (degrees per frame) */
const SPIN_IMPULSE = 0.4;
/** Spin friction */
const SPIN_FRICTION = 0.97;

interface PhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vr: number;
}

export function FloatingBackground({ count = 16 }: FloatingBackgroundProps) {
  const prefersReduced = useReducedMotion();
  const [elements, setElements] = useState<FloatingElement[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const physicsRef = useRef<PhysicsState[]>([]);

  useEffect(() => {
    const items: FloatingElement[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      size: Math.random() * 80 + 120,
      driftY: Math.random() * 50 + 30,
      driftX: Math.random() * 20 + 10,
      rotate: Math.random() * 16 - 8,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * -10,
      opacity: Math.random() * 0.2 + 0.65,
      imageUrl: FLOATING_CUB_IMAGES[i % FLOATING_CUB_IMAGES.length],
    }));
    setElements(items);
    wrapperRefs.current = items.map(() => null);
    physicsRef.current = items.map(() => ({ x: 0, y: 0, vx: 0, vy: 0, rotation: 0, vr: 0 }));
  }, [count]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const tick = useCallback(() => {
    if (!containerRef.current || elements.length === 0) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const rect = containerRef.current.getBoundingClientRect();

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const wrapper = wrapperRefs.current[i];
      const p = physicsRef.current[i];
      if (!wrapper || !p) continue;

      // Element center in viewport coordinates (includes current physics offset)
      const cx = rect.left + (el.x / 100) * rect.width + el.size / 2 + p.x;
      const cy = rect.top + (el.y / 100) * rect.height + el.size / 2 + p.y;

      const dx = cx - mx;
      const dy = cy - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Apply impulse if cursor is close
      if (dist < CURSOR_RADIUS && dist > 0) {
        const force = (1 - dist / CURSOR_RADIUS) * IMPULSE;
        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * force;
        p.vy += Math.sin(angle) * force;
        // Spin based on which side the cursor hits
        p.vr += (dx > 0 ? SPIN_IMPULSE : -SPIN_IMPULSE) * (1 - dist / CURSOR_RADIUS);
      }

      // Apply friction (zero-gravity: no gravity pull, just slow decay)
      p.vx *= FRICTION;
      p.vy *= FRICTION;
      p.vr *= SPIN_FRICTION;

      // Integrate position
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vr;

      // Gentle return force toward origin (very weak, so they drift back slowly)
      p.x *= 0.998;
      p.y *= 0.998;

      // Apply transform directly to DOM (no React re-render)
      wrapper.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [elements]);

  useEffect(() => {
    if (prefersReduced) return;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick, prefersReduced]);

  if (prefersReduced || elements.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      aria-hidden="true"
    >
      {elements.map((el, i) => (
        <div
          key={el.id}
          ref={(node) => { wrapperRefs.current[i] = node; }}
          className="absolute will-change-transform"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
          }}
        >
          <motion.div
            style={{
              width: el.size,
              height: el.size,
              opacity: el.opacity,
            }}
            animate={{
              y: [0, -el.driftY, 0],
              x: [0, el.driftX, 0],
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: el.delay,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={el.imageUrl}
              alt=""
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </motion.div>
        </div>
      ))}
    </div>
  );
}
