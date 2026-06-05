import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Job Board",
  description: "Find your next role — recruiters and job seekers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
