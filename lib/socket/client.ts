"use client";

import { io, type Socket } from "socket.io-client";

import type { ClientToServerEvents, ServerToClientEvents } from "@/lib/socket/types";

/**
 * Singleton instance of the Socket.IO client.
 * This ensures that only one connection is shared across the entire application.
 */
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

/**
 * Returns the existing socket instance or creates a new one if it doesn't exist.
 * Configures the connection with the server URL and preferred transports.
 */
export function getSocket() {
  if (!socket) {
    // Initialize the socket with the URL from environment variables or a fallback
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001", {
      // Prevent automatic connection on initialization to allow manual control
      autoConnect: false,
      // Specify transports to ensure compatibility and performance
      transports: ["websocket", "polling"]
    });
  }

  return socket;
}

