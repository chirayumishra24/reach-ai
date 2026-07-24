"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Zap, Bot, Microscope, Wand2, Star } from "lucide-react";

export default function MorningBriefing({ onStartResearch, onGoToStudio }) {
  const [briefings, setBriefings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate pre-analyzed insights (Autopilot)
    setTimeout(() => {
      setBriefings([
        {
          id: 1,
          topic: "NEP 2024: Foundational Stage",
          summary: "Karnataka government just released new guidelines for pre-primary schools. Parents are searching for 'age criteria 2024' and 'play-way vs formal'.",
          recommendedFormat: "instagram_reel",
          impact: "HIGH",
          keyword: "NEP Karnataka Pre-Primary 2024",
          angle: "The 'Direct' School's approach to the new 3-8 age bracket."
        },
        {
          id: 2,
          topic: "AI in Classroom: Ethics",
          summary: "Viral debate on X regarding AI tools in homework. 65% of parents in urban India are concerned about critical thinking loss.",
          recommendedFormat: "x_thread",
          impact: "CRITICAL",
          keyword: "AI Ethics for School Children",
          angle: "Why our school teaches AI as a tool, not a crutch."
        },
        {
          id: 3,
          topic: "Student Wellness First",
          summary: "Rising trend in 'low-stress' schooling. Data shows 40% increase in interest for schools with mandatory sports/arts.",
          recommendedFormat: "linkedin_post",
          impact: "MEDIUM",
          keyword: "Holistic Education Growth India",
          angle: "Moving beyond grades: Our institutional vision for 2025."
        }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <div className="w-full p-8 paper-sheet shadow-xl space-y-6 animate-pulse">
        <div className="h-4 w-48 bg-slate-200 rounded-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-36 bg-slate-200 rounded-xl" />
          <div className="h-36 bg-slate-200 rounded-xl" />
          <div className="h-36 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full paper-sheet p-6 lg:p-8 shadow-xl relative overflow-hidden group flex flex-col border-2 border-[#E3DCCF]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DCCF] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-yellow-300 border border-yellow-400 text-slate-900 shadow-sm">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-y2k font-extrabold text-[#1E2330] uppercase tracking-wider">Director's Morning Briefing</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] font-y2k font-bold text-slate-500 uppercase tracking-wider">Autopilot Intelligence Scan</p>
              <span className="text-[10px] text-slate-400">•</span>
              <p className="text-[9px] font-mono font-bold text-blue-600 uppercase tracking-widest">Last Scanned: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>
        <div className="sticker-highlight-pink px-3.5 py-1 text-xs self-start sm:self-auto shadow-sm">
          3 NEW SIGNALS
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {briefings.map((b) => (
          <div key={b.id} className="p-5 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[9px] font-y2k font-bold px-2 py-0.5 rounded shadow-xs ${
                  b.impact === "CRITICAL" ? "sticker-highlight-orange" : 
                  b.impact === "HIGH" ? "sticker-highlight-green" : 
                  "sticker-highlight-cyan"
                }`}>
                  {b.impact} IMPACT
                </span>
                <h5 className="text-sm font-y2k font-extrabold text-[#1E2330] tracking-tight truncate">{b.topic}</h5>
              </div>
              
              <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3">
                {b.summary}
              </p>
              
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E3DCCF] text-[9px] font-y2k font-bold text-slate-500 truncate">
                <Wand2 className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="truncate">Strategy: {b.angle}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-[#E3DCCF]">
              <button 
                onClick={() => onStartResearch(b.keyword)}
                className="blue-label-tag py-2 text-[10px] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <Microscope className="w-3.5 h-3.5" /> Analyze
              </button>
              <button 
                onClick={() => onGoToStudio({ 
                  keyword: b.keyword, 
                  research: { executiveSummary: b.summary, suggestedAngles: [{ angle: b.angle }] },
                  format: b.recommendedFormat
                })}
                className="py-2 rounded-lg bg-white border border-[#E3DCCF] text-[#1E2330] text-[10px] font-y2k font-bold flex items-center justify-center gap-1 hover:bg-[#EFEADF] active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                 Draft <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
