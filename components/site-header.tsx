import type { Route } from "next";
import Link from "next/link";

/**
 * Navigation links for the application.
 */
const links = [
  { href: "/", label: "Overview" },
  { href: "/connect", label: "Connect" },
  { href: "/chat", label: "Chat + Rooms" },
  { href: "/counter", label: "Counter" },
  { href: "/notifications", label: "Notifications" }
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

/**
 * SiteHeader component that provides consistent navigation across all pages.
 * Includes a sticky layout with a backdrop blur for a premium look.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-[rgba(249,242,230,0.88)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Next.js + Socket.IO
          </p>
          <h1 className="text-lg font-black">Real-time Learning Playground</h1>
        </div>

        <nav className="flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:bg-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

