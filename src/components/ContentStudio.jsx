"use client";

import { useState, useCallback, useEffect } from "react";
import { MonitorPlay, Smartphone, Clapperboard, Layers, Hash, Briefcase, BookOpen, PenTool, Sparkles, Bot, Tag, Edit3, Loader2, Copy, FileText, Globe, Flame, Wand2, X, Save, CheckCircle2, Volume2, VolumeX, Layers3, Video, Film, Camera } from "lucide-react";
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
  const [isSaved, setIsSaved] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [viewMode, setViewMode] = useState("script"); // "script", "carousel", or "storyboard"
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

  const toggleVoiceover = () => {
    if (!result?.script) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Web Speech API is not supported in this browser.");
      return;
    }
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = result.script.replace(/\[.*?\]/g, "").substring(0, 400);
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Parse carousel slides
  const parseCarouselSlides = (scriptText) => {
    if (!scriptText) return [];
    const lines = scriptText.split("\n").filter(l => l.trim().length > 0);
    const slides = [];
    let currentSlide = null;

    lines.forEach((line) => {
      if (/slide/i.test(line) || /page/i.test(line) || /^#+/i.test(line) || /^\d+[\.\)]/.test(line)) {
        if (currentSlide) slides.push(currentSlide);
        currentSlide = { title: line.replace(/^#+\s*|\d+[\.\)]\s*/, ""), content: [] };
      } else {
        if (!currentSlide) currentSlide = { title: "Slide 1: Intro", content: [] };
        currentSlide.content.push(line);
      }
    });
    if (currentSlide) slides.push(currentSlide);
    return slides.length > 0 ? slides : [{ title: "Slide 1", content: [scriptText] }];
  };

  // Parse Video Storyboard Scenes
  const parseVideoStoryboard = (scriptText) => {
    if (!scriptText) return [];
    const paragraphs = scriptText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    return paragraphs.map((para, index) => {
      const visualMatch = para.match(/\[Visual:(.*?)\]/i) || para.match(/Visual:(.*?)(?=\n|$)/i);
      const audioText = para.replace(/\[Visual:.*?\]/gi, "").trim();
      const duration = index === 0 ? "0-5s (Hook)" : `${index * 5}-${(index + 1) * 5}s`;
      const cameraAngle = index === 0 ? "Extreme Close-Up Push In" : index % 2 === 0 ? "Medium Wide Cut" : "Tight Detail Shot";
      return {
        sceneNumber: index + 1,
        duration,
        cameraAngle,
        visualPrompt: visualMatch ? visualMatch[1].trim() : `Visual scene depiction for: ${audioText.substring(0, 40)}...`,
        voiceoverText: audioText || para,
      };
    });
  };

  const carouselSlides = result ? parseCarouselSlides(result.script) : [];
  const storyboardScenes = result ? parseVideoStoryboard(result.script) : [];

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

                {/* View Mode Selector Tabs */}
                <div className="flex items-center gap-1 bg-[#FAF8F3] p-1 rounded-lg border border-[#E3DCCF]">
                  <button
                    onClick={() => setViewMode("script")}
                    className={`px-3 py-1 text-[10px] font-y2k font-bold rounded cursor-pointer ${
                      viewMode === "script" ? "blue-label-tag text-white" : "text-slate-600"
                    }`}
                  >
                    Script
                  </button>
                  {format.includes("carousel") && (
                    <button
                      onClick={() => setViewMode("carousel")}
                      className={`px-3 py-1 text-[10px] font-y2k font-bold rounded cursor-pointer ${
                        viewMode === "carousel" ? "blue-label-tag text-white" : "text-slate-600"
                      }`}
                    >
                      Slide Deck
                    </button>
                  )}
                  {(format.includes("youtube") || format.includes("reel") || format.includes("short")) && (
                    <button
                      onClick={() => setViewMode("storyboard")}
                      className={`px-3 py-1 text-[10px] font-y2k font-bold rounded cursor-pointer ${
                        viewMode === "storyboard" ? "blue-label-tag text-white" : "text-slate-600"
                      }`}
                    >
                      Video Storyboard
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleVoiceover}
                  className={`px-3.5 py-2 rounded-xl text-xs font-y2k font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isPlayingAudio
                      ? "sticker-highlight-orange text-white animate-pulse"
                      : "bg-white border-[#E3DCCF] text-slate-700 hover:bg-[#EFEADF]"
                  }`}
                  title="Voiceover audio preview"
                >
                  {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
                  {isPlayingAudio ? "Stop Voice" : "Voice Preview"}
                </button>

                <button
                  onClick={handleSave}
                  className={`px-4 py-2 rounded-xl text-xs font-y2k font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSaved
                      ? "sticker-highlight-green text-slate-900"
                      : "bg-white border-[#E3DCCF] text-slate-700 hover:bg-[#EFEADF]"
                  }`}
                >
                  {isSaved ? <CheckCircle2 className="w-4 h-4 text-slate-900" /> : <Save className="w-4 h-4" />}
                  {isSaved ? "Saved" : "Save Script"}
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

            {/* Video Storyboard View */}
            {viewMode === "storyboard" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E3DCCF] pb-2">
                  <h4 className="text-xs font-y2k font-extrabold text-[#1E2330] uppercase tracking-wider flex items-center gap-2">
                    <Film className="w-4 h-4 text-blue-600" /> Video Storyboard Scene Breakdown ({storyboardScenes.length} Scenes)
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {storyboardScenes.map((scene) => (
                    <div key={scene.sceneNumber} className="p-5 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] space-y-3 shadow-xs">
                      <div className="flex items-center justify-between border-b border-[#E3DCCF] pb-2">
                        <span className="sticker-highlight-green px-2 py-0.5 text-[9px] font-bold">
                          Scene {scene.sceneNumber} ({scene.duration})
                        </span>
                        <span className="text-[10px] font-y2k font-bold text-slate-500 flex items-center gap-1">
                          <Camera className="w-3 h-3 text-blue-600" /> {scene.cameraAngle}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-[#E3DCCF]">
                        <p className="text-[10px] font-y2k font-extrabold text-blue-600 uppercase tracking-widest mb-1">Visual Prompt</p>
                        <p className="text-xs font-medium text-slate-700 leading-relaxed italic">{scene.visualPrompt}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-yellow-100/60 border border-yellow-300">
                        <p className="text-[10px] font-y2k font-extrabold text-slate-800 uppercase tracking-widest mb-1">Audio / Voiceover</p>
                        <p className="text-xs font-sans text-slate-900 leading-relaxed">{scene.voiceoverText}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Slide Deck View */}
            {viewMode === "carousel" && format.includes("carousel") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E3DCCF] pb-2">
                  <h4 className="text-xs font-y2k font-extrabold text-[#1E2330] uppercase tracking-wider flex items-center gap-2">
                    <Layers3 className="w-4 h-4 text-blue-600" /> Visual Carousel Slide Deck ({carouselSlides.length} Slides)
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {carouselSlides.map((slide, idx) => (
                    <div key={idx} className="p-5 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] shadow-sm relative space-y-3 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between border-b border-[#E3DCCF] pb-2">
                        <span className="text-[10px] font-y2k font-bold text-blue-600 uppercase tracking-widest">
                          Slide {idx + 1}
                        </span>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      </div>
                      <h5 className="text-xs font-y2k font-extrabold text-[#1E2330]">{slide.title}</h5>
                      <div className="text-[11px] font-sans text-slate-700 leading-relaxed space-y-1">
                        {slide.content.map((line, lIdx) => (
                          <p key={lIdx}>{line}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Standard Script View */}
            {viewMode === "script" && (
              <div className="space-y-4">
                <div className="p-6 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] font-sans text-sm text-[#1E2330] leading-relaxed whitespace-pre-wrap">
                  {result.script}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-y2k font-extrabold uppercase tracking-widest text-slate-500 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
