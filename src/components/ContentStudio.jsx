"use client";

import { useState, useCallback, useEffect } from "react";
import { MonitorPlay, Smartphone, Clapperboard, Layers, Hash, Briefcase, BookOpen, PenTool, Sparkles, Bot, Tag, Edit3, Loader2, Copy, FileText, Globe, Flame, Wand2, X, Save, CheckCircle2 } from "lucide-react";
import { saveContent } from "@/lib/storage";

const FORMATS = [
  { id: "youtube_long", label: "YT Long", icon: MonitorPlay, desc: "8-20min" },
  { id: "youtube_short", label: "YT Short", icon: Smartphone, desc: "15-60s" },
  { id: "instagram_reel", label: "IG Reel", icon: Clapperboard, desc: "15-90s" },
  { id: "instagram_carousel", label: "IG Carousel", icon: Layers, desc: "8-12 slides" },
  { id: "x_thread", label: "X Thread", icon: Hash, desc: "5-15 tweets" },
  { id: "linkedin_post", label: "LinkedIn", icon: Briefcase, desc: "800-1500ch" },
  { id: "blog_article", label: "Blog", icon: BookOpen, desc: "1000-3000w" },
];

const STYLES = ["professional", "casual", "hinglish", "story", "data", "provocative", "educational"];

