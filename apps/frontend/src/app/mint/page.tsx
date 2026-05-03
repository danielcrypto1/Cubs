"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Twitter, MessageCircle, BookOpen } from "lucide-react";

const TOTAL_SUPPLY = 10000;
const PRICE_ETH = 0.05;
const MINT_END = "2026-06-15T18:00:00Z";

function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

export default function MintPage() {
  const [quantity, setQuantity] = useState(1);
  const t = useCountdown(MINT_END);

  return (
    <div className="relative">
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          {/* Left — feature image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.85 0.25 145 / 0.4), oklch(0.10 0 0))",
            }}
          >
            <div className="absolute inset-0 cubs-leopard-border opacity-50" />
            <div className="relative flex h-full items-center justify-center">
              <div className="text-center">
                <p className="font-display text-9xl text-primary">CUBS</p>
                <p className="mt-2 text-sm uppercase tracking-widest text-foreground/80">Genesis Collection</p>
              </div>
            </div>
          </motion.div>

          {/* Right — mint controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Mint section</p>
            <h1 className="mt-3 font-display uppercase leading-[0.9] tracking-[-0.03em] text-[clamp(3rem,7vw,5.5rem)]">
              <span className="block">NFT</span>
              <span className="block text-primary">Mint section.</span>
            </h1>

            <p className="mt-5 max-w-xl text-muted-foreground">
              CUBS is a collection of {TOTAL_SUPPLY.toLocaleString()} unique,
              programmatically generated cubs roaming the Ethereum
              blockchain as ERC-721 NFTs. Every cub is unique and
              algorithmically generated from over 250+ possible attributes
              and traits.
            </p>

            <div className="mt-6 flex flex-wrap gap-x-12 gap-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Price:</span>{" "}
                <span className="font-display text-primary text-lg">{PRICE_ETH} ETH</span>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>{" "}
                <span className="font-display text-foreground text-lg">15.06.2026</span>
              </div>
            </div>

            {/* Countdown bar */}
            <div className="mt-8 flex items-center gap-1 overflow-hidden rounded-full border border-border bg-card p-1">
              <div className="grid flex-1 grid-cols-4 gap-1 px-3 py-2 text-center font-display text-2xl">
                <span><span className="text-primary">{String(t.d).padStart(2, "0")}</span><span className="ml-0.5 text-xs text-muted-foreground">d</span></span>
                <span><span className="text-primary">{String(t.h).padStart(2, "0")}</span><span className="ml-0.5 text-xs text-muted-foreground">h</span></span>
                <span><span className="text-primary">{String(t.m).padStart(2, "0")}</span><span className="ml-0.5 text-xs text-muted-foreground">m</span></span>
                <span><span className="text-primary">{String(t.s).padStart(2, "0")}</span><span className="ml-0.5 text-xs text-muted-foreground">s</span></span>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition hover:brightness-110">
                <Sparkles className="h-3.5 w-3.5" />
                Bid mint
              </button>
            </div>

            {/* Quantity */}
            <div className="mt-6 flex items-center gap-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Quantity</p>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card p-1">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-8 w-8 rounded-full text-sm transition hover:bg-muted">−</button>
                <span className="w-8 text-center font-display text-lg">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(5, quantity + 1))} className="h-8 w-8 rounded-full text-sm transition hover:bg-muted">+</button>
              </div>
              <span className="font-display text-lg text-primary">{(PRICE_ETH * quantity).toFixed(2)} ETH</span>
            </div>
          </motion.div>
        </div>

        {/* Stats grid */}
        <div className="mt-20 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { value: "0/500", label: "Fair launch and distribution. All cubs cost 0.05 ETH." },
            { value: TOTAL_SUPPLY.toLocaleString(), label: `${TOTAL_SUPPLY.toLocaleString()} random cubs NFTs.` },
            { value: "©", label: "Full commercial rights to your cub." },
            { value: "100%", label: "Unlock additional benefits via roadmap activations." },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-6 text-center">
              <p className="font-display text-3xl text-primary">{s.value}</p>
              <p className="mt-2 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mint flow steps (Buy flow reference) */}
        <div className="mt-24">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">How it works</p>
          <h2 className="mt-2 font-display uppercase text-[clamp(2rem,5vw,4rem)] leading-[0.95] tracking-[-0.025em]">
            <span className="block">Three steps to</span>
            <span className="block text-primary">your first cub.</span>
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { step: "01", title: "Connect wallet", body: "Hook up your wallet to verify ownership and reserve a mint slot." },
              { step: "02", title: "Pick quantity", body: "Up to 5 cubs per transaction. Each one is randomly generated." },
              { step: "03", title: "Confirm mint", body: "Sign the transaction. Your cubs land in your wallet seconds later." },
            ].map((s) => (
              <div key={s.step} className="rounded-3xl border border-border bg-card p-6">
                <p className="font-display text-5xl text-primary/60">{s.step}</p>
                <p className="mt-4 font-display text-xl uppercase">{s.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Socials */}
        <div className="mt-16 flex items-center justify-center gap-6 text-xs uppercase tracking-widest text-muted-foreground">
          <a href="#" className="inline-flex items-center gap-2 transition hover:text-primary">
            <Twitter className="h-4 w-4" /> Twitter
          </a>
          <a href="#" className="inline-flex items-center gap-2 transition hover:text-primary">
            <MessageCircle className="h-4 w-4" /> Telegram
          </a>
          <a href="#" className="inline-flex items-center gap-2 transition hover:text-primary">
            <BookOpen className="h-4 w-4" /> Medium
          </a>
        </div>

        {/* Internal links */}
        <div className="mt-16 flex flex-wrap justify-center gap-3 text-xs uppercase tracking-widest">
          <Link href="/forge" className="rounded-full border border-border px-5 py-2 transition hover:border-primary hover:text-primary">Open the forge</Link>
          <Link href="/marketplace" className="rounded-full border border-border px-5 py-2 transition hover:border-primary hover:text-primary">Browse marketplace</Link>
          <Link href="/drops" className="rounded-full border border-border px-5 py-2 transition hover:border-primary hover:text-primary">See drops</Link>
        </div>
      </section>
    </div>
  );
}
