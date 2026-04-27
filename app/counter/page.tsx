"use client";

import { useEffect, useState } from "react";

import { useSocket } from "@/components/socket-provider";
import { Card, PageShell, Pill } from "@/components/ui";

export default function CounterPage() {
  const { connect, socket, status } = useSocket();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (status === "disconnected") {
      connect();
    }
  }, [connect, status]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const syncCounter = (value: number) => setCount(value);

    socket.on("counter:sync", syncCounter);

    return () => {
      socket.off("counter:sync", syncCounter);
    };
  }, [socket]);

  return (
    <PageShell>
      <Card className="text-center">
        <Pill tone={status === "connected" ? "success" : "danger"}>{status}</Pill>
        <h2 className="mt-4 text-3xl font-black">Shared counter</h2>
        <p className="mx-auto mt-3 max-w-2xl leading-7 text-[var(--muted)]">
          The counter lives on the server. When one client increments it, the server emits the
          updated value to every client so they all stay in sync.
        </p>
        <div className="mt-8 text-7xl font-black">{count}</div>
        <button
          onClick={() => socket?.emit("counter:update", count + 1)}
          className="mt-8 rounded-full bg-[var(--accent)] px-8 py-4 text-lg font-semibold text-white"
        >
          Increment for everyone
        </button>
      </Card>
    </PageShell>
  );
}
