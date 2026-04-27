import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";
import { SocketProvider } from "@/components/socket-provider";
import "./globals.css";

// Metadata for the application, used for SEO and browser tab titles
export const metadata: Metadata = {
  title: "Next.js Socket Tutorial",
  description: "Educational playground for learning WebSockets and Socket.IO with Next.js App Router."
};

/**
 * Root Layout component that defines the base structure of the HTML document.
 * It wraps the entire application with the SocketProvider to ensure that
 * WebSocket functionality is available in every page and component.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Provides the Socket.IO context to the rest of the application */}
        <SocketProvider>
          <SiteHeader />
          <main>{children}</main>
        </SocketProvider>
      </body>
    </html>
  );
}

