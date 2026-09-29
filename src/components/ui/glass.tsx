import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlassProps = ComponentProps<"div"> & {
  live?: boolean;
  lite?: boolean;
  interactive?: boolean;
};

export function Glass({ className, live, lite, interactive, children, ...props }: GlassProps) {
  return (
    <div
      className={cn(
        lite ? "glass-lite" : live ? "glass-frost glass-live" : "glass-frost",
        "rounded-3xl",
        interactive && "glass-interactive",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  description,
  live,
}: {
  kicker?: string;
  title: string;
  description?: string;
  live?: boolean;
}) {
  return (
    <header className="reveal max-w-2xl">
      {kicker ? (
        <p className="kicker">
          {live ? <span className="live-dot" /> : null}
          {kicker}
        </p>
      ) : null}
      <h1 className="page-title">{title}</h1>
      {description ? <p className="page-desc">{description}</p> : null}
    </header>
  );
}

export function StatCard({
  label,
  value,
  hint,
  trailing,
}: {
  label: string;
  value: string;
  hint?: string;
  trailing?: ReactNode;
}) {
  return (
    <Glass lite className="rounded-3xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label-caps">{label}</p>
          <p className="mt-2 text-sm font-medium leading-snug text-fg">{value}</p>
          {hint ? <p className="mt-1 text-xs text-subtle">{hint}</p> : null}
        </div>
        {trailing}
      </div>
    </Glass>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="label-caps">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
