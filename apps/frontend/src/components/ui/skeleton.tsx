import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-md cubs-shimmer", className)} {...props} />;
}

export { Skeleton };
