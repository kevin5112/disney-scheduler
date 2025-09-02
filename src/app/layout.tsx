import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Disney Schedule to Calendar",
  description: "Created by Kevin Chen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <footer className="w-full text-center text-sm text-gray-500 mt-8 pb-4 space-y-1">
          <div>
            This tool is currently in testing and early development. Features
            may change.
          </div>
          <div>
            © {new Date().getFullYear()} Kevin Chen. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
