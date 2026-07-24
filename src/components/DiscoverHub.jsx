"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, MonitorPlay, LucideCamera as Camera, Hash, MessageSquare, Newspaper, Eye, Heart, ExternalLink, Zap, TrendingUp, Bell, ArrowRight } from "lucide-react";

const PLATFORMS = [
  { id: "youtube", label: "YouTube", icon: MonitorPlay, color: "sticker-highlight-pink" },
  { id: "instagram", label: "Instagram", icon: Camera, color: "sticker-highlight-pink" },
  { id: "x", label: "X", icon: Hash, color: "sticker-highlight-cyan" },
  { id: "reddit", label: "Reddit", icon: MessageSquare, color: "sticker-highlight-orange" },
  { id: "news", label: "News", icon: Newspaper, color: "sticker-highlight-green" },
];

const NEWS_SIGNALS = [
  { topic: "NEP 2020 Implementation", desc: "New vocational standards for Grade 6-8", category: "REGULATION" },
  { topic: "AI in Classroom Guidelines", desc: "UNESCO's latest framework for educators", category: "TECHNOLOGY" },
  { topic: "Children Data Privacy 2026", desc: "Updates to digital safety in schools", category: "LEGAL" },
  { topic: "Board Exam Reforms", desc: "Bi-annual testing cycle updates", category: "POLICY" },
];

