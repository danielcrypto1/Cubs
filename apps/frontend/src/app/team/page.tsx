"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

const LEADERS = [
  {
    name: "Daniel Moore",
    role: "Founder & Chief Cub",
    bg: "from-amber-500 to-amber-700",
    initials: "DM",
  },
  {
    name: "Mira Sato",
    role: "Chief Design Officer",
    bg: "from-rose-500 to-rose-700",
    initials: "MS",
  },
  {
    name: "Alex Park",
    role: "Chief Tech Officer",
    bg: "from-emerald-500 to-emerald-700",
    initials: "AP",
  },
  {
    name: "Jasmine Hall",
    role: "Head of Community",
    bg: "from-sky-500 to-sky-700",
    initials: "JH",
  },
  {
    name: "Otis Reeve",
    role: "Lead Smart Contract Engineer",
    bg: "from-fuchsia-500 to-fuchsia-700",
    initials: "OR",
  },
  {
    name: "Lena Quintero",
    role: "Head of Partnerships",
    bg: "from-orange-500 to-orange-700",
    initials: "LQ",
  },
];

export default function TeamPage() {
  return (
    <div className="relative">
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Meet our leaders</p>
          <h1 className="mt-3 font-display uppercase leading-[0.9] tracking-[-0.03em] text-[clamp(2.5rem,7vw,5rem)]">
            <span className="block">The team</span>
            <span className="block text-primary">behind the cubs.</span>
          </h1>
          <p className="mt-5 text-muted-foreground">
            The crew building cubs is made up of artists, engineers, and
            community veterans. Many backgrounds, one common ground:
            curiosity, kindness and a deep motivation to ship great things.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {LEADERS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="overflow-hidden rounded-3xl border border-border bg-card cubs-card-hover"
            >
              <div className={`relative aspect-square bg-gradient-to-br ${p.bg}`}>
                <div className="absolute inset-0 flex items-center justify-center font-display text-6xl text-white/90">
                  {p.initials}
                </div>
                <button className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105">
                  <Play className="h-3.5 w-3.5 fill-current" />
                </button>
              </div>
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{p.role}</p>
                <p className="mt-2 font-display text-xl uppercase tracking-tight">{p.name}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA strip */}
        <div className="mt-24 rounded-3xl border border-border bg-card p-10 text-center md:p-16">
          <h2 className="font-display uppercase text-[clamp(2rem,5vw,3.5rem)] leading-[0.95]">
            Want to <span className="text-primary">join the den</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            We&apos;re always on the lookout for thoughtful, talented humans
            who care about the craft.
          </p>
          <a
            href="mailto:hello@cubs.xyz"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition hover:brightness-110"
          >
            Get in touch
          </a>
        </div>
      </section>
    </div>
  );
}
