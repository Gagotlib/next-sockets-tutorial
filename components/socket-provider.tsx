"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import type { Socket } from "socket.io-client";

import { getSocket } from "@/lib/socket/client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketStatus
} from "@/lib/socket/types";

/**
 * Interface representing the values exposed by the SocketContext.
 */
type SocketContextValue = {
  // The actual socket instance
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  // Unique identifier for the current connection
  socketId: string | null;
  // Current connection status (connected, connecting, disconnected)
  status: SocketStatus;
  // Function to manually initiate connection
  connect: () => void;
  // Function to manually disconnect
  disconnect: () => void;
};

// Create a context to provide socket functionality throughout the application
const SocketContext = createContext<SocketContextValue | null>(null);

/**
 * SocketProvider component that wraps the application and manages the lifecycle
 * of the Socket.IO connection.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  // Initialize the socket instance using a singleton pattern
  const [socket] = useState(() => getSocket());
  const [status, setStatus] = useState<SocketStatus>("disconnected");
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    // Handler for successful connection
    const handleConnect = () => {
      setStatus("connected");
      setSocketId(socket.id ?? null);
    };

    // Handler for disconnection
    const handleDisconnect = () => {
      setStatus("disconnected");
      setSocketId(null);
    };

    // Handler for connection errors
    const handleConnectError = () => {
      setStatus("disconnected");
    };

    // Register event listeners on the socket instance
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    // If the socket is already connected (e.g. from a previous mount), trigger handleConnect
    if (socket.connected) {
      handleConnect();
    }

    // Cleanup listeners when the provider unmounts to prevent memory leaks
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [socket]);

  // Value object to be passed down through the context
  const value: SocketContextValue = {
    socket,
    socketId,
    status,
    connect: () => {
      if (socket.connected) {
        return;
      }

      setStatus("connecting");
      socket.connect();
    },
    disconnect: () => {
      socket.disconnect();
      setStatus("disconnected");
      setSocketId(null);
    }
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

/**
 * Custom hook to easily access the socket context.
 * Throws an error if used outside of a SocketProvider.
 */
export function useSocket() {
  const value = useContext(SocketContext);

  if (!value) {
    throw new Error("useSocket must be used inside SocketProvider");
  }

  return value;
}
