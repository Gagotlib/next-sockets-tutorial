import { createServer } from "node:http";
import { Server } from "socket.io";

import type {
  ChatMessage,
  ClientToServerEvents,
  NotificationItem,
  ServerToClientEvents
} from "../lib/socket/types";

const PORT = Number(process.env.SOCKET_PORT ?? 3001);
const ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: ORIGIN,
    credentials: true
  }
});

let sharedCounter = 0;
const messageHistoryByRoom = new Map<string, ChatMessage[]>();
const typingByRoom = new Map<string, Set<string>>();

function getRoomHistory(room: string) {
  return messageHistoryByRoom.get(room) ?? [];
}

function setRoomHistory(room: string, nextMessages: ChatMessage[]) {
  messageHistoryByRoom.set(room, nextMessages.slice(-20));
}

function emitTyping(room: string) {
  const users = Array.from(typingByRoom.get(room) ?? []);
  io.to(room).emit("typing:update", { room, users });
}

function createNotification(): NotificationItem {
  const now = new Date();

  return {
    id: crypto.randomUUID(),
    title: "Server heartbeat",
    body: "This event was pushed by the Socket.IO server without waiting for an HTTP request.",
    createdAt: now.toISOString()
  };
}

io.on("connection", (socket) => {
  io.emit("presence:update", io.engine.clientsCount);
  socket.emit("counter:sync", sharedCounter);

  socket.on("room:join", (room) => {
    socket.join(room);
    socket.emit("chat:history", getRoomHistory(room));
    io.to(room).emit("room:system", `${socket.id} joined #${room}`);
  });

  socket.on("room:leave", (room) => {
    socket.leave(room);
    socket.emit("room:system", `You left #${room}`);

    const typingUsers = typingByRoom.get(room);
    typingUsers?.delete(socket.id);
    emitTyping(room);
  });

  socket.on("chat:message", ({ text, room }) => {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      room,
      socketId: socket.id ?? "unknown",
      sentAt: new Date().toISOString()
    };

    const nextHistory = [...getRoomHistory(room), message];
    setRoomHistory(room, nextHistory);
    io.to(room).emit("chat:message", message);

    const typingUsers = typingByRoom.get(room);
    typingUsers?.delete(socket.id);
    emitTyping(room);
  });

  socket.on("counter:update", (value) => {
    sharedCounter = value;
    io.emit("counter:sync", sharedCounter);
  });

  socket.on("typing:start", (room) => {
    const roomUsers = typingByRoom.get(room) ?? new Set<string>();
    roomUsers.add(socket.id ?? "unknown");
    typingByRoom.set(room, roomUsers);
    emitTyping(room);
  });

  socket.on("typing:stop", (room) => {
    const roomUsers = typingByRoom.get(room);
    roomUsers?.delete(socket.id);
    emitTyping(room);
  });

  socket.on("disconnect", () => {
    typingByRoom.forEach((roomUsers, room) => {
      roomUsers.delete(socket.id ?? "");
      emitTyping(room);
    });

    io.emit("presence:update", io.engine.clientsCount);
  });
});

setInterval(() => {
  io.emit("notification:new", createNotification());
}, 8000);

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server listening on http://localhost:${PORT}`);
});
