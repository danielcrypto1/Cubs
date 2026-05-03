import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative -mt-8 flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center overflow-hidden bg-background px-4">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
      >
        <source src="/ux/404/404.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="font-display leading-[0.85] tracking-[-0.04em] text-[clamp(8rem,28vw,22rem)] text-primary">
          404
        </p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-tight md:text-5xl">
          You wandered too deep.
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          That page doesn&apos;t exist — at least not in this den. Head
          back to the home page and try a different door.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition hover:brightness-110"
          >
            Take me home
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/30 px-7 py-3 text-xs font-bold uppercase tracking-widest transition hover:border-primary hover:text-primary"
          >
            Browse the den
          </Link>
        </div>
      </div>
    </div>
  );
}
