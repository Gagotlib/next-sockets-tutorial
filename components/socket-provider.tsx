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

type SocketContextValue = {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  socketId: string | null;
  status: SocketStatus;
  connect: () => void;
  disconnect: () => void;
};

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket] = useState(() => getSocket());
  const [status, setStatus] = useState<SocketStatus>("disconnected");
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    const handleConnect = () => {
      setStatus("connected");
      setSocketId(socket.id ?? null);
    };

    const handleDisconnect = () => {
      setStatus("disconnected");
      setSocketId(null);
    };

    const handleConnectError = () => {
      setStatus("disconnected");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [socket]);

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

export function useSocket() {
  const value = useContext(SocketContext);

  if (!value) {
    throw new Error("useSocket must be used inside SocketProvider");
  }

  return value;
}
