// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dravyasense Dashboard",
  description: "Digital fingerprints for herbal analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen w-full bg-slate-950 text-slate-50",
          inter.className
        )}
      >
        <div className="flex">
          <Sidebar />
          <main className="flex-grow p-4 md:p-8 mt-16 md:mt-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}