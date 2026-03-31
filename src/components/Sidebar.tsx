"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PhoneCall, Calendar, BarChart3, Settings, LogOut, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Deals Pipeline", href: "/deals", icon: Briefcase },
    { name: "My Calls", href: "/calls", icon: PhoneCall },
    { name: "Performance", href: "/performance", icon: BarChart3 },
    { name: "Bookings", href: "/bookings", icon: Calendar },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col gap-8 h-screen sticky top-0 p-8 border-r border-glass-border bg-background/50 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center border border-white/10 group hover:border-primary transition-all">
          <BarChart3 className="text-black group-hover:scale-110 transition-transform" size={24} />
        </div>
        <span className="text-xl font-black tracking-tighter glow-text uppercase">Spine Empire</span>
      </div>

      <nav className="flex flex-col gap-2 mt-8">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`p-3.5 rounded-xl flex items-center gap-3 font-bold transition-all cursor-pointer ${
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-gray-500 hover:bg-sidebar-item hover:text-foreground border border-transparent"
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        <div className="text-gray-500 p-3.5 rounded-xl flex items-center gap-3 font-bold hover:bg-sidebar-item hover:text-foreground transition-all cursor-pointer">
          <Settings size={20} /> Settings
        </div>
        <div className="text-gray-500 p-3.5 rounded-xl flex items-center gap-3 font-bold hover:bg-red-500/10 hover:text-red-500 transition-all cursor-pointer">
          <LogOut size={20} /> Logout
        </div>
      </div>
    </aside>
  );
}
