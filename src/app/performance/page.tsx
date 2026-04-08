"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Calendar,
  MessageSquare,
  PhoneCall,
  PieChart,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useCRM } from "@/context/CRMContext";
import { calculateSetterActionMetrics } from "@/lib/performanceUtils";
import type { Timeframe } from "@/lib/timeframe";

export default function PerformancePage() {
  const { interactions, statusEvents, user } = useCRM();
  const [timeframe, setTimeframe] = useState<Timeframe>("all");

  const actionMetrics = useMemo(() => {
    if (!user?.id) {
      return calculateSetterActionMetrics([], [], "", timeframe);
    }
    return calculateSetterActionMetrics(interactions, statusEvents, user.id, timeframe);
  }, [interactions, statusEvents, timeframe, user?.id]);

  const distribution = [
    { label: "Calls", count: actionMetrics.callsPlaced, color: "bg-yellow-500" },
    { label: "Messages", count: actionMetrics.messagesSent, color: "bg-primary" },
    { label: "Booked", count: actionMetrics.demosBooked, color: "bg-green-500" },
    { label: "Ignored", count: actionMetrics.ignored, color: "bg-red-500" },
  ];

  const metrics = [
    { label: "Leads Worked", value: actionMetrics.leadsWorked.toLocaleString(), icon: <Target className="text-primary" />, desc: "Unique leads touched in timeframe", trend: "Action" },
    { label: "Calls Placed", value: actionMetrics.callsPlaced.toLocaleString(), icon: <PhoneCall className="text-yellow-500" />, desc: "Exact call events logged", trend: "Dial" },
    { label: "Demos Booked", value: actionMetrics.demosBooked.toLocaleString(), icon: <Calendar className="text-green-500" />, desc: "Booked stage events created", trend: "Booked" },
    { label: "Book Rate", value: `${actionMetrics.bookRate.toFixed(1)}%`, icon: <TrendingUp className="text-purple-500" />, desc: "Bookings per call in timeframe", trend: "Rate" },
  ];

  const callsPerBook = actionMetrics.demosBooked > 0 ? actionMetrics.callsPlaced / actionMetrics.demosBooked : 0;
  const messageMix = actionMetrics.actionTotal > 0 ? (actionMetrics.messagesSent / actionMetrics.actionTotal) * 100 : 0;
  const powerScore = actionMetrics.powerScore;
  const noEventHistory = actionMetrics.actionTotal === 0;

  return (
    <div className="flex-1 flex flex-col gap-10 p-8 md:p-12 overflow-y-auto hide-scrollbar h-screen bg-transparent">
      <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-col gap-2">
          <motion.h1
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl font-heading font-black tracking-tighter uppercase leading-none"
          >
            Sales <span className="text-gradient">Performance.</span>
          </motion.h1>
          <p className="text-muted-foreground font-black text-[10px] tracking-[0.5em] uppercase opacity-40 ml-1">
            Local-time setter action analytics
          </p>
        </div>

        <div className="flex flex-col items-start xl:items-end gap-3">
          {noEventHistory && (
            <div className="px-4 py-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 text-[8px] font-black uppercase tracking-[0.32em] text-amber-200">
              Event history starts from this rollout
            </div>
          )}
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
            {(["today", "month", "all"] as Timeframe[]).map((value) => (
              <button
                key={value}
                onClick={() => setTimeframe(value)}
                className={`px-6 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                  timeframe === value ? "bg-white text-black" : "text-white/40 hover:text-white"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, duration: 0.6, ease: "easeOut" }}
            className="glass-card p-10 flex flex-col gap-8 group hover:translate-y-[-10px] bg-secondary/20"
          >
            <div className="flex justify-between items-start">
              <div className="p-5 bg-black text-white dark:bg-white dark:text-black rounded-2xl shadow-xl transition-all border-2 border-black/10">
                {metric.icon}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-green-500 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20 shadow-sm transition-all group-hover:scale-105">
                <ArrowUpRight size={12} strokeWidth={4} /> {metric.trend}
              </div>
            </div>
            <div>
              <div className="text-5xl font-heading font-black mb-2 tracking-tighter group-hover:text-primary transition-colors">{metric.value}</div>
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] block mb-3 opacity-60 italic">{metric.label}</span>
              <p className="text-[10px] text-black/40 dark:text-white/40 font-bold leading-tight uppercase font-heading">DATA: {metric.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-10 mb-20 animate-float flex-1">
        <div className="col-span-12 glass-card p-12 bg-white text-black flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group border-none shadow-[0_0_50px_rgba(255,255,255,0.05)]">
          <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform">
            <Trophy size={240} strokeWidth={4} />
          </div>

          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Action Execution Performance</span>
            </div>
            <h2 className="text-5xl font-heading font-black tracking-tighter uppercase italic">Current Power <span className="opacity-20 italic">/</span> Score.</h2>
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Node Rank</span>
                <span className="text-2xl font-heading font-black italic text-emerald-600">{powerScore >= 80 ? "Elite" : powerScore >= 50 ? "Standard" : "Initial"}</span>
              </div>
              <div className="w-px h-10 bg-black/5" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Frame Focus</span>
                <span className="text-2xl font-heading font-black italic text-black">{timeframe === "all" ? "Full history" : timeframe}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md w-full flex flex-col gap-5 relative z-10 text-right">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Action sync status</span>
              <div className="flex items-center gap-2">
                <span className="text-5xl font-heading font-black tracking-tighter italic leading-none">{powerScore}</span>
                <span className="text-[10px] font-black tracking-[0.3em] opacity-20 uppercase">XP/100</span>
              </div>
            </div>
            <div className="h-4 w-full bg-black/5 rounded-full p-1 border border-black/5 overflow-hidden shadow-inner flex items-center">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${powerScore}%` }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full ${powerScore >= 80 ? "bg-emerald-500" : "bg-black"} rounded-full shadow-[0_0_20px_rgba(0,0,0,0.1)]`}
              />
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 glass-card p-12 flex flex-col gap-10 bg-secondary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
            <PieChart size={300} strokeWidth={4} />
          </div>
          <div className="flex justify-between items-center relative z-10">
            <h3 className="text-2xl font-heading font-black tracking-tight flex items-center gap-5 uppercase leading-none italic underline decoration-primary/50 underline-offset-[12px]">
              <Activity className="text-primary" size={32} />
              ACTION DISTRIBUTION
            </h3>
          </div>

          <div className="flex-1 flex flex-col gap-8 relative z-10">
            {distribution.map((item, idx) => {
              const percentage = actionMetrics.actionTotal > 0 ? ((item.count / actionMetrics.actionTotal) * 100).toFixed(1) : "0.0";
              return (
                <div key={item.label} className="space-y-3 group">
                  <div className="flex justify-between text-xs font-black tracking-[0.2em] uppercase">
                    <span className="text-muted-foreground group-hover:text-primary transition-colors italic">{item.label}</span>
                    <span className="text-foreground opacity-80">{item.count} ({percentage}%)</span>
                  </div>
                  <div className="h-4 bg-black/5 dark:bg-white/5 p-1 rounded-none border-2 border-black/10 overflow-hidden shadow-inner flex items-center">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.5 + idx * 0.1, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                      className={`${item.color} h-full rounded-none border border-black/20`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 glass-card p-12 flex flex-col gap-10 bg-secondary/30">
          <h3 className="text-2xl font-heading font-black tracking-tight flex items-center gap-5 uppercase leading-none italic underline decoration-primary/50 underline-offset-[12px]">
            <TrendingUp className="text-primary" size={32} />
            SETTER BENCHMARKS
          </h3>
          <div className="space-y-6 flex-1 flex flex-col justify-center">
            <div className="p-8 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border-2 border-glass-border flex justify-between items-center group hover:border-primary/30 transition-all">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mb-2">Efficiency Rating</span>
                <span className="text-4xl font-heading font-black italic tracking-tighter group-hover:text-primary transition-colors">
                  ~{actionMetrics.demosBooked > 0 ? callsPerBook.toFixed(1) : "0.0"} CALLS/BOOK
                </span>
              </div>
              <div className="bg-primary/20 p-5 rounded-2xl border-2 border-primary/20 shadow-xl group-hover:bg-primary group-hover:text-black transition-all">
                <PhoneCall size={28} />
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border-2 border-glass-border flex justify-between items-center group hover:border-green-500/30 transition-all">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mb-2">Booked Projection</span>
                <span className="text-4xl font-heading font-black italic tracking-tighter group-hover:text-green-500 transition-colors">
                  ${actionMetrics.projectedRevenue.toLocaleString()}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-2">
                  {actionMetrics.bookedWithoutValue} booked without value snapshot
                </span>
              </div>
              <div className="bg-green-500/20 p-5 rounded-2xl border-2 border-green-500/20 shadow-xl group-hover:bg-green-500 group-hover:text-black transition-all">
                <Zap size={28} />
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border-2 border-glass-border flex justify-between items-center group hover:border-amber-400/30 transition-all">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mb-2">Follow-through Mix</span>
                <span className="text-4xl font-heading font-black italic tracking-tighter group-hover:text-amber-400 transition-colors">
                  {messageMix.toFixed(1)}% MESSAGE MIX
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-2">
                  {actionMetrics.messagesSent} messages / {actionMetrics.ignored} ignored
                </span>
              </div>
              <div className="bg-amber-400/20 p-5 rounded-2xl border-2 border-amber-400/20 shadow-xl group-hover:bg-amber-400 group-hover:text-black transition-all">
                <MessageSquare size={28} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
