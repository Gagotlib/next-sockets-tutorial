"use client";

import { useEffect, useState } from "react";

import { useSocket } from "@/components/socket-provider";
import { Card, PageShell, Pill } from "@/components/ui";

/**
 * CounterPage component demonstrates how to synchronize shared state across multiple clients.
 * The "source of truth" for the counter resides on the server.
 */
export default function CounterPage() {
  const { connect, socket, status } = useSocket();
  const [count, setCount] = useState(0);

  // Ensure the socket is connected when entering this page
  useEffect(() => {
    if (status === "disconnected") {
      connect();
    }
  }, [connect, status]);

  // Listen for synchronization events from the server
  useEffect(() => {
    if (!socket) {
      return;
    }

    // Update local state when the server broadcasts a new counter value
    const syncCounter = (value: number) => setCount(value);

    socket.on("counter:sync", syncCounter);

    // Cleanup the listener to avoid duplicate updates or memory leaks
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

        {/* Current synchronized count */}
        <div className="mt-8 text-7xl font-black">{count}</div>
        
        <button
          onClick={() => {
            // Emit an update event to the server to increment the shared value
            socket?.emit("counter:update", count + 1);
          }}
          className="mt-8 rounded-full bg-[var(--accent)] px-8 py-4 text-lg font-semibold text-white"
        >
          Increment for everyone
        </button>
      </Card>
    </PageShell>
  );
}

