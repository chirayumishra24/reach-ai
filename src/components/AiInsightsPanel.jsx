"use client";

import { useState, useEffect } from "react";
import { Sparkles, Brain, Clock, Zap, Target, RefreshCw } from "lucide-react";

export default function AiInsightsPanel() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/data/ai-insights");
      if (res.ok) {
        const json = await res.json();
        setInsights(json);
      }
    } catch (err) {
      console.error("Failed to load AI insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleRefresh = async () => {
    setGenerating(true);
    await fetchInsights();
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Consulting AI research agent...</p>
        </div>
      </div>
    );
  }

  const { topFormats, bestTime, actionableTips, topicRecommendations } = insights || {
    topFormats: [],
    bestTime: "No data",
    actionableTips: [],
    topicRecommendations: []
  };

  return (
    <div className="rounded-[2.5rem] bg-slate-900 border border-slate-800 p-6 lg:p-8 relative overflow-hidden text-slate-100 shadow-xl">
      {/* Background neon effect */}
      <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-[80px]" />
      
      <div className="relative space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-indigo-300">
              <Brain className="w-3.5 h-3.5" />
              Reach.ai Agent
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white mt-2">Strategic Intelligence</h3>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={generating}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white transition-all hover:bg-slate-900 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Formats & Best Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/30 p-5 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Peak Performance Format</p>
            {topFormats.map((f, i) => (
              <div key={i} className="flex justify-between items-center gap-3">
                <div>
                  <h4 className="text-base font-black text-white">{f.format}</h4>
                  <p className="text-xs text-slate-500 leading-normal mt-0.5">{f.reason}</p>
                </div>
                <span className="shrink-0 text-lg font-black text-indigo-400">{f.multiplier}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/30 p-5 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Recommended Posting Window</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-950/55 border border-indigo-800/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{bestTime}</h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Yields maximum initial engagement speed.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Tips */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Data-Backed Growth Recommendations</p>
          <ul className="space-y-2 text-xs font-semibold text-slate-300">
            {actionableTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 leading-relaxed bg-slate-950/20 border border-slate-800/40 p-3.5 rounded-xl">
                <span className="w-5 h-5 rounded-md bg-indigo-950/40 text-indigo-400 flex items-center justify-center shrink-0 text-[10px] font-bold">{i + 1}</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Topic Recommendation */}
        {topicRecommendations.length > 0 && (
          <div className="border-t border-slate-800 pt-5 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Next Recommended Draft</p>
            <div className="rounded-2xl bg-gradient-to-r from-indigo-950/30 to-pink-950/10 border border-slate-800 p-5 flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-black text-white truncate">{topicRecommendations[0].topic}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{topicRecommendations[0].angle}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
