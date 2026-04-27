"use client";

import { useEffect, useState } from "react";

import { useSocket } from "@/components/socket-provider";
import { Card, PageShell, Pill } from "@/components/ui";
import type { NotificationItem } from "@/lib/socket/types";

export default function NotificationsPage() {
  const { connect, socket, status } = useSocket();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (status === "disconnected") {
      connect();
    }
  }, [connect, status]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const onNotification = (notification: NotificationItem) => {
      setNotifications((current) => [notification, ...current].slice(0, 8));
    };

    socket.on("notification:new", onNotification);

    return () => {
      socket.off("notification:new", onNotification);
    };
  }, [socket]);

  return (
    <PageShell>
      <Card>
        <Pill tone={status === "connected" ? "success" : "danger"}>{status}</Pill>
        <h2 className="mt-4 text-3xl font-black">Server-pushed notifications</h2>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
          No button click is needed here. The server emits a new notification on a timer, and each
          connected client receives it instantly over the existing socket connection.
        </p>
        <div className="mt-8 grid gap-4">
          {notifications.length ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-3xl border border-[var(--border)] bg-white/80 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black">{notification.title}</h3>
                    <p className="mt-2 text-[var(--muted)]">{notification.body}</p>
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-[var(--border)] p-8 text-center text-[var(--muted)]">
              Waiting for the server to push the first notification...
            </div>
          )}
        </div>
      </Card>
    </PageShell>
  );
}
