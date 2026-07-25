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
  ShieldCheck,
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
      { id: "meta-analytics", label: "Meta Analytics", icon: BarChart2 },
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

  const groups = [...NAV_GROUPS];
  if (session?.user?.role === "admin") {
    groups.push({
      title: "ADMINISTRATION",
      items: [
        { id: "admin", label: "Admin Panel", icon: ShieldCheck }
      ]
    });
  }

  return (
    <aside className="w-[80px] lg:w-[280px] bg-[#FAF8F3] border-r-2 border-[#E3DCCF] shadow-xl flex flex-col shrink-0 h-screen sticky top-0 z-50 text-[#1E2330] relative overflow-hidden">
      {/* Binder Holes Decorative Border on Left Edge */}
      <div className="absolute left-1.5 top-0 bottom-0 w-3 flex flex-col justify-around py-6 z-20 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#D4CDBC] border border-[#BDB4A1] shadow-inner" />
        ))}
      </div>

      {/* Header Branding / Blue Tape Label */}
      <div className="p-5 pb-6 pl-7">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Reach.ai" className="w-10 h-10 rounded-xl shadow-md shadow-indigo-500/20 object-cover transform -rotate-3 hover:rotate-0 transition-transform" />
          <div className="hidden lg:block">
            <div className="blue-label-tag px-3 py-1 text-sm inline-block shadow-sm">
              Reach<span className="text-yellow-300">.ai</span>
            </div>
            <p className="text-[10px] font-handwriting text-slate-600 font-bold tracking-wider mt-0.5">Physical Desk Edition</p>
          </div>
        </div>
      </div>

      {/* Navigation Sticker Tabs */}
      <div className="flex-1 px-4 pl-7 space-y-5 overflow-y-auto custom-scroll">
        {groups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            <h3 className="hidden lg:block px-3 text-[10px] font-y2k font-extrabold text-[#788094] uppercase tracking-widest mb-1.5">
              {group.title}
            </h3>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-y2k transition-all duration-200 cursor-pointer group relative ${
                    isActive
                      ? "bg-[#FFE844] text-[#1E2330] font-extrabold shadow-md transform -rotate-1 border border-[#F0D522]"
                      : "text-[#565E73] hover:bg-[#EFEADF] hover:text-[#1E2330]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "scale-110 text-blue-600" : "group-hover:scale-110 text-slate-500"}`} />
                  <span className="hidden lg:block truncate font-bold tracking-tight">{item.label}</span>
                  {isActive && (
                    <span className="hidden lg:block absolute right-2 w-2 h-2 rounded-full bg-blue-600 shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Session & Photo ID Lanyard Card */}
      <div className="p-4 pl-7 border-t border-[#E3DCCF] space-y-3 bg-[#F2EDE1]">
        {session?.user && (
          <div className="hidden lg:flex items-center gap-3 p-2 bg-white rounded-xl border border-[#E3DCCF] shadow-sm transform rotate-1">
            <div className="relative shrink-0">
              {session.user.image ? (
                <img src={session.user.image} alt={session.user.name} className="w-8 h-8 rounded-full border border-blue-500 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs">
                  {session.user.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-y2k font-extrabold text-[#1E2330] truncate">{session.user.name}</p>
              <p className="text-[10px] text-slate-500 truncate font-mono">{session.user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-y2k font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="hidden lg:block truncate">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
