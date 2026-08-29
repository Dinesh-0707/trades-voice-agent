import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ring — AI Voice Agent for Home Service Trades",
  description:
    "Never miss another job call. Ring answers instantly, triages emergencies, books the job, and syncs to ServiceTitan or Jobber automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
