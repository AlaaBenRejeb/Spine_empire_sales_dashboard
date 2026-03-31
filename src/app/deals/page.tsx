"use client";

import { motion } from "framer-motion";
import { Briefcase, MoreHorizontal, ChevronRight, Filter, Search, Plus } from "lucide-react";
import { useCRM } from "@/context/CRMContext";
import leadsData from "@/data/leads.json";

const COLUMNS = [
  { id: "new", title: "Fresh Leads", color: "bg-primary" },
  { id: "called", title: "In Progress", color: "bg-yellow-500" },
  { id: "booked", title: "Demos Booked", color: "bg-green-500" },
  { id: "ignored", title: "Closed/Archive", color: "bg-red-500" }
];

export default function DealsPage() {
  const { leadNotes, updateLeadNote, setActiveLead } = useCRM();

  const getLeadsByStatus = (status: string) => {
    return leadsData.filter((lead) => {
      const notes = leadNotes[lead.Email];
      const leadStatus = notes?.status || "new";
      return leadStatus === status;
    }).slice(0, 50); // Performance limit
  };

  return (
    <div className="flex-1 flex flex-col gap-8 p-4 md:p-8 overflow-hidden h-screen">
      <header className="flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black tracking-tight mb-1">
            Visual <span className="text-primary">Pipeline</span>
          </h1>
          <p className="text-gray-500 font-bold text-xs tracking-widest uppercase opacity-70">Manage your deals at a glance</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Filter deals..." 
              className="bg-glass border border-glass-border pl-10 pr-4 py-2 rounded-xl text-xs focus:ring-1 focus:ring-primary outline-none transition-all w-64"
            />
          </div>
          <button className="bg-primary text-black font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
            <Plus size={16} /> New Deal
          </button>
        </div>
      </header>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-6 pb-4 hide-scrollbar">
        {COLUMNS.map((col) => (
          <div key={col.id} className="min-w-[320px] w-full flex flex-col gap-4">
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${col.color} animate-pulse`} />
                <h3 className="font-black text-xs tracking-widest uppercase opacity-80">{col.title}</h3>
                <span className="bg-foreground/5 text-[10px] font-bold px-2 py-0.5 rounded-full border border-glass-border">
                  {getLeadsByStatus(col.id).length}
                </span>
              </div>
              <button className="text-gray-500 hover:text-white transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </div>

            <div className="flex-1 bg-foreground/5 rounded-2xl border border-glass-border p-4 flex flex-col gap-4 overflow-y-auto hide-scrollbar hover:border-primary/20 transition-all">
              {getLeadsByStatus(col.id).map((lead, idx) => (
                <motion.div
                  key={lead.Email}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setActiveLead(lead)}
                  className="glass-card p-5 cursor-pointer hover:border-primary/50 group relative"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-primary font-black uppercase tracking-tight">{lead.City}</span>
                      <ChevronRight size={14} className="text-gray-500 group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="font-black text-sm group-hover:text-primary transition-colors leading-tight">
                      {lead["Practice Name"]}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                       <Briefcase size={12} className="opacity-50" />
                       <span>{lead["First Name"]} (Owner)</span>
                    </div>
                  </div>

                  {leadNotes[lead.Email]?.comment && (
                    <div className="mt-3 pt-3 border-t border-glass-border text-[10px] text-gray-400 italic font-medium line-clamp-2">
                      “{leadNotes[lead.Email].comment}”
                    </div>
                  )}

                  {/* Visual Progress Marker */}
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${col.color}`} />
                </motion.div>
              ))}
              
              {getLeadsByStatus(col.id).length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-20 filter grayscale">
                   <Briefcase size={40} className="mb-3" />
                   <span className="text-xs font-bold uppercase tracking-widest">No deals in this stage</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
