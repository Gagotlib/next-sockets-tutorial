"use client";

import { useEffect, useMemo, useState } from "react";

import { useSocket } from "@/components/socket-provider";
import { Card, PageShell, Pill } from "@/components/ui";
import type { ChatMessage } from "@/lib/socket/types";

// Default room to join on mount
const DEFAULT_ROOM = "general";

/**
 * ChatPage component demonstrates a multi-room chat implementation.
 * It showcases event listening, room-based broadcasting, and typing indicators.
 */
export default function ChatPage() {
  const { connect, socket, socketId, status } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Current room messages
  const [draft, setDraft] = useState(""); // Message being typed
  const [roomInput, setRoomInput] = useState(DEFAULT_ROOM); // Input field for room name
  const [activeRoom, setActiveRoom] = useState(DEFAULT_ROOM); // Current room the user is in
  const [systemNotes, setSystemNotes] = useState<string[]>([]); // System logs (user joined/left)
  const [typingUsers, setTypingUsers] = useState<string[]>([]); // List of users currently typing
  const [onlineCount, setOnlineCount] = useState(0); // Global count of connected users

  // Setup socket event listeners when the active room or socket changes
  useEffect(() => {
    if (!socket) {
      return;
    }

    // Handler for new incoming messages
    const onMessage = (message: ChatMessage) => {
      // Only add message if it belongs to the active room
      if (message.room === activeRoom) {
        setMessages((current) => [...current, message]);
      }
    };

    // Handler for initial room history
    const onHistory = (history: ChatMessage[]) => {
      setMessages(history.filter((message) => message.room === activeRoom));
    };

    // Handler for system events (e.g., "user joined")
    const onSystem = (message: string) => {
      setSystemNotes((current) => [message, ...current].slice(0, 5));
    };

    // Handler for typing indicator updates
    const onTyping = (payload: { room: string; users: string[] }) => {
      if (payload.room === activeRoom) {
        // Exclude the current user from the typing list
        setTypingUsers(payload.users.filter((user) => user !== socket.id));
      }
    };

    // Handler for global presence updates
    const onPresence = (count: number) => {
      setOnlineCount(count);
    };

    // Register listeners
    socket.on("chat:message", onMessage);
    socket.on("chat:history", onHistory);
    socket.on("room:system", onSystem);
    socket.on("typing:update", onTyping);
    socket.on("presence:update", onPresence);

    // Cleanup listeners on unmount or dependency change
    return () => {
      socket.off("chat:message", onMessage);
      socket.off("chat:history", onHistory);
      socket.off("room:system", onSystem);
      socket.off("typing:update", onTyping);
      socket.off("presence:update", onPresence);
    };
  }, [activeRoom, socket]);

  // Ensure the socket is connected when entering this page
  useEffect(() => {
    if (status === "disconnected") {
      connect();
    }
  }, [connect, status]);

  // Manage room subscription (join/leave events)
  useEffect(() => {
    if (!socket || status !== "connected") {
      return;
    }

    // Inform the server we are joining a room
    socket.emit("room:join", activeRoom);

    // Inform the server we are leaving when switching rooms or unmounting
    return () => {
      socket.emit("room:leave", activeRoom);
    };
  }, [activeRoom, socket, status]);

  // Helper to format the typing indicator text
  const typingLabel = useMemo(() => {
    if (!typingUsers.length) {
      return null;
    }

    return `${typingUsers.length} other user${typingUsers.length > 1 ? "s are" : " is"} typing...`;
  }, [typingUsers]);

  /**
   * Sends the current draft message to the server.
   */
  const handleSend = () => {
    if (!socket || !draft.trim()) {
      return;
    }

    // Emit the message event with the text and destination room
    socket.emit("chat:message", { text: draft.trim(), room: activeRoom });
    // Explicitly stop typing state on send
    socket.emit("typing:stop", activeRoom);
    setDraft("");
  };

  /**
   * Switches to a new room based on user input.
   */
  const joinRoom = () => {
    const nextRoom = roomInput.trim().toLowerCase();
    if (!nextRoom) {
      return;
    }

    setMessages([]); // Clear messages for the new room
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
          {/* Room Controls & System Logs */}
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

          {/* Chat Interface */}
          <div className="rounded-[28px] border border-[var(--border)] bg-white/80 p-4">
            {/* Message List */}
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

            {/* Input Area */}
            <div className="mt-4">
              <p className="min-h-6 text-sm text-[var(--muted)]">{typingLabel ?? ""}</p>
              <div className="mt-2 flex gap-2">
                <input
                  value={draft}
                  onChange={(event) => {
                    const value = event.target.value;
                    setDraft(value);
                    // Emit typing status based on whether there's text in the input
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

