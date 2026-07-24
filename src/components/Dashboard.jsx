"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Compass,
  Eye,
  Flame,
  Layers3,
  Microscope,
  MoveRight,
  Radar,
  Sparkles,
  Target,
  TrendingUp,
  Video,
} from "lucide-react";
import MorningBriefing from "./MorningBriefing";
import { useContentHistory, usePerformanceInsights, useResearchHistory, useSettingsSnapshot, useStats } from "@/lib/storage";

const FALLBACK_SIGNALS = [
  "Parent trust content is outperforming generic school promotion.",
  "Short-form explainers keep winning when tied to a local policy or pain point.",
  "Approval-stage bottlenecks are more visible than creation bottlenecks.",
  "Topics with clearer hooks convert into scripts faster than broad institution posts.",
];

const STATUS_STYLES = {
  pending: "sticker-highlight-orange",
  approved: "sticker-highlight-green",
  published: "blue-label-tag",
};

export default function Dashboard({ onNavigate, onStartResearch, onGoToStudio }) {
  const stats = useStats();
  const settings = useSettingsSnapshot();
  const researchHistory = useResearchHistory();
  const contentHistory = useContentHistory();
  const performance = usePerformanceInsights();
  const [activeSignal, setActiveSignal] = useState(0);

  const latestContent = useMemo(() => contentHistory.slice(0, 3), [contentHistory]);

  const signalFeed = useMemo(() => {
    const dynamicSignals = researchHistory
      .slice(0, 6)
      .map((item) => item.research?.recommendedStrategy?.bestAngle || item.research?.executiveSummary || item.keyword)
      .filter(Boolean);

    return dynamicSignals.length ? dynamicSignals : FALLBACK_SIGNALS;
  }, [researchHistory]);

  const priorityQueue = useMemo(() => {
    return researchHistory
      .filter((item) => (item.status || "pending") !== "published")
      .slice(0, 4);
  }, [researchHistory]);

  const topContent = performance.topContent.slice(0, 3);
  const platformPerformance = [...performance.platformPerformance]
    .sort((a, b) => b.totalClicks - a.totalClicks)
    .slice(0, 3);

  useEffect(() => {
    if (signalFeed.length <= 1) return undefined;
    const interval = setInterval(() => {
      setActiveSignal((current) => (current + 1) % signalFeed.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [signalFeed]);

  return (
    <div className="min-h-screen bg-desk-canvas p-6 lg:p-10 xl:p-12 max-w-[1600px] mx-auto space-y-10 animate-fade-in font-sans">
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Main Hero Binder Paper */}
        <div className="xl:col-span-8 paper-sheet-binder p-8 lg:p-10 xl:p-12 overflow-hidden relative shadow-2xl group border-2 border-[#E3DCCF]">
          {/* Top Perforated Binder Holes */}
          <div className="absolute top-0 left-0 right-0 h-6 paper-binder-holes opacity-70" />

          <div className="relative z-10 space-y-8 mt-2">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="blue-label-tag inline-flex items-center gap-2 px-4 py-1.5 text-xs tracking-wide shadow-md transform -rotate-1">
                  <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                  EXECUTIVE DESK HUB
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl xl:text-5xl font-y2k font-extrabold tracking-tight text-[#1E2330]">
                    {settings.schoolName}
                    <span className="block mt-1 font-handwriting text-2xl md:text-3xl text-blue-600 font-bold">
                      Institutional intelligence, staged for action.
                    </span>
                  </h1>
                  <p className="max-w-xl text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                    {settings.schoolVision}. The hub displays live research momentum, production pressure, and performance signals so leadership can decide what to publish next.
                  </p>
                </div>
              </div>

              {/* Mini Post-It Radar Note */}
              <div className="min-w-[250px] max-w-[280px] post-it-yellow p-5 relative transform rotate-2 shadow-lg hover:rotate-0 transition-transform">
                <div className="tape-overlay" />
                <div className="flex items-center justify-between gap-3 relative z-10">
                  <div>
                    <p className="text-[10px] font-y2k font-black uppercase tracking-wider text-slate-700">Signal Radar</p>
                    <p className="mt-1 font-handwriting text-base font-bold text-slate-900 leading-tight">Attention is shifting toward clarity & trust.</p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-300 border border-yellow-400 text-slate-900 shadow-sm">
                    <Radar className="h-5 w-5 text-blue-600 animate-pulse" />
                  </div>
                </div>
                <div className="mt-4 space-y-2 relative z-10">
                  <MiniData label="Open cycles" value={stats.totalResearch} />
                  <MiniData label="Awaiting review" value={stats.pendingApproval} />
                  <MiniData label="Live outputs" value={stats.totalContent} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6 pt-2">
              {/* Animated Live Command Signal Box */}
              <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#E5E0D5] shadow-inner relative overflow-hidden flex flex-col justify-center min-h-[6.5rem]">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <p className="text-[10px] font-y2k font-extrabold uppercase tracking-widest text-slate-400">Live Command Signal</p>
                    <p className="mt-1 text-base md:text-lg font-y2k font-bold tracking-tight text-[#1E2330] leading-snug animate-scale-in">
                      "{signalFeed[activeSignal]}"
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 shrink-0 self-end">
                    {signalFeed.map((_, index) => (
                      <span
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-500 ${index === activeSignal ? "w-6 bg-blue-600" : "w-1.5 bg-slate-300"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Action Tape Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <ActionTile
                  icon={Microscope}
                  eyebrow="Research"
                  label="Run R&D"
                  description="Open the lab & search."
                  onClick={() => onNavigate("research")}
                  tone="light"
                />
                <ActionTile
                  icon={Video}
                  eyebrow="Production"
                  label="Open Studio"
                  description="Draft a script now."
                  onClick={() => onNavigate("studio")}
                  tone="accent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Bento Cards */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Operational Snapshot Paper Card */}
          <div className="paper-sheet p-6 shadow-xl relative overflow-hidden flex-1 group">
            <div className="relative space-y-5">
              <div className="flex items-center justify-between gap-4 border-b border-[#E3DCCF] pb-4">
                <div>
                  <p className="text-[10px] font-y2k font-black uppercase tracking-widest text-slate-400">Leadership Pulse</p>
                  <h3 className="mt-0.5 text-lg font-y2k font-extrabold tracking-tight text-[#1E2330]">Operational Snapshot</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 group-hover:rotate-6 duration-300">
                  <Target className="h-5 w-5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <CommandMetric icon={Compass} label="R&D Cycles" value={stats.totalResearch} detail="Signals explored" highlightClass="sticker-highlight-cyan" />
                <CommandMetric icon={Clock3} label="Pending Board" value={stats.pendingApproval} detail="Needs admin review" highlightClass="sticker-highlight-orange" />
                <CommandMetric icon={CheckCircle2} label="Approved" value={stats.approved} detail="Ready for execution" highlightClass="sticker-highlight-green" />
                <CommandMetric icon={TrendingUp} label="Tracked Views" value={formatNumber(stats.totalViews)} detail="Observed performance" highlightClass="sticker-highlight-pink" />
              </div>
            </div>
          </div>

          {/* Production Pressure Card */}
          <div className="paper-sheet bg-[#1C1E24] text-white p-6 shadow-2xl relative overflow-hidden group border-2 border-[#111317]">
            <div className="relative space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-y2k font-black uppercase tracking-widest text-slate-400">Production Pressure</p>
                  <p className="mt-1 text-base font-y2k font-extrabold tracking-tight leading-tight">Move the next best topic into script.</p>
                </div>
                <CircleDashed className="h-5 w-5 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DarkStat label="Studio Outputs" value={stats.totalContent} />
                <DarkStat label="Tracked Clicks" value={stats.totalClicks} />
              </div>
              <button
                onClick={() => onNavigate("approval")}
                className="w-full blue-label-tag py-3 text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer shadow-md"
              >
                Open Approval Board
                <MoveRight className="h-4 w-4 text-yellow-300" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Row 2: Briefing, Priority Queue, and Performance Pulse (Horizontal Cards) */}
      <section className="space-y-8">
        {/* Morning Briefing Horizontal Card */}
        <div className="w-full">
          <MorningBriefing onStartResearch={onStartResearch} onGoToStudio={onGoToStudio} />
        </div>

        {/* Priority Queue Black Clipboard Horizontal Container */}
        <div className="w-full clipboard-board p-6 text-white shadow-2xl group relative">
          <div className="clipboard-metal-clip" />

          <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4 mt-2">
            <div>
              <p className="text-[10px] font-y2k font-black uppercase tracking-widest text-slate-400">Priority Queue</p>
              <h3 className="mt-0.5 text-lg font-y2k font-extrabold tracking-tight text-white">What leadership should move next</h3>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-yellow-300">
              <Layers3 className="h-4.5 w-4.5" />
            </div>
          </div>

          <div className="mt-5">
            {priorityQueue.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {priorityQueue.map((item) => {
                  const stage = item.status || "pending";
                  return (
                    <button
                      key={item.id}
                      onClick={() => onStartResearch(item.keyword)}
                      className="w-full text-left rounded-xl bg-white text-[#1E2330] p-4 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden group/item border border-slate-200"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 text-[9px] ${STATUS_STYLES[stage] || STATUS_STYLES.pending}`}>
                            {stage}
                          </span>
                          <span className="text-[9px] font-y2k font-bold uppercase tracking-wider text-slate-500">
                            {item.depth || "deep"} cycle
                          </span>
                        </div>
                        <p className="text-sm font-y2k font-extrabold tracking-tight text-[#1E2330] leading-snug group-hover/item:text-blue-600 transition-colors">{item.keyword}</p>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {item.research?.executiveSummary || item.research?.marketLandscape?.summary || "Open this topic to continue analysis."}
                        </p>
                      </div>
                      <div className="flex justify-end mt-3 border-t border-slate-100 pt-2">
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover/item:translate-x-1 duration-300" />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <EmptyPanel
                icon={Microscope}
                title="No live queue yet"
                description="Run the first R&D cycle to populate the executive queue."
                actionLabel="Start Research"
                onClick={() => onNavigate("research")}
              />
            )}
          </div>
        </div>

        {/* Performance Pulse Paper Sheet Horizontal Card */}
        <div className="w-full paper-sheet p-6 shadow-xl group border-2 border-[#E3DCCF]">
          <div className="flex items-center justify-between gap-4 border-b border-[#E3DCCF] pb-4">
            <div>
              <p className="text-[10px] font-y2k font-black uppercase tracking-widest text-slate-400">Performance Pulse</p>
              <h3 className="mt-0.5 text-lg font-y2k font-extrabold tracking-tight text-[#1E2330]">Where traction is already showing</h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="blue-label-tag p-4 text-white space-y-2 shadow-md relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div>
                  <p className="text-[9px] font-y2k font-extrabold uppercase tracking-widest text-blue-200">Average CTR</p>
                  <p className="mt-0.5 text-3xl font-y2k font-black tracking-tight">{performance.totals.avgCtr}%</p>
                </div>
                <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-yellow-300" />
                </div>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed font-medium">
                Spot which formats and live posts are already proving audience fit.
              </p>
            </div>

            <div className="space-y-2.5">
              <p className="text-[10px] font-y2k font-black uppercase tracking-widest text-slate-400">Top Performing Content</p>
              {topContent.length > 0 ? (
                topContent.map((item) => (
                  <PerformanceRow
                    key={item.id}
                    title={item.keyword}
                    meta={item.format.replaceAll("_", " ")}
                    value={`${formatNumber(item.clicks)} clicks`}
                    subvalue={`${formatNumber(item.views)} views`}
                  />
                ))
              ) : (
                <EmptyInline text="Tracked content will appear here after publishing starts." />
              )}
            </div>

            <div className="space-y-2.5">
              <p className="text-[10px] font-y2k font-black uppercase tracking-widest text-slate-400">Platform Click Share</p>
              {platformPerformance.length > 0 ? (
                platformPerformance.map((item, index) => (
                  <PerformanceRow
                    key={`${item.platform}-${index}`}
                    title={capitalize(item.platform)}
                    meta="Platform performance"
                    value={`${formatNumber(item.totalClicks)} clicks`}
                  />
                ))
              ) : (
                <EmptyInline text="Platform ranking activates once live posts accumulate metrics." />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Row 3: Studio Momentum and Decision Shortcuts */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Studio Momentum */}
        <div className="xl:col-span-7 paper-sheet p-6 shadow-xl space-y-5 group">
          <div className="flex items-center justify-between gap-4 border-b border-[#E3DCCF] pb-4">
            <div>
              <p className="text-[10px] font-y2k font-black uppercase tracking-widest text-slate-400">Studio Momentum</p>
              <h3 className="mt-0.5 text-lg font-y2k font-extrabold tracking-tight text-[#1E2330]">Most recent production outputs</h3>
            </div>
            <button
              onClick={() => onNavigate("studio")}
              className="sticker-highlight-green px-3.5 py-1.5 text-xs cursor-pointer transition-transform hover:scale-105"
            >
              Open Studio
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestContent.length > 0 ? (
              latestContent.map((item) => (
                <div key={item.id} className="rounded-xl border border-[#E3DCCF] bg-[#FAF8F3] p-4 space-y-3 hover:shadow-md transition-all duration-300 flex flex-col group/momentum">
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Video className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] font-y2k font-bold uppercase tracking-wider text-slate-500">
                      {item.format.replaceAll("_", " ")}
                    </span>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <p className="text-sm font-y2k font-extrabold tracking-tight text-[#1E2330] truncate">{item.keyword}</p>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {item.script || "Script draft saved in the studio."}
                    </p>
                  </div>
                  <button
                    onClick={() => onGoToStudio({ keyword: item.keyword, research: item.research || null, format: item.format })}
                    className="w-full blue-label-tag py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Continue Draft
                    <ArrowRight className="h-3.5 w-3.5 text-yellow-300" />
                  </button>
                </div>
              ))
            ) : (
              <div className="md:col-span-3">
                <EmptyPanel
                  icon={Video}
                  title="No studio drafts yet"
                  description="Generated scripts will surface here for faster executive review."
                  actionLabel="Create First Draft"
                  onClick={() => onNavigate("studio")}
                />
              </div>
            )}
          </div>
        </div>

        {/* Decision Shortcuts */}
        <div className="xl:col-span-5 paper-sheet p-6 shadow-xl space-y-5 group">
          <div className="flex items-center justify-between gap-4 border-b border-[#E3DCCF] pb-4">
            <div>
              <p className="text-[10px] font-y2k font-black uppercase tracking-widest text-slate-400">Decision Shortcuts</p>
              <h3 className="mt-0.5 text-lg font-y2k font-extrabold tracking-tight text-[#1E2330]">Move from signal to action faster</h3>
            </div>
            <BrainCircuit className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-3">
            <ShortcutCard
              icon={Microscope}
              title="Launch a fresh research cycle"
              description="Use the R&D Lab when leadership wants a topic-specific angle, not a generic content idea."
              actionLabel="Open R&D Lab"
              onClick={() => onNavigate("research")}
            />
            <ShortcutCard
              icon={CalendarClock}
              title="Review the publishing pipeline"
              description="Check which topics are stuck in approval, and which ones are ready for execution."
              actionLabel="Open Scheduler"
              onClick={() => onNavigate("calendar")}
            />
            <ShortcutCard
              icon={Eye}
              title="Inspect measurable impact"
              description="Jump into analytics to see which formats and tags are building real traction."
              actionLabel="Open Impact Stats"
              onClick={() => onNavigate("analytics")}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ActionTile({ icon: Icon, eyebrow, label, description, onClick, tone = "light" }) {
  const toneClass = tone === "accent"
    ? "post-it-yellow text-[#1E2330]"
    : "bg-white border border-[#E3DCCF] text-[#1E2330]";

  return (
    <button
      onClick={onClick}
      className={`rounded-xl p-4 text-left hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[8.5rem] shadow-sm ${toneClass}`}
    >
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-blue-600" />
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400" />
      </div>
      <div className="mt-2">
        <p className="text-[9px] font-y2k font-extrabold uppercase tracking-widest text-slate-500">{eyebrow}</p>
        <p className="mt-0.5 text-sm font-y2k font-extrabold tracking-tight">{label}</p>
      </div>
    </button>
  );
}

function CommandMetric({ icon: Icon, label, value, detail, highlightClass }) {
  return (
    <div className="rounded-xl border border-[#E3DCCF] bg-[#FAF8F3] p-3.5 space-y-2 hover:shadow-md transition-all duration-300 group/metric">
      <div className="flex items-center justify-between gap-2">
        <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
          <Icon className="h-4 w-4 text-blue-600" />
        </div>
        <span className={`px-2 py-0.5 text-base font-y2k font-extrabold ${highlightClass}`}>{value}</span>
      </div>
      <div>
        <p className="text-[9px] font-y2k font-extrabold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-0.5 text-xs text-slate-600 leading-snug">{detail}</p>
      </div>
    </div>
  );
}

function MiniData({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-yellow-200/60 px-3 py-1.5">
      <span className="text-[9px] font-y2k font-bold uppercase tracking-wider text-slate-700">{label}</span>
      <span className="text-xs font-y2k font-black text-slate-900">{value}</span>
    </div>
  );
}

function DarkStat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3.5 flex flex-col justify-between">
      <p className="text-[9px] font-y2k font-extrabold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-y2k font-extrabold text-white">{value}</p>
    </div>
  );
}

function PerformanceRow({ title, meta, value, subvalue }) {
  return (
    <div className="rounded-xl border border-[#E3DCCF] bg-[#FAF8F3] p-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-y2k font-extrabold text-[#1E2330] truncate">{title}</p>
        <p className="mt-0.5 text-[9px] font-y2k font-bold uppercase tracking-wider text-slate-400">{meta}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-y2k font-extrabold text-[#1E2330]">{value}</p>
        {subvalue ? <p className="mt-0.5 text-[9px] font-bold text-slate-400">{subvalue}</p> : null}
      </div>
    </div>
  );
}

function ShortcutCard({ icon: Icon, title, description, actionLabel, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-[#E3DCCF] bg-[#FAF8F3] p-4 text-left hover:shadow-md transition-all duration-300 cursor-pointer group/shortcut"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Icon className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-y2k font-extrabold text-[#1E2330] group-hover/shortcut:text-blue-600 transition-colors">{title}</p>
            <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{description}</p>
          </div>
        </div>
        <MoveRight className="h-4 w-4 text-slate-400 shrink-0 mt-1 group-hover/shortcut:translate-x-1 duration-300" />
      </div>
      <div className="mt-3 text-[9px] font-y2k font-extrabold uppercase tracking-widest text-blue-600">
        {actionLabel}
      </div>
    </button>
  );
}

function EmptyPanel({ icon: Icon, title, description, actionLabel, onClick }) {
  return (
    <div className="rounded-xl border border-dashed border-[#E3DCCF] bg-[#FAF8F3] p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <p className="mt-3 text-sm font-y2k font-extrabold text-[#1E2330]">{title}</p>
      <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">{description}</p>
      <button
        onClick={onClick}
        className="mt-4 blue-label-tag px-4 py-2 text-xs cursor-pointer active:scale-[0.98] transition-all shadow-md"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function EmptyInline({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-[#E3DCCF] bg-[#FAF8F3] px-3.5 py-3 text-xs text-slate-400 font-medium">
      {text}
    </div>
  );
}

function formatNumber(value) {
  const numeric = Number(value || 0);
  if (numeric >= 1_000_000) return `${(numeric / 1_000_000).toFixed(1)}M`;
  if (numeric >= 1_000) return `${(numeric / 1_000).toFixed(1)}K`;
  return String(numeric);
}

function capitalize(value) {
  return String(value || "unknown").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
