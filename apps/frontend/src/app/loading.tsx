export default function Loading() {
  return (
    <div className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center bg-background">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50"
      >
        <source src="/ux/loading/loading.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background" />
      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="font-display text-5xl uppercase tracking-tight text-primary md:text-7xl">
          Cubs
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.4em] text-muted-foreground">
          Loading the den
        </p>
      </div>
    </div>
  );
}
