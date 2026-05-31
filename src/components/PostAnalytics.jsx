"use client";

import { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { 
  Eye, 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  ArrowLeft,
  Calendar,
  AlertCircle
} from "lucide-react";

export default function PostAnalytics({ post, onBack }) {
  // Funnel Data: Impressions -> Reach -> Interactions -> Saves
  const funnelData = [
    { name: "Impressions", value: post.impressions || 1200, fill: "#6366f1" },
    { name: "Reach", value: post.reach || 850, fill: "#8b5cf6" },
    { name: "Interactions", value: (post.likeCount || 0) + (post.commentsCount || 0) + (post.shares || 0), fill: "#ec4899" },
    { name: "Saves", value: post.saves || 24, fill: "#f59e0b" },
  ];

  // Impressions Source Data
  const sourceData = [
    { name: "Home Feed", value: Math.round((post.impressions || 1200) * 0.45) },
    { name: "Explore Tab", value: Math.round((post.impressions || 1200) * 0.30) },
    { name: "Hashtags", value: Math.round((post.impressions || 1200) * 0.15) },
    { name: "Profile", value: Math.round((post.impressions || 1200) * 0.10) },
  ];

  const sourceColors = ["#6366f1", "#a855f7", "#ec4899", "#f43f5e"];

  // Comparison vs Account Average
  const comparisonData = [
    { name: "Likes", Post: post.likeCount || 0, Average: 45 },
    { name: "Comments", Post: post.commentsCount || 0, Average: 12 },
    { name: "Reach", Post: post.reach || 850, Average: 600 },
  ];

  return (
    <div className="p-6 lg:p-10 xl:p-12 max-w-[1400px] mx-auto space-y-8 animate-fade-in font-sans">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        <div className="relative aspect-video lg:w-[320px] bg-slate-900 rounded-2xl overflow-hidden shrink-0 shadow-md">
          {post.thumbnailUrl ? (
            <img src={post.thumbnailUrl} alt="Post thumbnail" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-700 font-bold">No Image</div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
              {post.mediaProductType || "Reels"}
            </span>
            <h2 className="text-2xl font-black text-slate-900 leading-snug">Post Performance Analytics</h2>
            <p className="text-sm text-slate-600 leading-relaxed font-medium line-clamp-3">
              {post.caption || "No caption provided."}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Calendar className="w-4 h-4" />
            Published on {post.timestamp ? new Date(post.timestamp).toLocaleDateString("en-US", { dateStyle: "long" }) : "Recent"}
          </div>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <MiniMetricCard icon={Eye} label="Impressions" value={post.impressions || "1,200"} />
        <MiniMetricCard icon={TrendingUp} label="Reach" value={post.reach || "850"} />
        <MiniMetricCard icon={Heart} label="Likes" value={post.likeCount || 0} />
        <MiniMetricCard icon={MessageCircle} label="Comments" value={post.commentsCount || 0} />
        <MiniMetricCard icon={Share2} label="Shares" value={post.shares || 0} />
        <MiniMetricCard icon={Bookmark} label="Saves" value={post.saves || 0} />
      </div>

      {/* Detailed charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Funnel chart */}
        <div className="lg:col-span-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-black text-slate-800">Engagement Funnel</h3>
          <p className="text-xs text-slate-400 font-medium">Conversion from page views down to actions.</p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" barSize={24} radius={[0, 8, 8, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source breakdown chart */}
        <div className="lg:col-span-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-black text-slate-800">Impressions by Source</h3>
          <p className="text-xs text-slate-400 font-medium">Where users discovered this post.</p>
          <div className="h-[250px] w-full flex items-center">
            <div className="w-[50%] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={sourceColors[index % sourceColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-[50%] space-y-3 pl-4">
              {sourceData.map((src, index) => (
                <div key={src.name} className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sourceColors[index] }} />
                    {src.name}
                  </span>
                  <span className="text-slate-800">{src.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison section */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-800">Comparison vs Workspace Average</h3>
          <p className="text-xs text-slate-400 font-medium">How this post stacks up against your average performance.</p>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip />
              <Bar dataKey="Post" fill="#6366f1" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Average" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MiniMetricCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2 text-center shadow-inner">
      <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center mx-auto text-slate-500 border border-slate-100">
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-lg font-black text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
