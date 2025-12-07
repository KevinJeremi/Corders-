import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "CCTV Analytics Dashboard",
  description: "Advanced surveillance monitoring system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-background text-foreground flex h-screen overflow-hidden">
        <Providers>
          <Sidebar />
          <div className="flex-1 flex flex-col ml-64">
            <Header />
            <main className="flex-1 overflow-auto p-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
