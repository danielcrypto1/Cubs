"use client";

import { motion } from "framer-motion";
import { Download, Palette, Type, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

const COLORS = [
  { name: "Cubs Green", hex: "#7CFFB7", token: "primary" },
  { name: "Black", hex: "#0A0A0A", token: "background" },
  { name: "Card Grey", hex: "#1A1A1A", token: "card" },
  { name: "Honey Gold", hex: "#E8A951", token: "accent" },
  { name: "Foreground", hex: "#FAFAFA", token: "foreground" },
];

const FONTS = [
  { name: "Lilita One", role: "Display headlines", sample: "AaBbCc 123" },
  { name: "Nunito", role: "Body & UI", sample: "AaBbCc 123" },
];

export default function MediaKitPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  return (
    <div className="relative">
      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Brand guide</p>
        <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="font-display uppercase leading-[0.9] tracking-[-0.03em] text-[clamp(2.5rem,7vw,5rem)]">
            <span className="block">Styled for</span>
            <span className="block text-primary">your brand.</span>
          </h1>
          <div className="inline-flex items-center gap-1 self-start rounded-full border border-border bg-card p-1 lg:self-end">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
                  theme === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-5 max-w-xl text-muted-foreground">
          Download the cubs brand kit. Logos, colors, typography and
          usage guidelines — everything you need to feature cubs in your
          piece.
        </p>

        {/* Two-column kit */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-border bg-card p-8"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <ImageIcon className="h-3.5 w-3.5" /> Logo
            </div>
            <div className={`mt-6 flex aspect-video items-center justify-center rounded-2xl ${theme === "dark" ? "bg-background" : "bg-foreground"}`}>
              <span className={`font-display text-5xl uppercase ${theme === "dark" ? "text-primary" : "text-background"}`}>CUBS</span>
            </div>
            <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition hover:border-primary hover:text-primary">
              <Download className="h-3.5 w-3.5" />
              Download SVG · PNG
            </button>
          </motion.div>

          {/* Colors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="rounded-3xl border border-border bg-card p-8"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Palette className="h-3.5 w-3.5" /> Brand color
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {COLORS.map((c) => (
                <div key={c.hex} className="flex flex-col">
                  <div className="aspect-square rounded-2xl border border-border" style={{ backgroundColor: c.hex }} />
                  <p className="mt-2 text-[10px] uppercase tracking-widest text-foreground">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{c.hex}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Typography */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-border bg-card p-8"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Type className="h-3.5 w-3.5" /> Fonts
            </div>
            <div className="mt-6 space-y-5">
              {FONTS.map((f) => (
                <div key={f.name} className="rounded-2xl border border-border bg-background p-5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{f.role}</p>
                  <p className="mt-2 font-display text-3xl uppercase">{f.sample}</p>
                  <p className="mt-1 text-xs text-foreground">{f.name}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Corner radius / borders */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Corner radius</p>
            <div className="mt-6 grid grid-cols-4 gap-3">
              {[
                { r: "0.5rem", label: "sm" },
                { r: "0.75rem", label: "md" },
                { r: "1.5rem", label: "xl" },
                { r: "2rem", label: "2xl" },
              ].map((r) => (
                <div key={r.label} className="text-center">
                  <div className="aspect-square border border-primary/40 bg-primary/10" style={{ borderRadius: r.r }} />
                  <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">{r.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Download the kit</p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Logos, color tokens, type files and usage examples bundled into a single archive.
            </p>
            <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition hover:brightness-110">
              <Download className="h-3.5 w-3.5" />
              Download brand kit
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