export default function ContentStudio({ researchContext, onSchedulePost }) {
  const [keyword, setKeyword] = useState("");
  const [audience, setAudience] = useState("");
  const [format, setFormat] = useState("youtube_long");
  const [style, setStyle] = useState("professional");
  const [location, setLocation] = useState("IN");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [bundleResult, setBundleResult] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("script");
  const [isSaved, setIsSaved] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    fetch("/api/meta/insights")
      .then((res) => res.json())
      .then((data) => {
        if (data.platforms) {
          const top = data.platforms.flatMap((p) => p.topContent || []);
          setPerformanceData(top);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (researchContext?.keyword) {
      setKeyword(researchContext.keyword);
      if (researchContext.location) setLocation(researchContext.location);
      if (researchContext.format) setFormat(researchContext.format);
    }
  }, [researchContext]);

  const handleGenerate = useCallback(async (isBundle = false) => {
    if (!keyword.trim()) return;
    setLoading(true); setError(null); setResult(null); setBundleResult(null); setIsSaved(false);
    try {
      const researchSummary = researchContext?.research ? {
        summary: researchContext.research.executiveSummary
          || researchContext.research.marketLandscape?.summary
          || researchContext.research.strategyBlueprint?.concept
          || "",
        angles: researchContext.research.suggestedAngles?.length
          ? researchContext.research.suggestedAngles
          : researchContext.research.trendingAngles || [],
        hooks: researchContext.research.suggestedHooks?.length
          ? researchContext.research.suggestedHooks
          : (researchContext.research.trendingAngles || []).map((angle) => angle.hookIdea).filter(Boolean),
        recommendedStrategy: researchContext.research.recommendedStrategy || null,
        viralCheck: researchContext.research.viralCheck || null,
        winningPatterns: researchContext.research.winningPatterns || [],
        trendSignals: researchContext.research.trendSignals || [],
        evidence: (researchContext.research.sourceEvidence || []).slice(0, 4),
        topKeywords: (researchContext.topKeywords || []).slice(0, 10).map(k => k.keyword || k),
      } : null;

      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, format, style, audience, location, research: researchSummary, bundle: isBundle, performanceData }),
      });
      if (!res.ok) {
        const failure = await res.json().catch(() => ({}));
        throw new Error(failure.error || "Generation failed");
      }
      const data = await res.json();
      if (data.bundle) {
        setBundleResult(data.scripts);
        const firstFormat = Object.keys(data.scripts)[0];
        setFormat(firstFormat);
        setResult({ script: data.scripts[firstFormat], metadata: data.metadata });
      } else {
        setResult(data);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [keyword, format, style, audience, location, researchContext, performanceData]);

  const handleSave = () => {
    if (!result) return;
    try {
      saveContent({
        keyword, format,
        script: result.script,
        originalScript: result.originalScript,
        seo: result.seo || {},
        editing: result.editing || {},
        research: researchContext?.research || null,
        metadata: { keyword, format, style, audience, location, researchId: researchContext?.id },
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-desk-canvas p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in font-sans text-[#1E2330]">
      {/* Top Banner Header */}
      <div className="border-b-2 border-[#E3DCCF] pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md transform -rotate-2">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl font-y2k font-extrabold text-[#1E2330] tracking-tight">
              Script Studio
            </h3>
            <p className="text-xs text-slate-600 font-medium">Generate platform-optimized scripts from verified 2026 research.</p>
          </div>
        </div>
        <div className="sticker-highlight-green px-3.5 py-1 text-xs">
          Ready to Script
        </div>
      </div>

      {/* Horizontal Wide Configuration Card */}
      <div className="w-full paper-sheet-binder p-6 lg:p-8 shadow-xl space-y-6 border-2 border-[#E3DCCF] relative">
        <div className="absolute top-0 left-0 right-0 h-5 paper-binder-holes opacity-60" />

        <div className="space-y-6 mt-1">
          {/* Row 1: Topic Input and Generate Action Buttons */}
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label className="block text-xs font-y2k font-extrabold uppercase tracking-widest text-slate-600 mb-2">
                {researchContext?.keyword ? "Topic (Loaded From R&D)" : "Topic / Keyword"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Enter main subject or angle..."
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-[#E3DCCF] bg-[#FAF8F3] text-sm font-y2k font-extrabold text-[#1E2330] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {researchContext?.keyword && <Sparkles className="absolute right-3 top-3 w-4 h-4 text-blue-600 opacity-70" />}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => handleGenerate(false)}
                disabled={loading || !keyword.trim()}
                className={`blue-label-tag px-6 py-3.5 text-xs font-y2k font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  loading ? "opacity-75 cursor-wait" : "hover:scale-105 active:scale-95"
                }`}
              >
                {loading && !bundleResult ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-yellow-300" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    Generate Script
                  </>
                )}
              </button>

              {researchContext?.research && (
                <button
                  onClick={() => handleGenerate(true)}
                  disabled={loading || !keyword.trim()}
                  className="sticker-highlight-pink px-5 py-3.5 text-xs font-y2k font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-105 active:scale-95"
                >
                  {loading && bundleResult ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Bundling...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-white" />
                      Generate Bundle
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Row 2: 3 Horizontal Controls (Format, Tone, Target Audience) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Format Card */}
            <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] space-y-2">
              <label className="block text-[10px] font-y2k font-extrabold uppercase tracking-widest text-slate-500">
                Content Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#E3DCCF] text-xs font-y2k font-extrabold text-[#1E2330] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {FORMATS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label} ({f.desc})
                  </option>
                ))}
              </select>
            </div>

            {/* Tone Card */}
            <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] space-y-2">
              <label className="block text-[10px] font-y2k font-extrabold uppercase tracking-widest text-slate-500">
                Voice &amp; Tone
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#E3DCCF] text-xs font-y2k font-extrabold text-[#1E2330] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600 capitalize"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Audience Card */}
            <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] space-y-2">
              <label className="block text-[10px] font-y2k font-extrabold uppercase tracking-widest text-slate-500">
                Target Audience
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Students, Parents, Educators"
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E3DCCF] text-xs font-y2k font-extrabold text-[#1E2330] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Research Context Post-It Strip */}
          {researchContext?.research && (
            <div className="post-it-yellow p-4 rounded-xl relative flex flex-wrap items-center justify-between gap-4 border border-yellow-400">
              <div className="tape-overlay" />
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-blue-700 shrink-0" />
                <div>
                  <p className="text-[10px] font-y2k font-extrabold text-slate-800 uppercase tracking-widest">R&amp;D Research Loaded</p>
                  <p className="text-xs font-handwriting text-slate-900 font-bold">{researchContext.keyword}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {researchContext.topKeywords?.slice(0, 4).map((kw, i) => (
                  <span key={i} className="text-[9px] font-y2k font-bold text-blue-800 px-2 py-0.5 rounded bg-white/70 border border-blue-200">
                    #{kw.keyword || kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Full-Width Script Output Panel */}
      <div className="w-full">
        {error && (
          <div className="p-4 mb-6 rounded-xl sticker-highlight-orange text-white text-xs font-y2k font-extrabold">
            {error}
          </div>
        )}

        {!result && !loading && (
          <div className="w-full paper-sheet p-16 text-center border-2 border-dashed border-[#E3DCCF] shadow-lg flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-yellow-300 border border-yellow-400 text-slate-900 flex items-center justify-center mx-auto mb-4 shadow-sm transform -rotate-3">
              <PenTool className="w-8 h-8 text-blue-700" />
            </div>
            <h3 className="text-xl font-y2k font-extrabold text-[#1E2330] mb-2 tracking-tight">
              Script Workspace
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto font-medium leading-relaxed">
              Configure your topic, format, and tone above, then click &ldquo;Generate Script&rdquo; to draft output.
            </p>
          </div>
        )}

        {loading && (
          <div className="w-full paper-sheet p-16 text-center border-2 border-dashed border-[#E3DCCF] shadow-lg flex flex-col items-center justify-center animate-pulse">
            <div className="w-16 h-16 rounded-full bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Bot className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-y2k font-extrabold text-[#1E2330] mb-4">Writing Script...</h3>
            <div className="w-48 h-2 rounded-full bg-slate-200 overflow-hidden mx-auto">
              <div className="h-full bg-blue-600 w-1/2 animate-pulse" />
            </div>
          </div>
        )}

        {result && (
          <div className="w-full paper-sheet p-8 shadow-xl space-y-6 border-2 border-[#E3DCCF]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DCCF] pb-4">
              <div className="flex items-center gap-3">
                <span className="blue-label-tag px-3 py-1 text-[10px]">
                  {FORMATS.find((f) => f.id === format)?.label || format}
                </span>
                <span className="sticker-highlight-green px-3 py-1 text-[10px]">
                  {style}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className={`px-4 py-2 rounded-xl text-xs font-y2k font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSaved
                      ? "sticker-highlight-green text-slate-900"
                      : "bg-white border-[#E3DCCF] text-slate-700 hover:bg-[#EFEADF]"
                  }`}
                >
                  {isSaved ? <CheckCircle2 className="w-4 h-4 text-slate-900" /> : <Save className="w-4 h-4" />}
                  {isSaved ? "Saved to Pipeline" : "Save Script"}
                </button>
                {onSchedulePost && (
                  <button
                    onClick={() => onSchedulePost({ keyword, format, script: result.script })}
                    className="blue-label-tag px-4 py-2 text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition-all cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" /> Schedule Post
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] font-sans text-sm text-[#1E2330] leading-relaxed whitespace-pre-wrap">
                {result.script}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-y2k font-extrabold uppercase tracking-widest text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}
