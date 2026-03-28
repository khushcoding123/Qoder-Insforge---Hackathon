import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumen - Learn to Trade. Think Like a Strategist.",
  description:
    "Lumen is an educational trading platform powered by AI. Learn market structure, build strategies, practice with a coach, and reflect on your journal entries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#0A0A0F] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
