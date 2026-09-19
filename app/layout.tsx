import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LOOP — AI Customer-Feedback Intelligence Platform",
  description: "Close the loop on customer feedback with structured AI classification, theme clustering, and grounded Q&A.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-background text-foreground antialiased min-h-screen selection:bg-brand-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
