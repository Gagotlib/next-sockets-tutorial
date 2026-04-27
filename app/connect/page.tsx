"use client";

import { useSocket } from "@/components/socket-provider";
import { Card, PageShell, Pill } from "@/components/ui";

/**
 * ConnectPage component provides a simple interface to test and inspect
 * the connection lifecycle (connect/disconnect) and view the socket ID.
 */
export default function ConnectPage() {
  // Extract connection controls and state from the socket context
  const { connect, disconnect, socketId, status } = useSocket();

  return (
    <PageShell className="space-y-6">
      <Card>
        {/* Visual indicator of the current connection status */}
        <Pill tone={status === "connected" ? "success" : "danger"}>{status}</Pill>
        
        <h2 className="mt-4 text-3xl font-black">Basic socket connection</h2>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
          A socket connection stays open after the handshake. That is the key difference from HTTP:
          you are not creating a new request every time you want to send data.
        </p>

        {/* Buttons to manually trigger connection or disconnection */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={connect}
            className="rounded-full bg-[var(--accent)] px-5 py-3 font-semibold text-white disabled:opacity-50"
            disabled={status === "connected" || status === "connecting"}
          >
            Connect
          </button>
          <button
            onClick={disconnect}
            className="rounded-full border border-[var(--border)] px-5 py-3 font-semibold disabled:opacity-50"
            disabled={status !== "connected"}
          >
            Disconnect
          </button>
        </div>

        {/* Technical details about the active connection */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-[var(--border)] bg-white/70 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Connection status
            </p>
            <p className="mt-2 text-2xl font-black capitalize">{status}</p>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-white/70 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Socket ID
            </p>
            {/* The socket ID is unique per connection session */}
            <p className="mt-2 break-all font-mono text-sm">{socketId ?? "Not connected yet"}</p>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}

