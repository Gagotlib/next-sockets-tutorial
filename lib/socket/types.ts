/**
 * Possible connection states for the socket client.
 */
export type SocketStatus = "connected" | "connecting" | "disconnected";

/**
 * Data structure for a chat message.
 */
export type ChatMessage = {
  id: string; // Unique message ID
  text: string; // Content of the message
  room: string; // Destination room
  socketId: string; // ID of the sender's socket
  sentAt: string; // ISO timestamp of when the message was sent
};

/**
 * Data structure for a system notification.
 */
export type NotificationItem = {
  id: string; // Unique notification ID
  title: string; // Notification title
  body: string; // Notification content
  createdAt: string; // ISO timestamp
};

/**
 * Events emitted from the Server and received by the Client.
 */
export type ServerToClientEvents = {
  // Received when a new chat message arrives in the room
  "chat:message": (message: ChatMessage) => void;
  // Received when joining a room to populate initial messages
  "chat:history": (messages: ChatMessage[]) => void;
  // Synchronizes the current counter value across all clients
  "counter:sync": (value: number) => void;
  // Pushed by the server at intervals (simulated live data)
  "notification:new": (notification: NotificationItem) => void;
  // Updates the total number of connected clients
  "presence:update": (count: number) => void;
  // System-level messages (e.g. user joined/left)
  "room:system": (message: string) => void;
  // Updates the list of users currently typing in a room
  "typing:update": (payload: { room: string; users: string[] }) => void;
};

/**
 * Events emitted from the Client and received by the Server.
 */
export type ClientToServerEvents = {
  // Send a new message to a specific room
  "chat:message": (payload: { text: string; room: string }) => void;
  // Request to join a specific room
  "room:join": (room: string) => void;
  // Request to leave a specific room
  "room:leave": (room: string) => void;
  // Inform the server about a counter update
  "counter:update": (value: number) => void;
  // Notify that the user started typing
  "typing:start": (room: string) => void;
  // Notify that the user stopped typing
  "typing:stop": (room: string) => void;
};

