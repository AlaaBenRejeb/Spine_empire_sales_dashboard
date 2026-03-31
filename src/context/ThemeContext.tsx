"use client";

import React, { createContext, useContext } from "react";

interface ThemeContextType {
  theme: "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Permanent Obsidian Mode
  const theme = "dark";
  const toggleTheme = () => console.log("Obsidian Mode is Permanent.");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="dark contents">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
