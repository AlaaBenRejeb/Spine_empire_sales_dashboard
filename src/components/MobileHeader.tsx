"use client";

import { Menu, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function MobileHeader({ isOpen, onToggle }: MobileHeaderProps) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-glass-border z-[60] flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-black text-white dark:bg-white dark:text-black rounded-lg flex items-center justify-center border border-black shadow-sm">
          <Zap size={16} strokeWidth={2.5} />
        </div>
        <span className="text-sm font-heading font-bold uppercase tracking-tight italic">Spine Engine</span>
      </div>

      <button 
        onClick={onToggle}
        className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </header>
  );
}
