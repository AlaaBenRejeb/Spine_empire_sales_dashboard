"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Target, Calendar, PhoneCall, ArrowUpRight, ArrowDownRight, PieChart } from "lucide-react";
import { useCRM } from "@/context/CRMContext";
import leadsData from "@/data/leads.json";

export default function PerformancePage() {
  const { leadNotes } = useCRM();

  const stats = Object.values(leadNotes);
  const totalDials = stats.filter(s => s.status !== "new").length;
  const totalBooked = stats.filter(s => s.status === "booked").length;
  const totalIgnored = stats.filter(s => s.status === "ignored").length;
  const totalLeads = leadsData.length;

  const conversionRate = totalDials > 0 ? ((totalBooked / totalDials) * 100).toFixed(1) : "0.0";

  const metrics = [
    { label: "Total Target Pool", value: totalLeads, icon: <Target className="text-primary" />, desc: "High-potential chiropractors", trend: "+982" },
    { label: "Outreach Attempts", value: totalDials, icon: <PhoneCall className="text-yellow-500" />, desc: "Total calls made", trend: "+24 today" },
    { label: "Demos Scheduled", value: totalBooked, icon: <Calendar className="text-green-500" />, desc: "Qualified bookings", trend: "+3 today" },
    { label: "Win Rate", value: `${conversionRate}%`, icon: <TrendingUp className="text-purple-500" />, desc: "Conversion optimization", trend: "Elite Frame" }
  ];

  const distribution = [
    { label: "Fresh", count: totalLeads - totalDials, color: "bg-primary" },
    { label: "Called", count: totalDials - totalBooked - totalIgnored, color: "bg-yellow-500" },
    { label: "Booked", count: totalBooked, color: "bg-green-500" },
    { label: "Ignored", count: totalIgnored, color: "bg-red-500" }
  ];

  return (
    <div className="flex-1 flex flex-col gap-8 p-4 md:p-8 overflow-y-auto hide-scrollbar h-screen">
      <header className="flex flex-col">
        <h1 className="text-4xl font-black tracking-tight mb-1">
          Sales <span className="text-primary">Performance</span>
        </h1>
        <p className="text-gray-500 font-bold text-xs tracking-widest uppercase opacity-70">Real-time outreach analytics</p>
      </header>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {metrics.map((m, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 flex flex-col gap-6 group hover:translate-y-[-4px]"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-foreground/5 rounded-2xl group-hover:bg-primary/20 transition-all border border-glass-border">
                {m.icon}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                <ArrowUpRight size={10} /> {m.trend}
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-black mb-1 tracking-tighter">{m.value}</h2>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-2">{m.label}</span>
              <p className="text-[10px] text-gray-400 font-bold opacity-60 leading-tight italic">“{m.desc}”</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Pipeline Distribution Chart */}
        <div className="glass-card p-8 flex flex-col gap-8">
           <div className="flex justify-between items-center">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-3 uppercase">
                 <PieChart className="text-primary" size={20} />
                 Pipeline Volume
              </h3>
           </div>
           
           <div className="flex-1 flex flex-col gap-4">
              {distribution.map((d, idx) => {
                const percentage = totalLeads > 0 ? ((d.count / totalLeads) * 100).toFixed(1) : 0;
                return (
                  <div key={d.label} className="space-y-2 group">
                    <div className="flex justify-between text-xs font-black tracking-tight uppercase">
                      <span className="text-gray-500 group-hover:text-primary transition-colors">{d.label}</span>
                      <span className="text-foreground opacity-80">{d.count} ({percentage}%)</span>
                    </div>
                    <div className="h-3 bg-foreground/5 rounded-full overflow-hidden border border-glass-border shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.5 + idx * 0.1, duration: 1 }}
                        className={`${d.color} h-full rounded-full shadow-[0_0_15px_var(--primary-glow)]`} 
                      />
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Sales Benchmarks */}
        <div className="glass-card p-8 flex flex-col gap-6">
           <h3 className="text-lg font-black tracking-tight flex items-center gap-3 uppercase">
              <TrendingUp className="text-primary" size={20} />
              Outreach Benchmarks
           </h3>
           <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-foreground/5 border border-glass-border flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Calls Per Booking</span>
                    <span className="text-xl font-black">~{totalBooked > 0 ? (totalDials / totalBooked).toFixed(1) : "-"} Dials</span>
                 </div>
                 <div className="bg-primary/20 p-2 rounded-xl border border-primary/20">
                    <PhoneCall size={16} className="text-primary" />
                 </div>
              </div>
              <div className="p-4 rounded-2xl bg-foreground/5 border border-glass-border flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Win Opportunity</span>
                    <span className="text-xl font-black">${(totalBooked * 4000).toLocaleString()} Potential Value</span>
                 </div>
                 <div className="bg-green-500/20 p-2 rounded-xl border border-green-500/20">
                    <ArrowUpRight size={16} className="text-green-500" />
                 </div>
              </div>
              <div className="p-4 rounded-2xl bg-foreground/5 border border-glass-border flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Market Penetration</span>
                    <span className="text-xl font-black">{((totalDials / totalLeads) * 100).toFixed(1)}%</span>
                 </div>
                 <div className="bg-purple-500/20 p-2 rounded-xl border border-purple-500/20">
                    <Target size={16} className="text-purple-500" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
