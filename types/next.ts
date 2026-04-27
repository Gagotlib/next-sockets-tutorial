import type { Server as HTTPServer } from "node:http";
import type { Socket } from "node:net";

import type { NextApiResponse } from "next";
import type { Server as IOServer } from "socket.io";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: HTTPServer & {
      io?: IOServer;
    };
  };
};
