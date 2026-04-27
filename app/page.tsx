import type { Route } from "next";
import Link from "next/link";

import { Card, PageShell, Pill } from "@/components/ui";

const demoCards = [
  {
    href: "/connect",
    title: "Basic Connection",
    description: "See a persistent socket connect, disconnect, and expose its live socket ID."
  },
  {
    href: "/chat",
    title: "Chat + Rooms",
    description: "Learn emit/on, broadcasts, room joins, room leaves, typing indicators, and timestamps."
  },
  {
    href: "/counter",
    title: "Shared Counter",
    description: "Watch one client update shared state and every connected client receive the new value."
  },
  {
    href: "/notifications",
    title: "Server Push",
    description: "See the server send events on its own schedule without waiting for an HTTP request."
  }
] as const satisfies ReadonlyArray<{
  href: Route;
  title: string;
  description: string;
}>;

export default function HomePage() {
  return (
    <PageShell className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="overflow-hidden bg-[linear-gradient(135deg,#fffdf8_0%,#fef0d8_45%,#ffd9b6_100%)]">
          <Pill>Teaching project</Pill>
          <h2 className="mt-4 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
            Learn how real-time systems behave in Next.js, one event at a time.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            This playground keeps the abstractions small on purpose. You can inspect the socket
            provider, the standalone Node server, and each page to see how events move between
            clients and the server.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/chat"
              className="rounded-full bg-[var(--accent)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            >
              Start with chat
            </Link>
            <Link
              href="/connect"
              className="rounded-full border border-[var(--border)] px-5 py-3 font-semibold"
            >
              Inspect connection state
            </Link>
          </div>
        </Card>

        <Card className="bg-[var(--surface-strong)]">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Architecture
          </p>
          <h3 className="mt-3 text-2xl font-black">Two Next.js patterns</h3>
          <div className="mt-4 space-y-4 text-[var(--muted)]">
            <p>
              <strong>Option A:</strong> bootstrap Socket.IO inside Next.js through an API route.
              Good for demos, awkward for scale.
            </p>
            <p>
              <strong>Option B:</strong> run a separate Node.js socket server alongside Next.js.
              This project uses that approach by default because it makes persistent connections,
              shared state, and background pushes easier to reason about.
            </p>
            <p>
              Serverless platforms usually spin functions up and down per request, which conflicts
              with long-lived socket connections.
            </p>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {demoCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="h-full transition hover:-translate-y-1 hover:bg-white">
              <h3 className="text-xl font-black">{card.title}</h3>
              <p className="mt-3 leading-7 text-[var(--muted)]">{card.description}</p>
            </Card>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h3 className="text-xl font-black">What this teaches</h3>
          <ul className="mt-4 space-y-3 text-[var(--muted)]">
            <li>Persistent connection versus one-off HTTP request/response</li>
            <li>Bidirectional events with `emit()` and `on()`</li>
            <li>Rooms for scoped delivery</li>
            <li>Server-driven pushes like notifications</li>
          </ul>
        </Card>
        <Card>
          <h3 className="text-xl font-black">Client patterns</h3>
          <ul className="mt-4 space-y-3 text-[var(--muted)]">
            <li>Single shared socket instance</li>
            <li>Context provider and custom hook</li>
            <li>Listener cleanup to avoid memory leaks</li>
            <li>UI derived from real connection state</li>
          </ul>
        </Card>
        <Card>
          <h3 className="text-xl font-black">Server patterns</h3>
          <ul className="mt-4 space-y-3 text-[var(--muted)]">
            <li>One Socket.IO server managing all events</li>
            <li>Broadcasting versus room-targeted emits</li>
            <li>Shared in-memory counter for state sync</li>
            <li>Timed pushes for notification events</li>
          </ul>
        </Card>
      </section>
    </PageShell>
  );
}
