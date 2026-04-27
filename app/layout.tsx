import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";
import { SocketProvider } from "@/components/socket-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js Socket Tutorial",
  description: "Educational playground for learning WebSockets and Socket.IO with Next.js App Router."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SocketProvider>
          <SiteHeader />
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
