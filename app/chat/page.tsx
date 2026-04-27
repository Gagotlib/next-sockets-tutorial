"use client";

import { useEffect, useMemo, useState } from "react";

import { useSocket } from "@/components/socket-provider";
import { Card, PageShell, Pill } from "@/components/ui";
import type { ChatMessage } from "@/lib/socket/types";

const DEFAULT_ROOM = "general";

export default function ChatPage() {
  const { connect, socket, socketId, status } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [roomInput, setRoomInput] = useState(DEFAULT_ROOM);
  const [activeRoom, setActiveRoom] = useState(DEFAULT_ROOM);
  const [systemNotes, setSystemNotes] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const onMessage = (message: ChatMessage) => {
      if (message.room === activeRoom) {
        setMessages((current) => [...current, message]);
      }
    };

    const onHistory = (history: ChatMessage[]) => {
      setMessages(history.filter((message) => message.room === activeRoom));
    };

    const onSystem = (message: string) => {
      setSystemNotes((current) => [message, ...current].slice(0, 5));
    };

    const onTyping = (payload: { room: string; users: string[] }) => {
      if (payload.room === activeRoom) {
        setTypingUsers(payload.users.filter((user) => user !== socket.id));
      }
    };

    const onPresence = (count: number) => {
      setOnlineCount(count);
    };

    socket.on("chat:message", onMessage);
    socket.on("chat:history", onHistory);
    socket.on("room:system", onSystem);
    socket.on("typing:update", onTyping);
    socket.on("presence:update", onPresence);

    return () => {
      socket.off("chat:message", onMessage);
      socket.off("chat:history", onHistory);
      socket.off("room:system", onSystem);
      socket.off("typing:update", onTyping);
      socket.off("presence:update", onPresence);
    };
  }, [activeRoom, socket]);

  useEffect(() => {
    if (status === "disconnected") {
      connect();
    }
  }, [connect, status]);

  useEffect(() => {
    if (!socket || status !== "connected") {
      return;
    }

    socket.emit("room:join", activeRoom);

    return () => {
      socket.emit("room:leave", activeRoom);
    };
  }, [activeRoom, socket, status]);

  const typingLabel = useMemo(() => {
    if (!typingUsers.length) {
      return null;
    }

    return `${typingUsers.length} other user${typingUsers.length > 1 ? "s are" : " is"} typing...`;
  }, [typingUsers]);

  const handleSend = () => {
    if (!socket || !draft.trim()) {
      return;
    }

    socket.emit("chat:message", { text: draft.trim(), room: activeRoom });
    socket.emit("typing:stop", activeRoom);
    setDraft("");
  };

  const joinRoom = () => {
    const nextRoom = roomInput.trim().toLowerCase();
    if (!nextRoom) {
      return;
    }

    setMessages([]);
    setActiveRoom(nextRoom);
  };

  return (
    <PageShell className="space-y-6">
      <Card className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Pill tone={status === "connected" ? "success" : "danger"}>{status}</Pill>
            <h2 className="mt-4 text-3xl font-black">Real-time chat with rooms</h2>
            <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">
              Open this page in multiple tabs. Each sent message is emitted to the server, which
              then broadcasts it back to the right room. That round-trip is the core of event-based
              real-time communication.
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-white/80 px-5 py-4 text-right">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Online users</p>
            <p className="text-3xl font-black">{onlineCount}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-[var(--border)] bg-white/80 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Active room
              </p>
              <p className="mt-2 text-2xl font-black">#{activeRoom}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Your socket: {socketId ?? "..."}</p>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-white/80 p-4">
              <label className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Join a room
              </label>
              <div className="mt-3 flex gap-2">
                <input
                  value={roomInput}
                  onChange={(event) => setRoomInput(event.target.value)}
                  className="w-full rounded-full border border-[var(--border)] bg-white px-4 py-3 outline-none"
                  placeholder="general"
                />
                <button
                  onClick={joinRoom}
                  className="rounded-full bg-[var(--accent)] px-5 py-3 font-semibold text-white"
                >
                  Join
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-white/80 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Latest server notes
              </p>
              <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                {systemNotes.length ? (
                  systemNotes.map((note) => (
                    <p key={note} className="rounded-2xl bg-[var(--surface-strong)] px-3 py-2">
                      {note}
                    </p>
                  ))
                ) : (
                  <p>No room events yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--border)] bg-white/80 p-4">
            <div className="flex h-[420px] flex-col gap-3 overflow-y-auto pr-2">
              {messages.length ? (
                messages.map((message) => {
                  const ownMessage = message.socketId === socketId;

                  return (
                    <div
                      key={message.id}
                      className={`max-w-[80%] rounded-3xl px-4 py-3 ${
                        ownMessage
                          ? "ml-auto bg-[var(--accent)] text-white"
                          : "bg-[var(--surface-strong)]"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-[0.15em] opacity-70">
                        {ownMessage ? "You" : message.socketId}
                      </p>
                      <p className="mt-2 leading-7">{message.text}</p>
                      <p className="mt-2 text-xs opacity-70">
                        {new Date(message.sentAt).toLocaleTimeString()}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="grid h-full place-items-center text-center text-[var(--muted)]">
                  <div>
                    <p className="text-lg font-semibold">No messages yet</p>
                    <p className="mt-2">Send the first message in #{activeRoom}.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4">
              <p className="min-h-6 text-sm text-[var(--muted)]">{typingLabel ?? ""}</p>
              <div className="mt-2 flex gap-2">
                <input
                  value={draft}
                  onChange={(event) => {
                    const value = event.target.value;
                    setDraft(value);
                    socket?.emit(value ? "typing:start" : "typing:stop", activeRoom);
                  }}
                  onBlur={() => socket?.emit("typing:stop", activeRoom)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSend();
                    }
                  }}
                  className="w-full rounded-full border border-[var(--border)] bg-white px-4 py-3 outline-none"
                  placeholder={`Message #${activeRoom}`}
                />
                <button
                  onClick={handleSend}
                  className="rounded-full bg-[var(--accent)] px-5 py-3 font-semibold text-white"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
