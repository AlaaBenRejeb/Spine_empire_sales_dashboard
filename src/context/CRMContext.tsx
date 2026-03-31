"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface CRMContextType {
  activeLead: any;
  setActiveLead: (lead: any) => void;
  leadNotes: Record<string, any>;
  updateLeadNote: (email: string, updates: any) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [activeLead, setActiveLead] = useState<any>(null);
  const [leadNotes, setLeadNotes] = useState<Record<string, any>>({});

  useEffect(() => {
    const saved = localStorage.getItem("spine-empire-lead-notes");
    if (saved) setLeadNotes(JSON.parse(saved));
  }, []);

  const updateLeadNote = (email: string, updates: any) => {
    const updated = { 
      ...leadNotes, 
      [email]: { ...(leadNotes[email] || { status: "new", comment: "" }), ...updates } 
    };
    setLeadNotes(updated);
    localStorage.setItem("spine-empire-lead-notes", JSON.stringify(updated));
  };

  return (
    <CRMContext.Provider value={{ activeLead, setActiveLead, leadNotes, updateLeadNote }}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
}
