interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
}

export function PageHeader({ title, description, eyebrow }: PageHeaderProps) {
  return (
    <div className="mb-12">
      {eyebrow && (
        <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
      )}
      <h1 className="font-display uppercase leading-[0.92] tracking-[-0.025em] text-[clamp(2.5rem,7vw,5rem)]">
        {title}
      </h1>
      {description && (
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
