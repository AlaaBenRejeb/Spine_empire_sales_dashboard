"use client";

import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import ScriptBuddy from "@/components/ScriptBuddy";
import { ThemeProvider } from "@/context/ThemeContext";
import { CRMProvider, useCRM } from "@/context/CRMContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

function AppLayout({ children }: { children: React.ReactNode }) {
  const { activeLead } = useCRM();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  
  // Hide dashboard layout on auth/join pages
  const isAuthPage = typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/join') || 
      window.location.pathname.startsWith('/auth/signup')
  );

  if (isAuthPage) return <>{children}</>;

  return (
    <div className="flex bg-background min-h-screen">
      <MobileHeader 
        isOpen={isMobileMenuOpen} 
        onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />
      
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col pt-16 lg:pt-0">
        <main className="flex-1">
          {children}
        </main>
      </div>
      <ScriptBuddy activeLead={activeLead} />
    </div>
  );
}

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full antialiased`}>
      <head>
        <title>Setter Spine Empire</title>
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider portalType="setter">
            <CRMProvider>
              <AppLayout>{children}</AppLayout>
            </CRMProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
