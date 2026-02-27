import { cn } from "@/lib/utils";

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full rounded-lg border border-border bg-background px-3 py-2 pe-9 text-sm text-foreground outline-none transition",
          "focus:border-primary focus:ring-2 focus:ring-ring/40",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
        \/
      </span>
    </div>
  );
}
