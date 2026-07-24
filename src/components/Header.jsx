"use client";

import { Globe, BrainCircuit } from "lucide-react";

export default function Header({ activeTab }) {
  const titles = {
    dashboard: { title: "Command Center", sub: "Real-time marketing intelligence overview" },
    instagram: { title: "Instagram Reach", sub: "Live Meta Graph API metrics & post analytics" },
    discover: { title: "News & Signals", sub: "Trending educational news and viral topics" },
    research: { title: "R&D Lab", sub: "Discover 2026 trends, news, and viral content angles" },
    studio: { title: "Content Studio", sub: "Generate platform-optimized scripts from verified research" },
    approval: { title: "Approval Board", sub: "Review, edit, and publish your content" },
    calendar: { title: "Scheduler", sub: "Plan and track your content calendar" },
    accounts: { title: "Workspace Settings", sub: "Manage API integrations and team accounts" },
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="h-20 border-b-2 border-[#E3DCCF] bg-[#FAF8F3]/90 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40 text-[#1E2330]">
      <div>
        <h2 className="text-xl font-y2k font-extrabold text-[#1E2330] tracking-tight">{current.title}</h2>
        <p className="text-xs font-handwriting text-slate-600 font-bold mt-0.5">{current.sub}</p>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 sticker-highlight-green px-3.5 py-1.5 text-xs">
          <BrainCircuit className="w-4 h-4 text-blue-700" />
          Gemini 3.1 Pro
        </div>
        <div className="hidden md:flex items-center gap-2 sticker-highlight-cyan px-3.5 py-1.5 text-xs">
          <Globe className="w-4 h-4 text-slate-700" />
          India
        </div>
      </div>
    </header>
  );
}
