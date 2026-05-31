"use client";

import { 
  Home, 
  Search, 
  BarChart2, 
  Microscope, 
  Video, 
  ListChecks, 
  BrainCircuit, 
  Calendar, 
  Settings,
  LogOut 
} from "lucide-react";
import { Instagram } from "./InstagramIcon";

import { signOut, useSession } from "next-auth/react";

const NAV_GROUPS = [
  {
    title: "ANALYTICS",
    items: [
      { id: "dashboard", label: "Executive Hub", icon: Home },
      { id: "instagram", label: "Instagram Reach", icon: Instagram },
      { id: "discover", label: "News & Signals", icon: Search },
    ]
  },
  {
    title: "PRODUCTION",
    items: [
      { id: "research", label: "R&D Lab", icon: Microscope },
      { id: "studio", label: "Content Studio", icon: Video },
      { id: "calendar", label: "Scheduler", icon: Calendar },
    ]
  },
  {
    title: "MANAGEMENT",
    items: [
      { id: "approval", label: "Approval Board", icon: ListChecks },
      { id: "accounts", label: "Workspace settings", icon: Settings },
    ]
  }
];

export default function Sidebar({ activeTab, onTabChange }) {
  const { data: session } = useSession();

  const handleLogout = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await signOut({ callbackUrl: "/login" });
    }
  };

  return (
    <aside className="w-[80px] lg:w-[280px] bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-screen sticky top-0 z-50 text-slate-300">
      {/* Branding */}
      <div className="p-6 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 transition-transform hover:scale-105">
            <BrainCircuit className="w-7 h-7" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-[18px] font-black text-white tracking-tighter leading-none">
              Reach<span className="text-indigo-400">.ai</span>
            </h1>
            <p className="text-[10px] text-indigo-400 uppercase tracking-[0.2em] font-black mt-2">SaaS SUITE</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 space-y-6 overflow-y-auto custom-scroll">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1.5">
            <h3 className="hidden lg:block px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
              {group.title}
            </h3>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[13px] transition-all duration-200 cursor-pointer group relative ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 font-bold"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 transition-all ${isActive ? "scale-110 text-white" : "group-hover:scale-110 text-slate-400 group-hover:text-white"}`} />
                  <span className="hidden lg:block truncate tracking-tight font-bold">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Session & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-4">
        {session?.user && (
          <div className="hidden lg:flex items-center gap-3 px-2">
            {session.user.image ? (
              <img src={session.user.image} alt={session.user.name} className="w-9 h-9 rounded-full border border-slate-700" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-white truncate">{session.user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{session.user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-all cursor-pointer font-bold"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          <span className="hidden lg:block truncate tracking-tight">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
