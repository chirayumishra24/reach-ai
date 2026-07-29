"use client";

import { useState, useCallback, useEffect } from "react";
import { MonitorPlay, LucideCamera as Camera, Hash, MessageSquare, Newspaper, Zap, BarChart2, Search, Globe, Heart, ArrowRight, Flame, Lightbulb, Target, Loader2, Sparkles, Compass, Repeat2, Play, User, ExternalLink, MessageCircle } from "lucide-react";

const PLATFORMS_LIST = [
  { id: "youtube", label: "YouTube", icon: MonitorPlay },
  { id: "instagram", label: "Instagram", icon: Camera },
  { id: "x", label: "X / Twitter", icon: Hash },
  { id: "reddit", label: "Reddit", icon: MessageSquare },
  { id: "news", label: "News", icon: Newspaper },
];

const SOURCE_TARGETS = [
  { id: "youtube_long", label: "YouTube Long", icon: MonitorPlay, platform: "youtube" },
  { id: "youtube_short", label: "YouTube Shorts", icon: Play, platform: "youtube" },
  { id: "instagram_reel", label: "IG Reels", icon: Camera, platform: "instagram" },
  { id: "instagram_post", label: "IG Posts", icon: Camera, platform: "instagram" },
  { id: "x", label: "X / Twitter", icon: Hash, platform: "x" },
  { id: "reddit", label: "Reddit", icon: MessageSquare, platform: "reddit" },
  { id: "news", label: "News", icon: Newspaper, platform: "news" },
];

const DEPTHS = [
  { id: "quick", label: "Quick Scan", desc: "~30s — basic overview", icon: Zap },
  { id: "standard", label: "Standard", desc: "~60s — balanced analysis", icon: BarChart2 },
  { id: "deep", label: "Deep Dive", desc: "~90s — full R&D", icon: Search },
];

const LOCATIONS = [
  { code: "IN", label: "India", icon: Globe },
  { code: "US", label: "United States", icon: Globe },
  { code: "GB", label: "United Kingdom", icon: Globe },
  { code: "GLOBAL", label: "Global", icon: Globe },
];

function derivePlatformsFromTargets(targets) {
  const set = new Set();
  targets.forEach((t) => {
    const found = SOURCE_TARGETS.find((st) => st.id === t);
    if (found) set.add(found.platform);
  });
  return Array.from(set);
}