export default function DiscoverHub({ onStartResearch }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState(PLATFORMS.map((p) => p.id));
  const [sortBy, setSortBy] = useState("score");
  const [expanded, setExpanded] = useState(null);

  const handleSearch = useCallback(async (q) => {
    const term = q || query;
    if (!term.trim()) return;
    setLoading(true); setError(null); setResults([]); setQuery(term);

    try {
      const res = await fetch(`/api/discover?q=${encodeURIComponent(term)}&platforms=${selectedPlatforms.join(",")}`);
      if (!res.ok) throw new Error("Discovery failed");
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [query, selectedPlatforms]);

  return (
    <div className="min-h-screen bg-desk-canvas p-6 lg:p-10 max-w-6xl mx-auto space-y-8 animate-fade-in font-sans text-[#1E2330]">
      {/* Educational News Signals Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#E3DCCF] pb-3">
          <h3 className="text-xs font-y2k font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" /> Educational Headlines & Changes
          </h3>
          <span className="sticker-highlight-green px-3 py-1 text-xs flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-blue-800" /> Live Newsjacking Enabled
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {NEWS_SIGNALS.map((news, i) => (
            <button 
              key={i} 
              onClick={() => { setQuery(news.topic); handleSearch(news.topic); }}
              className="p-4 rounded-xl bg-white border border-[#E3DCCF] hover:shadow-lg transition-all text-left group cursor-pointer relative overflow-hidden shadow-sm hover:rotate-1"
            >
              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-y2k font-extrabold blue-label-tag mb-2">
                {news.category}
              </span>
              <h4 className="text-xs font-y2k font-extrabold text-[#1E2330] mb-1 group-hover:text-blue-600 transition-colors">{news.topic}</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed line-clamp-2">{news.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Search Discovery Paper Sheet Binder */}
      <div className="paper-sheet-binder p-8 shadow-xl space-y-6 border-2 border-[#E3DCCF] relative">
        <div className="absolute top-0 left-0 right-0 h-5 paper-binder-holes opacity-60" />

        <div className="relative space-y-5 mt-1">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <h2 className="text-2xl font-y2k font-extrabold text-[#1E2330] tracking-tight flex items-center justify-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" /> Social Intelligence Discovery
            </h2>
            <p className="text-xs text-slate-600 font-medium">Scan social signals to see how educational changes are being discussed online.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder='Enter topic or paste headline...'
                className="w-full pl-10 pr-36 py-3.5 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] text-sm font-y2k font-extrabold text-[#1E2330] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600" />
              <Search className="absolute left-3.5 text-slate-400 w-4 h-4" />
              <button type="submit" disabled={loading || !query.trim()}
                className={`absolute right-2 blue-label-tag px-4 py-2 text-xs font-bold transition-all ${loading ? "opacity-75 cursor-wait" : query.trim() ? "hover:scale-105 shadow-md cursor-pointer" : "opacity-50 cursor-not-allowed"}`}>
                {loading ? "Crawling Platforms..." : "Discover Signals"}
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {PLATFORMS.map((p) => (
              <button key={p.id} onClick={() => setSelectedPlatforms((prev) => prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id])}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-y2k font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${selectedPlatforms.includes(p.id) ? p.color : "bg-white border-[#E3DCCF] text-slate-400 opacity-50 hover:opacity-100"}`}>
                <p.icon className="w-3.5 h-3.5" /> {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="p-4 rounded-xl sticker-highlight-orange text-white text-xs font-y2k font-extrabold">{error}</div>}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1 border-b border-[#E3DCCF] pb-2">
            <h3 className="text-xs font-y2k font-extrabold text-[#1E2330]">{results.length} Competitive Signals Found</h3>
            <div className="flex gap-1 p-1 rounded-xl bg-white border border-[#E3DCCF]">
              {["score", "views", "recent"].map((s) => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-y2k font-extrabold cursor-pointer transition-all uppercase tracking-wider ${sortBy === s ? "blue-label-tag text-white" : "text-slate-500 hover:text-[#1E2330]"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {results.sort((a, b) => {
              if (sortBy === "views") return (b.metrics?.views || 0) - (a.metrics?.views || 0);
              if (sortBy === "recent") return new Date(b.publishedAt) - new Date(a.publishedAt);
              return (b.score || 0) - (a.score || 0);
            }).map((item, i) => {
              const pm = PLATFORMS.find((p) => p.id === item.platform) || { icon: Newspaper, label: item.platform, color: "" };
              const isExpanded = expanded === (item.id || i);
              return (
                <div key={item.id || i} onClick={() => setExpanded(isExpanded ? null : (item.id || i))}
                  className="paper-sheet p-5 border border-[#E3DCCF] hover:shadow-lg transition-all cursor-pointer group shadow-sm">
                  <div className="flex gap-4">
                    <div className="shrink-0 flex flex-col items-center gap-2 pt-1">
                      <div className="w-7 h-7 rounded-lg bg-yellow-300 border border-yellow-400 font-y2k font-black text-slate-900 flex items-center justify-center text-xs">{i + 1}</div>
                      <div className="text-[9px] font-y2k font-bold sticker-highlight-green px-1.5 rounded">{item.score}</div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-xs font-y2k font-extrabold text-[#1E2330] leading-snug group-hover:text-blue-600 transition-colors">{item.title}</h4>
                        <span className={`shrink-0 p-1.5 rounded-lg border ${pm.color}`}><pm.icon className="w-3.5 h-3.5" /></span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-y2k font-bold text-slate-500 uppercase tracking-wider">
                        <span className="truncate text-blue-600">{item.author}</span>
                        <span>•</span>
                        <span>{new Date(item.publishedAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                      
                      {!isExpanded && (
                        <div className="flex gap-4 pt-1">
                          {item.metrics?.views > 0 && <span className="text-[10px] font-y2k font-bold text-slate-600 flex items-center gap-1"><Eye className="w-3 h-3 text-slate-400" /> {fmt(item.metrics.views)}</span>}
                          {item.metrics?.likes > 0 && <span className="text-[10px] font-y2k font-bold text-slate-600 flex items-center gap-1"><Heart className="w-3 h-3 text-red-500" /> {fmt(item.metrics.likes)}</span>}
                          <div className="ml-auto flex items-center gap-1 text-blue-600 group-hover:translate-x-1 transition-transform">
                            <span className="text-[9px] font-y2k font-extrabold uppercase tracking-wider">Analyze</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      )}

                      {isExpanded && (
                        <div className="pt-3 border-t border-[#E3DCCF] space-y-3 animate-fade-in">
                          {item.description && <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.description}</p>}
                          <div className="flex gap-2">
                            <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                              className="flex-1 py-2 rounded-lg text-[10px] font-y2k font-bold bg-white border border-[#E3DCCF] text-[#1E2330] flex items-center justify-center gap-1.5 hover:bg-[#EFEADF] transition-all">
                              View on {pm.label} <ExternalLink className="w-3 h-3" />
                            </a>
                            <button onClick={(e) => { e.stopPropagation(); onStartResearch?.(item.title); }}
                              className="flex-1 py-2 rounded-lg text-[10px] font-y2k font-bold blue-label-tag flex items-center justify-center gap-1.5 hover:scale-105 transition-all cursor-pointer">
                              <Search className="w-3 h-3 text-yellow-300" /> Research Topic
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-white border border-[#E3DCCF]" />
          ))}
        </div>
      )}
    </div>
  );
}

function fmt(n) { if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`; if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`; return String(n); }
