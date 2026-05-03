import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Šeimos medis",
  description: "Mūsų šeimos istorija",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt">
      <body className={`${inter.className} bg-stone-50 text-stone-900 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
