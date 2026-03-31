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
        className="fixed bottom-8 right-8 bg-black text-white p-5 rounded-none border-4 border-white shadow-2xl z-50 flex items-center gap-2 font-black uppercase text-xs tracking-widest"
      >
        <MessageSquare size={20} />
        {!isOpen && <span>Launch Battle-Card</span>}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-8 w-[480px] p-10 z-50 shadow-[0_30px_80px_rgba(0,0,0,0.8)] bg-white border-[6px] border-black rounded-none ring-[12px] ring-black/5"
          >
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-black rounded-none animate-pulse border-2 border-white" />
                <h2 className="text-black font-black tracking-[0.3em] text-xs uppercase">ELITE BATTLE-CARD v2.0</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-black hover:text-red-600 transition-colors p-2">
                <X size={32} strokeWidth={3} />
              </button>
            </div>

            <div className="space-y-10">
              {/* Progress Bar */}
              <div className="flex gap-2">
                {script.map((_, i) => (
                  <div key={i} className={`h-4 flex-1 rounded-none transition-all duration-300 ${i <= currentStep ? "bg-black" : "bg-black/10"}`} />
                ))}
              </div>

              {/* Data Context Header */}
              {activeLead && (
                <div className="bg-black text-white p-6 border-4 border-black flex items-center gap-6 shadow-xl">
                  <div className="bg-white text-black p-4">
                    <User size={24} strokeWidth={3} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white font-black uppercase tracking-[0.2em] leading-none mb-2 opacity-80">ACTIVE PIPELINE CONTEXT</span>
                    <span className="text-xl font-black tracking-tight truncate uppercase italic">{activeLead["Practice Name"]}</span>
                  </div>
                </div>
              )}

              {/* Script Text - Optimized for EXTREME Contrast */}
              <div className="min-h-[260px] flex flex-col justify-center bg-black/5 p-8 border-2 border-black/10">
                <h3 className="text-xs text-black uppercase font-black mb-6 tracking-[0.4em] flex items-center gap-3">
                  <span className="px-4 py-2 bg-black text-white uppercase text-xs">STEP {currentStep + 1}: {script[currentStep].label}</span>
                </h3>
                <p className="text-black text-3xl font-black leading-tight italic border-l-[16px] border-black pl-10 tracking-tight">
                   "{script[currentStep].content}"
                </p>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-10 border-t-[6px] border-black">
                <button 
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  className="text-sm text-black hover:bg-black hover:text-white px-6 py-2 transition-all font-black uppercase tracking-widest disabled:opacity-10 underline decoration-black underline-offset-8"
                  disabled={currentStep === 0}
                >
                  PREV
                </button>
                {currentStep < script.length - 1 ? (
                  <button 
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="bg-black text-white px-12 py-5 font-black text-base flex items-center gap-4 hover:bg-green-600 transition-all active:scale-95 shadow-2xl uppercase tracking-widest"
                  >
                    NEXT STEP <ChevronRight size={20} strokeWidth={3} />
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                        setCurrentStep(0);
                        setIsOpen(false);
                    }}
                    className="bg-green-500 text-black px-12 py-5 font-black text-base flex items-center gap-4 hover:bg-green-400 transition-all border-[6px] border-black shadow-2xl uppercase tracking-widest"
                  >
                    FINISH CALL <Check size={24} strokeWidth={4} />
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
