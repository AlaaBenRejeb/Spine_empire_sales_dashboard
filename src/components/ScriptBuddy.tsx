"use client";

import { useState, useMemo } from "react";
import { MessageSquare, X, ChevronRight, Check, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScriptBuddy({ activeLead }: { activeLead: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const script = useMemo(() => {
    const name = activeLead?.["First Name"] || "the owner";
    const practice = activeLead?.["Practice Name"] || "the clinic";
    const reviews = activeLead?.["Google Reviews"] || "under 76";

    return [
      { 
        label: "Direct to Owner", 
        role: "Alex",
        content: `Hey, am I speaking with ${name}? Perfect — I’ll keep this brief. My name’s Alex. I work with chiropractors who want more consistency in new patient flow.` 
      },
      { 
        label: "Diagnostic", 
        role: "Alex",
        content: `Quick question for you at ${practice} — are you getting most of your new patients from referrals, ads, or a mix? ... And is that actually predictable month to month, or does it fluctuate?` 
      },
      { 
        label: "The Problem", 
        role: "Alex",
        content: `Makes sense. I noticed you currently have ${reviews} reviews. The reason I called is we help clinics like yours make patient flow predictable so you're not just relying on one source.` 
      },
      { 
        label: "The Booking", 
        role: "Alex",
        content: `If I could show you how that would look for ${practice} specifically, would you be open to a quick 10-minute call? I’ve got tomorrow at 11 AM or Thursday at 2 PM. Which works better?` 
      }
    ];
  }, [activeLead]);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-primary text-black p-4 rounded-full shadow-2xl z-50 flex items-center gap-2 font-black"
      >
        <MessageSquare size={20} />
        {!isOpen && <span>Script Buddy</span>}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-8 w-[420px] glass-card p-7 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-primary/50 bg-[#0a0a0acc] backdrop-blur-2xl ring-1 ring-primary/20"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_12px_var(--primary-glow)]" />
                <h2 className="text-primary font-black tracking-widest text-[10px] uppercase glow-text">ELITE BATTLE-CARD</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-7">
              {/* Progress Bar */}
              <div className="flex gap-2">
                {script.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? "bg-primary shadow-[0_0_15px_var(--primary-glow)]" : "bg-white/10"}`} />
                ))}
              </div>

              {/* Data Context Header */}
              {activeLead && (
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                  <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/20 shadow-inner">
                    <User size={16} className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1">Active Call Pipeline</span>
                    <span className="text-sm font-black text-white tracking-tight truncate">{activeLead["Practice Name"]}</span>
                  </div>
                </div>
              )}

              {/* Script Text - Optimized for High Contrast */}
              <div className="min-h-[180px] flex flex-col justify-center">
                <h3 className="text-[10px] text-gray-400 uppercase font-black mb-4 tracking-widest flex items-center gap-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary rounded-lg border border-primary/30 uppercase">{script[currentStep].label}</span>
                </h3>
                <p className="text-white text-xl font-bold leading-relaxed italic border-l-4 border-primary pl-6 drop-shadow-sm shadow-black">
                  "{script[currentStep].content}"
                </p>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t border-white/10">
                <button 
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  className="text-[10px] text-gray-500 hover:text-foreground transition-colors font-black uppercase tracking-widest disabled:opacity-30"
                  disabled={currentStep === 0}
                >
                  PREV
                </button>
                {currentStep < script.length - 1 ? (
                  <button 
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="bg-primary/10 text-primary border border-primary/20 px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-primary hover:text-black transition-all shadow-lg shadow-primary/5"
                  >
                    NEXT STEP <ChevronRight size={14} />
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                        setCurrentStep(0);
                        setIsOpen(false);
                    }}
                    className="bg-green-500 text-black px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-green-500/20"
                  >
                    CLOSE BATTLE-CARD <Check size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
