import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "@/types/next";
import { Server as IOServer } from "socket.io";

/**
 * Configuration for the API route.
 * Disabling bodyParser is necessary for Socket.IO to handle the request properly.
 */
export const config = {
  api: {
    bodyParser: false
  }
};

/**
 * API handler to initialize the Socket.IO server within the Next.js/Node.js environment.
 * This approach (Option A) attaches the Socket.IO server to the existing Next.js HTTP server.
 */
export default function handler(_req: NextApiRequest, res: NextApiResponseServerIO) {
  // Check if the Socket.IO server is already initialized on this server instance
  if (!res.socket.server.io) {
    console.log("Initializing Socket.IO server...");
    
    // Create a new Socket.IO server and attach it to the Next.js server
    const io = new IOServer(res.socket.server, {
      path: "/api/socket_io",
      // Allow all origins for this learning playground (not recommended for production)
      cors: {
        origin: "*"
      }
    });

    // Store the Socket.IO instance on the server object to prevent multiple initializations
    res.socket.server.io = io;
  }

  // End the request; the socket connection will continue through the upgraded protocol
  res.end();
}

