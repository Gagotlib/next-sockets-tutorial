export type SocketStatus = "connected" | "connecting" | "disconnected";

export type ChatMessage = {
  id: string;
  text: string;
  room: string;
  socketId: string;
  sentAt: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export type ServerToClientEvents = {
  "chat:message": (message: ChatMessage) => void;
  "chat:history": (messages: ChatMessage[]) => void;
  "counter:sync": (value: number) => void;
  "notification:new": (notification: NotificationItem) => void;
  "presence:update": (count: number) => void;
  "room:system": (message: string) => void;
  "typing:update": (payload: { room: string; users: string[] }) => void;
};

export type ClientToServerEvents = {
  "chat:message": (payload: { text: string; room: string }) => void;
  "room:join": (room: string) => void;
  "room:leave": (room: string) => void;
  "counter:update": (value: number) => void;
  "typing:start": (room: string) => void;
  "typing:stop": (room: string) => void;
};