export default function ResearchLab({ onResearchComplete, onGoToStudio, initialKeyword }) {
  const [keyword, setKeyword] = useState(initialKeyword || "");
  useEffect(() => { if (initialKeyword) setKeyword(initialKeyword); }, [initialKeyword]);

  const [sourceMode, setSourceMode] = useState("all");
  const [platformTargets, setPlatformTargets] = useState([]);
  const [depth, setDepth] = useState("standard");
  const [location, setLocation] = useState("IN");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [platformData, setPlatformData] = useState(null);
  const [topKeywords, setTopKeywords] = useState(null);
  const [error, setError] = useState(null);
  const activePlatforms = sourceMode === "all"
    ? PLATFORMS_LIST.map((platform) => platform.id)
    : derivePlatformsFromTargets(platformTargets);

  const handleResearch = useCallback(async () => {
    if (!keyword.trim()) return;
    if (sourceMode === "custom" && platformTargets.length === 0) {
      setError("Select at least one source before running R&D.");
      return;
    }
    setLoading(true); setError(null); setResult(null); setPlatformData(null); setTopKeywords(null);
    try {
      const requestedPlatforms = sourceMode === "all" ? PLATFORMS_LIST.map((platform) => platform.id) : derivePlatformsFromTargets(platformTargets);
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword,
          platforms: requestedPlatforms,
          platformTargets: sourceMode === "all" ? [] : platformTargets,
          location,
          depth,
          language: "en",
        }),
      });
      if (!res.ok) {
        let errMsg = "Research failed";
        try {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const e = await res.json();
            errMsg = e.error || e.message || errMsg;
          }
        } catch {}
        throw new Error(errMsg);
      }
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Server returned an invalid non-JSON response. Please try again.");
      }
      const data = await res.json();
      setResult(data.research);
      setPlatformData(data.platformData);
      setTopKeywords(data.topKeywords || []);

      let savedResearch = null;
      try {
        const { saveResearch } = require("@/lib/storage");
        savedResearch = saveResearch({
          keyword,
          research: data.research,
          platformData: data.platformData,
          topKeywords: data.topKeywords || [],
          location,
          depth,
          sourceMode,
          platformTargets,
        });
      } catch {}

      onResearchComplete?.({
        id: savedResearch?.id, keyword,
        research: data.research, platformData: data.platformData,
        topKeywords: data.topKeywords || [], location, depth, sourceMode, platformTargets,
        researchedAt: new Date().toISOString(),
      });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [depth, keyword, location, onResearchComplete, platformTargets, sourceMode]);

  const toggleTarget = (targetId) => {
    setPlatformTargets((current) => (
      current.includes(targetId)
        ? current.filter((item) => item !== targetId)
        : [...current, targetId]
    ));
  };

  return (
    <div className="min-h-screen bg-desk-canvas p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in font-sans text-[#1E2330]">
      {/* Header Banner */}
      <div className="border-b-2 border-[#E3DCCF] pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md transform -rotate-2">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl font-y2k font-extrabold text-[#1E2330] tracking-tight">
              R&D Intelligence Lab
            </h3>
            <p className="text-xs text-slate-600 font-medium">Crawl 2026 trends, news, and viral signals before scripting.</p>
          </div>
        </div>
        <div className="sticker-highlight-green px-3.5 py-1 text-xs">
          Live Signals Active
        </div>
      </div>

      {/* Horizontal Full-Width Configuration Sheet Card */}
      <div className="w-full paper-sheet-binder p-6 lg:p-8 shadow-xl space-y-6 border-2 border-[#E3DCCF] relative">
        <div className="absolute top-0 left-0 right-0 h-5 paper-binder-holes opacity-60" />

        <div className="space-y-6 mt-1">
          {/* Topic Search Input Bar */}
          <div>
            <label className="block text-xs font-y2k font-extrabold uppercase tracking-widest text-slate-600 mb-2">
              Topic / Keyword
            </label>
            <div className="relative rounded-xl shadow-xs">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder='e.g. "AI in education 2026" or "Student Wellness"'
                className="w-full pl-5 pr-12 py-3.5 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] text-sm font-y2k font-extrabold text-[#1E2330] placeholder-slate-400 focus:ring-2 focus:ring-blue-600 outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleResearch()}
              />
              <button
                onClick={handleResearch}
                disabled={loading || !keyword.trim()}
                className="absolute right-2 top-2 bottom-2 blue-label-tag px-4 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-yellow-300" />
                Scan
              </button>
            </div>
          </div>

          {/* Horizontal Controls Row (3 Columns: Location, Depth, Source Scope) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Location Horizontal Card */}
            <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] space-y-3">
              <span className="block text-[10px] font-y2k font-extrabold uppercase tracking-widest text-slate-500">
                Location
              </span>
              <div className="grid grid-cols-2 gap-2">
                {LOCATIONS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLocation(l.code)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-y2k font-extrabold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      location === l.code
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white border-[#E3DCCF] text-slate-600 hover:bg-[#EFEADF]"
                    }`}
                  >
                    <l.icon className="w-3 h-3" /> {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Depth Horizontal Card */}
            <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] space-y-3">
              <span className="block text-[10px] font-y2k font-extrabold uppercase tracking-widest text-slate-500">
                Analysis Depth
              </span>
              <div className="space-y-1.5">
                {DEPTHS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDepth(d.id)}
                    className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      depth === d.id
                        ? "bg-yellow-300 border-yellow-400 text-slate-900 shadow-xs font-bold"
                        : "bg-white border-[#E3DCCF] text-slate-600 hover:bg-[#EFEADF]"
                    }`}
                  >
                    <d.icon className={`w-4 h-4 shrink-0 ${depth === d.id ? "text-blue-700" : "text-slate-400"}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-y2k font-extrabold leading-none">{d.label}</p>
                      <p className="text-[9px] text-slate-500 truncate mt-0.5">{d.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Source Scope Horizontal Card */}
            <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] space-y-3">
              <span className="block text-[10px] font-y2k font-extrabold uppercase tracking-widest text-slate-500">
                Source Scope
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "all", label: "All Platforms" },
                  { id: "custom", label: "Custom" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSourceMode(option.id)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-y2k font-extrabold uppercase tracking-wider border transition-all cursor-pointer ${
                      sourceMode === option.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white border-[#E3DCCF] text-slate-600 hover:bg-[#EFEADF]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {sourceMode === "custom" && (
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {SOURCE_TARGETS.map((target) => (
                    <button
                      key={target.id}
                      onClick={() => toggleTarget(target.id)}
                      className={`px-2 py-1.5 rounded-md text-[9px] font-y2k font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        platformTargets.includes(target.id)
                          ? "sticker-highlight-green"
                          : "bg-white border-[#E3DCCF] text-slate-600 hover:bg-[#EFEADF]"
                      }`}
                    >
                      <target.icon className="w-3 h-3" /> {target.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Run Button */}
          <button
            onClick={handleResearch}
            disabled={loading || !keyword.trim()}
            className={`w-full blue-label-tag py-3.5 text-xs font-y2k font-extrabold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
              loading ? "opacity-75 cursor-wait" : "hover:scale-[1.01] active:scale-95"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-yellow-300" />
                Crawling 2026 Signals...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Run R&D Intelligence Scan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Results Display */}
      <div className="w-full">
        {error && (
          <div className="p-4 mb-6 rounded-xl sticker-highlight-orange text-white text-xs font-y2k font-extrabold">
            {error}
          </div>
        )}

        {!result && !loading && (
          <div className="w-full paper-sheet p-12 text-center border-2 border-dashed border-[#E3DCCF] shadow-lg flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-yellow-300 border border-yellow-400 text-slate-900 flex items-center justify-center mx-auto mb-4 shadow-sm transform -rotate-3">
              <Compass className="w-8 h-8 text-blue-700" />
            </div>
            <h3 className="text-xl font-y2k font-extrabold text-[#1E2330] mb-2 tracking-tight">
              R&D Workspace Ready
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto font-medium leading-relaxed">
              Enter a topic above to crawl YouTube, Instagram, X, Reddit & News for the latest 2026 signals.
            </p>
          </div>
        )}

        {loading && (
          <div className="w-full paper-sheet p-12 text-center border-2 border-dashed border-[#E3DCCF] shadow-lg flex flex-col items-center justify-center animate-pulse">
            <div className="w-16 h-16 rounded-full bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-y2k font-extrabold text-[#1E2330] mb-6">Crawling 2026 Signals...</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-xl mx-auto w-full">
              {activePlatforms.map((p) => (
                <div key={p} className="p-2.5 rounded-lg bg-[#FAF8F3] border border-[#E3DCCF] text-[10px] font-y2k font-extrabold text-slate-600 uppercase tracking-wider">
                  {PLATFORMS_LIST.find((pl) => pl.id === p)?.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-8 animate-fade-in pb-16">
            {result.isVague ? (
              <VagueResult
                result={result}
                onUseSuggestion={(suggestion) => setKeyword(suggestion)}
              />
            ) : (
              <ResearchResults
                research={result}
                platformData={platformData}
                topKeywords={topKeywords}
                sourceMode={sourceMode}
                platformTargets={platformTargets}
                onUseSuggestion={(suggestion) => setKeyword(suggestion)}
              />
            )}

            {!result.isVague && (
              <div className="sticky bottom-6 left-0 right-0 p-3 bg-white/90 backdrop-blur-md border-2 border-[#E3DCCF] rounded-2xl shadow-2xl flex items-center justify-between gap-4 z-50">
                <div className="pl-4">
                  <p className="text-xs font-y2k font-extrabold text-[#1E2330]">Research Complete</p>
                  <p className="text-[10px] font-y2k font-bold text-blue-600 uppercase tracking-wider">Ready to Script</p>
                </div>
                <button
                  onClick={() => onGoToStudio({ keyword, research: result, platformData, topKeywords, location, depth, researchedAt: new Date().toISOString() })}
                  className="blue-label-tag px-8 py-3 text-xs font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" /> Open Script Studio
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResearchResults({ research, platformData, topKeywords, sourceMode, platformTargets, onUseSuggestion }) {
  const r = research;
  const ytVideos = (platformData?.youtube || []).sort((a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0));
  const igPosts = (platformData?.instagram || []).sort((a, b) => (b.metrics?.likes || 0) - (a.metrics?.likes || 0));
  const igVideoPosts = igPosts.filter((post) => post.isVideo || post.videoUrl || String(post.contentFormat || "").toLowerCase().includes("video") || String(post.contentFormat || "").toLowerCase().includes("reel"));
  const featuredIgPosts = igVideoPosts.length > 0 ? igVideoPosts : igPosts;
  const xPosts = (platformData?.x || []).sort((a, b) => (b.metrics?.likes || 0) - (a.metrics?.likes || 0));
  const newsPosts = (platformData?.news || []).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return (
    <div className="space-y-8">
      {/* Top Strategy Summary Paper Card */}
      <div className="paper-sheet p-6 lg:p-8 shadow-xl space-y-6 border-2 border-[#E3DCCF]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="blue-label-tag px-3 py-1 text-[10px]">R&D Output</span>
              <span className="sticker-highlight-green px-3 py-1 text-[10px]">
                {r.keyword}
              </span>
              <span className="sticker-highlight-cyan px-3 py-1 text-[10px]">
                Fit {r.relevanceCheck?.score || 0}/100
              </span>
            </div>
            <h4 className="text-2xl lg:text-3xl font-y2k font-extrabold text-[#1E2330] tracking-tight">
              Live source signals first, then the deeper strategy.
            </h4>
          </div>
          {r.recommendedStrategy && (
            <div className="post-it-yellow p-4 lg:max-w-sm w-full relative transform rotate-1">
              <div className="tape-overlay" />
              <p className="text-[10px] font-y2k font-extrabold text-slate-700 uppercase tracking-wider">Primary Angle</p>
              <p className="text-sm font-handwriting text-slate-900 font-bold leading-tight mt-1">{r.recommendedStrategy.bestAngle}</p>
            </div>
          )}
        </div>

        {ytVideos.length > 0 && (
          <Section icon={MonitorPlay} label="YouTube Videos" color="text-red-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ytVideos.slice(0, 3).map((video, index) => (
                <div key={`${video.id || index}-yt`} className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] space-y-2">
                  <p className="text-xs font-y2k font-extrabold text-[#1E2330] line-clamp-2">{video.title}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{video.metrics?.views || 0} views</p>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function VagueResult({ result, onUseSuggestion }) {
  return (
    <div className="paper-sheet p-8 shadow-xl space-y-6 border-2 border-[#E3DCCF]">
      <div className="space-y-3">
        <div className="w-12 h-12 rounded-xl bg-yellow-300 border border-yellow-400 text-slate-900 flex items-center justify-center">
          <Compass className="w-6 h-6 text-blue-700" />
        </div>
        <h4 className="text-2xl font-y2k font-extrabold text-[#1E2330]">Refine The Search</h4>
        <p className="text-xs text-slate-600 font-medium">
          {result.message || "This topic is too broad to produce a precise R&D strategy."}
        </p>
      </div>

      {result.suggestions?.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-y2k font-extrabold text-slate-500 uppercase tracking-wider">Suggested Searches</p>
          <div className="flex flex-wrap gap-2">
            {result.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onUseSuggestion(suggestion)}
                className="px-4 py-2 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] text-xs font-y2k font-bold text-[#1E2330] hover:bg-[#EFEADF] transition-all cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ icon: Icon, label, color, children }) {
  return (
    <div className="space-y-3 border-t border-[#E3DCCF] pt-4">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <h5 className="text-xs font-y2k font-extrabold text-[#1E2330] uppercase tracking-wider">{label}</h5>
      </div>
      {children}
    </div>
  );
}
