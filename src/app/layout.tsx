"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ScriptBuddy from "@/components/ScriptBuddy";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { CRMProvider, useCRM } from "@/context/CRMContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function AppLayout({ children }: { children: React.ReactNode }) {
  const { activeLead } = useCRM();
  
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        {children}
      </div>
      <ScriptBuddy activeLead={activeLead} />
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body>
        <ThemeProvider>
          <CRMProvider>
            <AppLayout>{children}</AppLayout>
          </CRMProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
