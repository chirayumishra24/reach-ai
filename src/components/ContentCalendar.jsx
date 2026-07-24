"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, RefreshCw, Clock, Check } from "lucide-react";
import { useContentHistory } from "@/lib/storage";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ContentCalendar({ onSelectPost }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [metaScheduled, setMetaScheduled] = useState([]);
  const [loading, setLoading] = useState(false);
  const items = useContentHistory();

  const fetchMetaScheduled = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/meta/schedule");
      const data = await res.json();
      if (data.posts) {
        setMetaScheduled(data.posts);
      }
    } catch (err) {
      console.warn("Failed to fetch scheduled posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetaScheduled();
  }, [fetchMetaScheduled]);

  // Combine local draft/approved items and Meta scheduled posts
  const allScheduledItems = useMemo(() => {
    const local = items.map((item) => ({
      id: item.id,
      title: item.keyword || "Untitled draft",
      format: item.format,
      type: "local",
      scheduledDate: item.metadata?.scheduledDate || item.savedAt?.slice(0, 10),
      status: item.status || "draft",
      platforms: item.metadata?.platforms || [],
    }));

    const meta = metaScheduled.map((post) => ({
      id: post.id,
      title: post.caption.substring(0, 40) + (post.caption.length > 40 ? "..." : ""),
      format: post.platforms.join(" + "),
      type: "meta",
      scheduledDate: post.scheduledAt?.slice(0, 10),
      status: post.status,
      platforms: post.platforms,
      fullPost: post,
    }));

    return [...local, ...meta];
  }, [items, metaScheduled]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayIndex };
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const today = new Date();

  const { daysInMonth, firstDayIndex } = getDaysInMonth(currentDate);
  const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-desk-canvas p-6 lg:p-10 max-w-6xl mx-auto space-y-8 animate-fade-in font-sans text-[#1E2330]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#E3DCCF] pb-4">
        <div>
          <h3 className="text-2xl font-y2k font-extrabold text-[#1E2330] tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" strokeWidth={2.5} /> Content Calendar
          </h3>
          <p className="text-xs text-slate-600 font-medium">Track local drafts and live Meta scheduled posts across your pipeline.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMetaScheduled}
            className="p-2 rounded-xl bg-white border border-[#E3DCCF] cursor-pointer hover:bg-[#EFEADF] transition-all shadow-xs"
            title="Refresh schedule"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 rounded-xl bg-white border border-[#E3DCCF] cursor-pointer hover:bg-[#EFEADF] transition-all shadow-xs">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-sm font-y2k font-extrabold text-[#1E2330] w-36 text-center">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button onClick={nextMonth} className="p-2 rounded-xl bg-white border border-[#E3DCCF] cursor-pointer hover:bg-[#EFEADF] transition-all shadow-xs">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="paper-sheet-binder p-6 shadow-xl border-2 border-[#E3DCCF] relative">
        <div className="absolute top-0 left-0 right-0 h-4 paper-binder-holes opacity-60" />
        <div className="grid grid-cols-7 border-b border-[#E3DCCF] bg-[#FAF8F3] pt-2 pb-2">
          {DAYS.map((day) => (
            <div key={day} className="text-center text-[10px] font-y2k font-extrabold uppercase tracking-widest text-slate-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[130px] border-t border-l border-[#E3DCCF]">
          {blanks.map((i) => (
            <div key={`blank-${i}`} className="border-r border-b border-[#E3DCCF] bg-[#FAF8F3]/50" />
          ))}

          {days.map((day) => {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
            const itemsToday = allScheduledItems.filter((item) => item.scheduledDate === dateStr);

            return (
              <div key={day} className={`p-2 border-r border-b border-[#E3DCCF] relative group ${isToday ? "bg-yellow-100/50" : "bg-white"}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-y2k font-extrabold ${isToday ? "w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs" : "text-slate-500"}`}>
                    {day}
                  </span>
                  {onSelectPost && (
                    <button
                      onClick={() => onSelectPost({ scheduledDate: dateStr })}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded bg-slate-100 hover:bg-slate-200 transition-opacity cursor-pointer"
                      title="Schedule post on this day"
                    >
                      <Plus className="w-3 h-3 text-slate-500" />
                    </button>
                  )}
                </div>

                <div className="mt-2 space-y-1.5 max-h-[84px] overflow-y-auto custom-scroll pr-1">
                  {itemsToday.map((item) => {
                    const isMeta = item.type === "meta";
                    const isPublished = item.status === "published";
                    const isFailed = item.status === "failed";

                    let badgeColor = "bg-primary/10 border-primary/20 text-primary";
                    if (isMeta) {
                      if (isPublished) badgeColor = "bg-emerald-50 border-emerald-200 text-emerald-700";
                      else if (isFailed) badgeColor = "bg-rose-50 border-rose-200 text-rose-700";
                      else badgeColor = "bg-indigo-50 border-indigo-200 text-indigo-700";
                    } else if (item.status === "approved") {
                      badgeColor = "bg-amber-50 border-amber-200 text-amber-700";
                    }

                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectPost && onSelectPost(item)}
                        className={`p-2 rounded-lg border text-[9px] font-bold ${badgeColor} cursor-pointer hover:shadow-sm transition-all`}
                        title={`${item.title} (${item.status})`}
                      >
                        <div className="truncate flex items-center gap-1">
                          {isMeta && (isPublished ? <Check className="w-2 h-2 shrink-0" /> : <Clock className="w-2 h-2 shrink-0" />)}
                          {item.title}
                        </div>
                        <div className="mt-1 uppercase opacity-80 flex items-center justify-between">
                          <span>{item.format?.replace(/_/g, " ")}</span>
                          <span className="text-[7px] font-black">{isMeta ? "Queued" : "Draft"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
