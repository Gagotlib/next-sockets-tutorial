import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export function PageShell({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={clsx("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8", className)}>
      {children}
    </main>
  );
}

export function Card({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-100 text-emerald-800"
      : tone === "danger"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-900";

  return (
    <span className={clsx("inline-flex rounded-full px-3 py-1 text-sm font-semibold", toneClass)}>
      {children}
    </span>
  );
}
