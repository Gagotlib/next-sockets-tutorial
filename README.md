# Next.js Socket Tutorial

An educational playground for learning WebSockets and Socket.IO with Next.js App Router.

## What are WebSockets

WebSockets create a persistent connection between a client and a server. Instead of making a brand new HTTP request every time the browser wants data, the client and server keep one long-lived connection open and can send messages whenever they need to.

That persistence is what makes real-time experiences possible:

- Chat messages can appear instantly.
- Counters can stay in sync across tabs.
- Servers can push notifications without waiting for a user action.

## WebSockets vs HTTP

HTTP is request-response:

1. The client asks for something.
2. The server responds.
3. The connection work for that request is finished.

WebSockets are different:

1. The client performs an initial handshake.
2. The connection stays open.
3. Both client and server can send data at any time.

HTTP is still the right tool for most pages, forms, and APIs. WebSockets are useful when the value comes from low-latency updates and bidirectional communication.

## What is Socket.IO

Socket.IO is a library built on top of WebSocket-style communication. It adds a friendlier event system and practical features like:

- Automatic reconnection
- Event names and payloads
- Rooms
- Broadcasting helpers
- Fallback transports when WebSocket is not available

## Why Socket.IO instead of raw WebSocket

Raw WebSockets are great for learning the protocol, but Socket.IO is often easier for application development because it gives you a higher-level API.

In this project, Socket.IO makes the teaching examples easier to read:

- `socket.emit("chat:message", payload)`
- `socket.on("chat:message", handler)`
- `io.to(room).emit(...)`

That means we can focus on architecture and event flow instead of writing transport details by hand.

## Architecture options in Next.js

This repo explains two common patterns.

### Option A: Socket.IO inside Next.js

See [pages/api/socket.ts](/C:/Users/gagot/Desktop/Programacion/next-sockets-tutorial/pages/api/socket.ts:1).

This pattern attaches Socket.IO to the underlying HTTP server used by Next.js. It is a common learning setup because everything lives in one app.

Pros:

- Easy to understand
- Fewer moving parts
- Good for demos and local experiments

Cons:

- Harder to scale independently
- Awkward when your WebSocket traffic grows separately from your page traffic
- Not a natural fit for serverless platforms

Important App Router note:

App Router route handlers do not expose the same low-level server access you need for this bootstrap trick, so examples usually rely on a Pages API route for initialization.

### Option B: Separate WebSocket server

See [server/index.ts](/C:/Users/gagot/Desktop/Programacion/next-sockets-tutorial/server/index.ts:1).

This project uses a dedicated Node.js Socket.IO server by default. Next.js serves the UI, and the socket server handles long-lived connections and real-time events.

Pros:

- Clear separation of responsibilities
- Easier to scale and reason about
- Better for persistent real-time workloads
- Simpler mental model for tutorials about sockets

Cons:

- You run two processes in development
- You need to manage CORS and ports

## Why serverless platforms struggle with WebSockets

Traditional serverless functions are designed for short-lived request-response work. They spin up to handle a request and then shut down. WebSockets need the opposite: a stable, long-lived process that can keep connections open and push messages later.

That is why platforms like Vercel are great for the Next.js frontend in this tutorial, but not for hosting the persistent Socket.IO server itself. In practice, teams usually use:

- A separate Node server
- A real-time provider
- A platform designed for long-lived connections

## Explanation of this project

This app contains four demos:

- `/connect`: connect/disconnect manually and inspect socket status and socket ID
- `/chat`: real-time chat, rooms, broadcasts, timestamps, typing indicators, and online user count
- `/counter`: shared state synchronization across clients
- `/notifications`: server-pushed events on a timer

The app uses a `SocketProvider` so the client keeps a single shared connection instead of opening duplicate sockets from multiple components.

## Folder structure explained

```text
app/
  connect/
  chat/
  counter/
  notifications/
components/
  socket-provider.tsx
  site-header.tsx
  ui.tsx
lib/
  socket/
    client.ts
    types.ts
pages/
  api/
    socket.ts
server/
  index.ts
types/
  next.ts
```

- `app/`: App Router pages
- `components/socket-provider.tsx`: React Context for the shared socket connection
- `lib/socket/client.ts`: singleton client socket instance
- `lib/socket/types.ts`: shared event and payload typing
- `pages/api/socket.ts`: Option A example for bootstrapping Socket.IO inside Next.js
- `server/index.ts`: Option B standalone Node.js socket server

## Event system explained

Socket.IO uses named events.

Client to server examples:

- `chat:message`
- `room:join`
- `room:leave`
- `counter:update`
- `typing:start`
- `typing:stop`

Server to client examples:

- `chat:message`
- `chat:history`
- `counter:sync`
- `notification:new`
- `presence:update`
- `room:system`
- `typing:update`

The pattern is simple:

1. A sender emits an event with a payload.
2. The server handles it.
3. The server emits to one client, a room, or everyone.

## Common mistakes

### Multiple connections

If each component creates its own `io(...)` call, you can accidentally open many sockets from one browser tab. That wastes resources and creates confusing duplicate events.

This project avoids that by using a singleton socket client plus a `SocketProvider`.

### Memory leaks

If you add event listeners in React and forget to remove them, each re-render or re-mount can stack another listener.

This project always pairs `socket.on(...)` with cleanup using `socket.off(...)`.

### Re-renders in React

Real-time apps re-render often. Keep state local to the feature that needs it, and subscribe only to the events a page cares about.

### Forgetting room cleanup

If a user leaves a room or navigates away, you should stop treating them as part of that room.

## Running the project

```bash
npm install
npm run dev:all
```

Scripts:

- `npm run dev`: starts the Next.js app
- `npm run socket`: starts the standalone Socket.IO server
- `npm run dev:all`: starts both together

Default ports:

- Next.js: `http://localhost:3000`
- Socket server: `http://localhost:3001`

Optional environment variables:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
SOCKET_PORT=3001
```

## Best way to explore the tutorial

1. Open `/connect` and watch the socket ID appear.
2. Open `/chat` in two tabs and send messages.
3. Join different rooms and verify that messages stay scoped.
4. Open `/counter` in multiple tabs and increment from one tab.
5. Open `/notifications` and wait for server pushes.

## Teaching takeaway

The most important idea is this:

Next.js renders your interface, but real-time features depend on a server process that can keep connections alive. Once you understand that persistent connection requirement, the architecture tradeoffs make much more sense.
