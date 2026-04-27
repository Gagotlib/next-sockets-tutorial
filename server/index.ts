import { createServer } from "node:http";
import { Server } from "socket.io";

import type {
  ChatMessage,
  ClientToServerEvents,
  NotificationItem,
  ServerToClientEvents
} from "../lib/socket/types";

// Configuration for the Socket.IO server
const PORT = Number(process.env.SOCKET_PORT ?? 3001);
const ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Initialize HTTP server and Socket.IO server with CORS configuration
const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: ORIGIN,
    credentials: true
  }
});

// Server-side state
let sharedCounter = 0; // A counter shared across all connected clients
const messageHistoryByRoom = new Map<string, ChatMessage[]>(); // Stores recent messages per room
const typingByRoom = new Map<string, Set<string>>(); // Tracks users currently typing per room

/**
 * Helper to get the message history for a specific room.
 */
function getRoomHistory(room: string) {
  return messageHistoryByRoom.get(room) ?? [];
}

/**
 * Helper to update and cap the message history for a room (max 20 messages).
 */
function setRoomHistory(room: string, nextMessages: ChatMessage[]) {
  messageHistoryByRoom.set(room, nextMessages.slice(-20));
}

/**
 * Broadcasts the list of typing users in a specific room.
 */
function emitTyping(room: string) {
  const users = Array.from(typingByRoom.get(room) ?? []);
  io.to(room).emit("typing:update", { room, users });
}

/**
 * Generates a random heartbeat notification.
 */
function createNotification(): NotificationItem {
  const now = new Date();

  return {
    id: crypto.randomUUID(),
    title: "Server heartbeat",
    body: "This event was pushed by the Socket.IO server without waiting for an HTTP request.",
    createdAt: now.toISOString()
  };
}

// Main Socket.IO connection handler
io.on("connection", (socket) => {
  // Notify everyone about the new client count
  io.emit("presence:update", io.engine.clientsCount);
  // Send current counter value to the newly connected client
  socket.emit("counter:sync", sharedCounter);

  // Handle room joining
  socket.on("room:join", (room) => {
    socket.join(room);
    // Send existing history to the client joining the room
    socket.emit("chat:history", getRoomHistory(room));
    // Notify others in the room
    io.to(room).emit("room:system", `${socket.id} joined #${room}`);
  });

  // Handle room leaving
  socket.on("room:leave", (room) => {
    socket.leave(room);
    socket.emit("room:system", `You left #${room}`);

    // Remove user from typing list if they were typing
    const typingUsers = typingByRoom.get(room);
    typingUsers?.delete(socket.id);
    emitTyping(room);
  });

  // Handle new chat messages
  socket.on("chat:message", ({ text, room }) => {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      room,
      socketId: socket.id ?? "unknown",
      sentAt: new Date().toISOString()
    };

    // Update history and broadcast the message to the room
    const nextHistory = [...getRoomHistory(room), message];
    setRoomHistory(room, nextHistory);
    io.to(room).emit("chat:message", message);

    // Stop typing indicator when message is sent
    const typingUsers = typingByRoom.get(room);
    typingUsers?.delete(socket.id);
    emitTyping(room);
  });

  // Handle counter updates from clients
  socket.on("counter:update", (value) => {
    sharedCounter = value;
    // Sync the new value to all connected clients
    io.emit("counter:sync", sharedCounter);
  });

  // Handle typing start indicator
  socket.on("typing:start", (room) => {
    const roomUsers = typingByRoom.get(room) ?? new Set<string>();
    roomUsers.add(socket.id ?? "unknown");
    typingByRoom.set(room, roomUsers);
    emitTyping(room);
  });

  // Handle typing stop indicator
  socket.on("typing:stop", (room) => {
    const roomUsers = typingByRoom.get(room);
    roomUsers?.delete(socket.id);
    emitTyping(room);
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    // Clean up typing indicators across all rooms
    typingByRoom.forEach((roomUsers, room) => {
      roomUsers.delete(socket.id ?? "");
      emitTyping(room);
    });

    // Update presence for remaining clients
    io.emit("presence:update", io.engine.clientsCount);
  });
});

// Periodically push simulated notifications to all clients
setInterval(() => {
  io.emit("notification:new", createNotification());
}, 8000);

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server listening on http://localhost:${PORT}`);
});

