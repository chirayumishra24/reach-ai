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
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  published: "bg-primary/10 text-primary border-primary/20",
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
    <div className="p-6 lg:p-10 xl:p-12 max-w-[1600px] mx-auto space-y-10 animate-fade-in">
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Main Hero Banner */}
        <div className="xl:col-span-8 rounded-[2.5rem] bg-gradient-to-tr from-[#0b1522] via-[#0f2238] to-[#0A2540] border border-[#1A3E5E]/40 p-8 lg:p-10 xl:p-12 overflow-hidden relative shadow-[0_30px_90px_-40px_rgba(10,37,64,0.65)] group">
          {/* Decorative glowing backdrops */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(184,134,11,0.18),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.12),transparent_30%)] pointer-events-none" />
          <div className="absolute -top-20 right-[-4rem] h-72 w-72 rounded-full bg-white/5 blur-3xl pointer-events-none group-hover:bg-white/10 transition-all duration-700" />
          <div className="absolute bottom-[-6rem] left-[35%] h-56 w-56 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />

          <div className="relative z-10 space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
              <div className="space-y-6 max-w-3xl">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/90 backdrop-blur-md shadow-sm">
                  <Sparkles className="h-4.5 w-4.5 text-accent animate-pulse" />
                  Executive Intelligence Hub
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-[-0.05em] leading-[0.96] text-white">
                    {settings.schoolName}
                    <span className="block mt-2 bg-gradient-to-r from-slate-200 via-slate-300 to-white/70 bg-clip-text text-transparent text-2xl md:text-3xl font-medium tracking-normal">
                      Institutional intelligence, staged for action.
                    </span>
                  </h1>
                  <p className="max-w-2xl text-xs md:text-sm text-slate-400 leading-relaxed font-medium">
                    {settings.schoolVision}. The hub displays live research momentum, production pressure, and performance signals so leadership can decide what to publish next.
                  </p>
                </div>
              </div>

              {/* Mini radar stats widget */}
              <div className="min-w-[260px] max-w-[290px] rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] relative group/radar">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                <div className="flex items-center justify-between gap-3 relative z-10">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Signal Radar</p>
                    <p className="mt-1.5 text-xs font-bold text-slate-300 leading-tight">Attention is shifting toward clarity and trust.</p>
                  </div>
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 group-hover/radar:border-accent/40 transition-colors">
                    <Radar className="h-5 w-5 text-accent animate-pulse" />
                    <span className="absolute inset-1 rounded-[1rem] border border-white/5" />
                  </div>
                </div>
                <div className="mt-5 space-y-2.5 relative z-10">
                  <MiniData label="Open cycles" value={stats.totalResearch} />
                  <MiniData label="Awaiting review" value={stats.pendingApproval} />
                  <MiniData label="Live outputs" value={stats.totalContent} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6">
              {/* Animated Live Command Signal Box */}
              <div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-center min-h-[7rem]">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Live Command Signal</p>
                    <p className="mt-2.5 text-lg md:text-xl font-black tracking-tight text-white leading-tight animate-scale-in">
                      "{signalFeed[activeSignal]}"
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 shrink-0 self-end">
                    {signalFeed.map((_, index) => (
                      <span
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-500 ${index === activeSignal ? "w-6 bg-accent" : "w-1.5 bg-white/20"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Action Tiles */}
              <div className="grid grid-cols-2 gap-4">
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

        {/* Right Sidebar Bento Columns */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Operational Snapshot Bento Card */}
          <div className="rounded-[2.5rem] bg-white border border-border p-6 shadow-premium relative overflow-hidden flex-1 group">
            <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(184,134,11,0.04),transparent)]" />
            <div className="relative space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-txt-muted">Leadership Pulse</p>
                  <h3 className="mt-1 text-xl font-black tracking-tight text-txt">Operational Snapshot</h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/5 border border-accent/10 text-accent group-hover:scale-110 duration-300">
                  <Target className="h-5 w-5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CommandMetric icon={Compass} label="R&D Cycles" value={stats.totalResearch} detail="Signals explored" />
                <CommandMetric icon={Clock3} label="Pending Board" value={stats.pendingApproval} detail="Needs admin review" />
                <CommandMetric icon={CheckCircle2} label="Approved" value={stats.approved} detail="Ready for execution" />
                <CommandMetric icon={TrendingUp} label="Tracked Views" value={formatNumber(stats.totalViews)} detail="Observed performance" />
              </div>
            </div>
          </div>

          {/* Production Pressure Bento Card */}
          <div className="rounded-[2.5rem] bg-[#0A1622] text-white p-6 shadow-[0_24px_60px_-32px_rgba(10,37,64,0.6)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(184,134,11,0.12),transparent_40%)]" />
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-amber-300/5 blur-3xl" />
            <div className="relative space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Production Pressure</p>
                  <p className="mt-1 text-xl font-black tracking-tight leading-tight">Move the next best topic into script.</p>
                </div>
                <CircleDashed className="h-5 w-5 text-accent animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DarkStat label="Studio Outputs" value={stats.totalContent} />
                <DarkStat label="Tracked Clicks" value={stats.totalClicks} />
              </div>
              <button
                onClick={() => onNavigate("approval")}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center justify-center gap-2 hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer shadow-lg"
              >
                Open Approval Board
                <MoveRight className="h-4 w-4 text-accent" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Row 2: Briefing, Priority Queue, and Performance Pulse */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:items-stretch">
        <div className="xl:col-span-4 h-full">
          <MorningBriefing onStartResearch={onStartResearch} onGoToStudio={onGoToStudio} />
        </div>

        {/* Priority Queue Card */}
        <div className="xl:col-span-4 h-full rounded-[2.5rem] bg-white border border-border p-6 shadow-premium flex flex-col group">
          <div className="flex items-center justify-between gap-4 min-h-[5.5rem] border-b border-border/40 pb-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-txt-muted">Priority Queue</p>
              <h3 className="mt-1 text-xl font-black tracking-tight text-txt">What leadership should move next</h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/5 text-primary group-hover:rotate-6 duration-300">
              <Layers3 className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 flex-1 space-y-4">
            {priorityQueue.length > 0 ? (
              priorityQueue.map((item) => {
                const stage = item.status || "pending";
                return (
                  <button
                    key={item.id}
                    onClick={() => onStartResearch(item.keyword)}
                    className="w-full text-left rounded-[2rem] border border-border bg-bg-card p-5 hover:border-accent/40 hover:shadow-premium-hover transition-all duration-300 cursor-pointer min-h-[12rem] flex flex-col relative overflow-hidden group/item"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-start justify-between gap-4 flex-1">
                      <div className="space-y-3 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.18em] ${STATUS_STYLES[stage] || STATUS_STYLES.pending}`}>
                            {stage}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-txt-muted">
                            {item.depth || "deep"} cycle
                          </span>
                        </div>
                        <p className="text-base font-black tracking-tight text-txt leading-snug group-hover/item:text-accent transition-colors">{item.keyword}</p>
                        <p className="text-xs text-txt-secondary leading-relaxed line-clamp-3">
                          {item.research?.executiveSummary || item.research?.marketLandscape?.summary || "Open this topic to continue the analysis and sharpen the angle."}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-txt-muted shrink-0 mt-1 group-hover/item:translate-x-1 duration-300" />
                    </div>
                  </button>
                );
              })
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

        {/* Performance Pulse Card */}
        <div className="xl:col-span-4 h-full rounded-[2.5rem] bg-white border border-border p-6 shadow-premium flex flex-col group">
          <div className="flex items-center justify-between gap-4 min-h-[5.5rem] border-b border-border/40 pb-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-txt-muted">Performance Pulse</p>
              <h3 className="mt-1 text-xl font-black tracking-tight text-txt">Where traction is already showing</h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success/10 text-success group-hover:scale-110 duration-300">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 flex-1 flex flex-col gap-6">
            <div className="rounded-3xl bg-gradient-to-br from-[#0A2540] to-[#1A3E5E] p-5 text-white space-y-3 shadow-md relative overflow-hidden group/ctr">
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/55">Average CTR</p>
                  <p className="mt-1 text-3xl font-black tracking-tight">{performance.totals.avgCtr}%</p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-white/10 flex items-center justify-center group-hover/ctr:scale-110 duration-300">
                  <Flame className="h-5 w-5 text-accent" />
                </div>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Use this panel to spot which formats and live posts are already proving audience fit.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-txt-muted">Top Performing Content</p>
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

            <div className="space-y-3 mt-auto">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-txt-muted">Platform Click Share</p>
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
        <div className="xl:col-span-7 rounded-[2.5rem] bg-white border border-border p-6 shadow-premium space-y-6 group">
          <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-txt-muted">Studio Momentum</p>
              <h3 className="mt-1 text-xl font-black tracking-tight text-txt">Most recent production outputs</h3>
            </div>
            <button
              onClick={() => onNavigate("studio")}
              className="rounded-full border border-border hover:border-accent/40 bg-white hover:text-accent px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-txt cursor-pointer transition-colors shadow-sm"
            >
              Open Studio
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestContent.length > 0 ? (
              latestContent.map((item) => (
                <div key={item.id} className="rounded-3xl border border-border bg-bg-card p-5 space-y-4 hover:border-primary/20 hover:shadow-premium-hover transition-all duration-300 flex flex-col group/momentum">
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover/momentum:scale-105 transition-transform">
                      <Video className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-txt-muted">
                      {item.format.replaceAll("_", " ")}
                    </span>
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="text-base font-black tracking-tight text-txt leading-snug truncate">{item.keyword}</p>
                    <p className="text-xs text-txt-secondary leading-relaxed line-clamp-3">
                      {item.script || "Script draft saved in the studio."}
                    </p>
                  </div>
                  <button
                    onClick={() => onGoToStudio({ keyword: item.keyword, research: item.research || null, format: item.format })}
                    className="w-full rounded-xl bg-primary hover:bg-primary-hover text-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-md"
                  >
                    Continue Draft
                    <ArrowRight className="h-3.5 w-3.5 text-accent" />
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
        <div className="xl:col-span-5 rounded-[2.5rem] bg-white border border-border p-6 shadow-premium space-y-6 group">
          <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-txt-muted">Decision Shortcuts</p>
              <h3 className="mt-1 text-xl font-black tracking-tight text-txt">Move from signal to action faster</h3>
            </div>
            <BrainCircuit className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-4">
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
              description="Check which topics are stuck in approval, and which ones are already ready for execution."
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
    ? "border-accent/30 bg-accent/10 text-white shadow-[0_4px_20px_-10px_rgba(212,175,55,0.3)] hover:border-accent/60"
    : "border-white/10 bg-white/5 text-white hover:border-white/20";

  return (
    <button
      onClick={onClick}
      className={`rounded-[2rem] border p-5 text-left backdrop-blur-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[9rem] ${toneClass}`}
    >
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <ArrowRight className="h-4 w-4 text-white/40" />
      </div>
      <div className="mt-4">
        <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/50">{eyebrow}</p>
        <p className="mt-1 text-sm font-black tracking-tight">{label}</p>
      </div>
    </button>
  );
}

function CommandMetric({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-3xl border border-border bg-bg-card p-4 space-y-3 hover:border-accent/20 hover:shadow-premium-hover transition-all duration-300 group/metric">
      <div className="flex items-center justify-between gap-3">
        <div className="h-10 w-10 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover/metric:scale-105 duration-300">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <span className="text-xl font-black tracking-tight text-txt">{value}</span>
      </div>
      <div>
        <p className="text-[8px] font-black uppercase tracking-[0.18em] text-txt-muted">{label}</p>
        <p className="mt-0.5 text-xs text-txt-secondary leading-snug">{detail}</p>
      </div>
    </div>
  );
}

function MiniData({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 px-3.5 py-2.5">
      <span className="text-[8px] font-black uppercase tracking-[0.18em] text-white/40">{label}</span>
      <span className="text-xs font-black text-white">{value}</span>
    </div>
  );
}

function DarkStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-4 flex flex-col justify-between">
      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-1.5 text-xl font-black tracking-tight text-white">{value}</p>
    </div>
  );
}

function PerformanceRow({ title, meta, value, subvalue }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-card p-4 flex items-start justify-between gap-4 hover:border-accent/10 transition-colors">
      <div className="min-w-0">
        <p className="text-xs font-black tracking-tight text-txt truncate">{title}</p>
        <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.18em] text-txt-muted">{meta}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-black text-txt">{value}</p>
        {subvalue ? <p className="mt-0.5 text-[8px] font-bold text-txt-muted">{subvalue}</p> : null}
      </div>
    </div>
  );
}

function ShortcutCard({ icon: Icon, title, description, actionLabel, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-3xl border border-border bg-bg-card p-5 text-left hover:border-accent/30 hover:shadow-premium-hover transition-all duration-300 cursor-pointer group/shortcut"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 min-w-0">
          <div className="h-10 w-10 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover/shortcut:scale-105 duration-300">
            <Icon className="h-4.5 w-4.5 text-accent" />
          </div>
          <div>
            <p className="text-base font-black tracking-tight text-txt group-hover/shortcut:text-accent transition-colors">{title}</p>
            <p className="mt-1 text-xs text-txt-secondary leading-relaxed">{description}</p>
          </div>
        </div>
        <MoveRight className="h-4 w-4 text-txt-muted shrink-0 mt-1 group-hover/shortcut:translate-x-1 duration-300" />
      </div>
      <div className="mt-4 text-[9px] font-black uppercase tracking-[0.18em] text-accent">
        {actionLabel}
      </div>
    </button>
  );
}

function EmptyPanel({ icon: Icon, title, description, actionLabel, onClick }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-border bg-bg-card p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <p className="mt-4 text-base font-black tracking-tight text-txt">{title}</p>
      <p className="mt-1.5 text-xs text-txt-secondary leading-relaxed max-w-xs mx-auto">{description}</p>
      <button
        onClick={onClick}
        className="mt-5 rounded-xl bg-primary hover:bg-primary-hover px-5 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-white cursor-pointer active:scale-[0.98] transition-all shadow-md"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function EmptyInline({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-bg-card px-4 py-4 text-xs text-txt-muted font-medium">
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
