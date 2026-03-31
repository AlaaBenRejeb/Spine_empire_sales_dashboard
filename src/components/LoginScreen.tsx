"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, Zap } from "lucide-react";

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "0000" && password === "0000") {
      onLogin();
    } else {
      setError("INVALID CREDENTIALS");
      setTimeout(() => setError(""), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 h-screen relative bg-[#0a0a0a] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card p-12 flex flex-col items-center gap-8 bg-black/80 border-2 border-glass-border w-full max-w-[480px] z-10 shadow-2xl rounded-3xl"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(255,255,255,0.05)] mb-4">
          <Lock size={40} className="text-primary animate-pulse" />
        </div>

        <div className="flex flex-col items-center gap-2 text-center w-full">
          <span className="text-[10px] text-primary font-black uppercase tracking-[0.4em] mb-2">Restricted Access</span>
          <h1 className="text-4xl font-heading font-black tracking-tighter uppercase leading-none">
            Setter <span className="text-primary italic">Vault.</span>
          </h1>
          <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-60 mt-2">
            Spine Empire Outbound Engine
          </p>
        </div>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-6 mt-6">
          <div className="flex flex-col gap-5">
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/60 border-2 border-glass-border rounded-xl py-5 px-6 text-sm font-black tracking-widest uppercase focus:border-primary focus:shadow-[0_0_15px_rgba(255,255,255,0.1)] outline-none transition-all placeholder:opacity-30"
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/60 border-2 border-glass-border rounded-xl py-5 px-6 text-sm font-black tracking-widest uppercase focus:border-primary focus:shadow-[0_0_15px_rgba(255,255,255,0.1)] outline-none transition-all placeholder:opacity-30"
            />
          </div>

          <div className="h-4 flex items-center justify-center">
            {error && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <Zap size={12} /> {error}
              </motion.span>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-primary text-black font-black text-sm uppercase tracking-[0.2em] py-5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 mt-4"
          >
            Authenticate <ShieldCheck size={20} strokeWidth={3} />
          </button>
        </form>

        <div className="pt-8 w-full flex items-center justify-center border-t border-glass-border opacity-30">
           <span className="text-[9px] uppercase tracking-[0.3em] font-black italic">V. 1.0.0_SETTER</span>
        </div>
      </motion.div>
    </div>
  );
}
