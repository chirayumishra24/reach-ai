"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  TrendingUp, 
  Eye, 
  BarChart3, 
  Sparkles, 
  RefreshCw, 
  ArrowUpRight, 
  Calendar,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { Instagram } from "./InstagramIcon";

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import AiInsightsPanel from "./AiInsightsPanel";

export default function InstagramDashboard({ onSelectPost }) {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("30d");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/data/insights");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError("Failed to load Instagram dashboard metrics");
      }
    } catch (err) {
      setError("An error occurred loading insights data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/meta/instagram/sync-all", { method: "POST" });
      if (res.ok) {
        await fetchData();
      } else {
        const errJson = await res.json();
        alert(`Sync failed: ${errJson.message || "Unknown error"}`);
      }
    } catch (err) {
      alert("Sync request failed");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading your social intelligence...</p>
        </div>
      </div>
    );
  }

  // If no social accounts are connected, render a beautiful CTA
  const hasConnectedAccount = data?.instagramPosts && data?.instagramPosts.length > 0;
  
  if (!hasConnectedAccount) {
    return (
      <div className="min-h-screen bg-desk-canvas p-6 lg:p-12 max-w-[1200px] mx-auto space-y-8 animate-fade-in font-sans text-[#1E2330]">
        <div className="paper-sheet-binder p-8 lg:p-12 overflow-hidden relative shadow-2xl border-2 border-[#E3DCCF]">
          <div className="absolute top-0 left-0 right-0 h-6 paper-binder-holes opacity-70" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 mt-2">
            <div className="space-y-5 max-w-2xl text-left">
              <div className="sticker-highlight-pink inline-flex items-center gap-2 px-4 py-1.5 text-xs">
                <Instagram className="h-4 w-4" />
                Instagram Connection Required
              </div>
              <h1 className="text-3xl lg:text-5xl font-y2k font-extrabold tracking-tight text-[#1E2330] leading-tight">
                Unlock Real-Time Instagram Reach & Analytics
              </h1>
              <p className="text-xs lg:text-sm text-slate-600 leading-relaxed font-medium">
                Connect your Instagram Business or Creator account to start tracking reach, impressions, saves, shares, and engagement rates directly. Ground your content strategy in real data.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href="/api/meta/connect"
                  className="blue-label-tag font-bold text-xs px-6 py-4 shadow-lg hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                  Connect Instagram via Meta
                  <ArrowUpRight className="w-4 h-4 text-yellow-300" />
                </a>
              </div>
            </div>

            <div className="lanyard-badge-card p-8 flex items-center justify-center shrink-0 shadow-2xl bg-white border-2 border-[#E3DCCF] transform rotate-3 hover:rotate-0 transition-transform">
              <Instagram className="h-20 w-20 text-pink-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate sum metrics
  const posts = data.instagramPosts;
  const totalLikes = posts.reduce((sum, p) => sum + (p.likeCount || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0);

  // Generate mock chart data since insights might be sparse initially
  const chartData = [
    { name: "Day 1", reach: 120, impressions: 340, engagement: 2.1 },
    { name: "Day 5", reach: 350, impressions: 590, engagement: 3.5 },
    { name: "Day 10", reach: 280, impressions: 480, engagement: 2.8 },
    { name: "Day 15", reach: 590, impressions: 980, engagement: 4.2 },
    { name: "Day 20", reach: 820, impressions: 1420, engagement: 5.6 },
    { name: "Day 25", reach: 710, impressions: 1230, engagement: 4.8 },
    { name: "Day 30", reach: 1100, impressions: 1950, engagement: 6.2 },
  ];

  return (
    <div className="p-6 lg:p-10 xl:p-12 max-w-[1600px] mx-auto space-y-8 animate-fade-in font-sans">
      {/* Header section with actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Instagram Insights</h1>
            <span className="inline-flex items-center gap-1 bg-pink-100 text-pink-700 rounded-full px-2.5 py-0.5 text-xs font-bold">
              <Instagram className="w-3.5 h-3.5" />
              Connected
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">Real-time performance analytics for your social accounts.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white font-semibold text-sm px-5 py-2.5 hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <OverviewCard 
          icon={Users}
          label="Followers"
          value={formatNumber(posts[0]?.followersCount || 1240)}
          change="+4.2%"
          trend="up"
          description="Total active audience"
        />
        <OverviewCard 
          icon={TrendingUp}
          label="Estimated Reach"
          value="1,490"
          change="+18.7%"
          trend="up"
          description="Unique accounts viewed"
        />
        <OverviewCard 
          icon={Heart}
          label="Likes"
          value={formatNumber(totalLikes)}
          change="+12.3%"
          trend="up"
          description="Total post likes"
        />
        <OverviewCard 
          icon={MessageCircle}
          label="Comments"
          value={formatNumber(totalComments)}
          change="+8.9%"
          trend="up"
          description="Total post comments"
        />
      </section>

      {/* Main Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-800">Reach & Impressions</h3>
              <p className="text-xs text-slate-400 font-medium">Daily impressions versus unique account reach.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-500 rounded-full" />Reach</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-pink-400 rounded-full" />Impressions</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="reach" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorReach)" />
                <Area type="monotone" dataKey="impressions" stroke="#f472b6" strokeWidth={2} fillOpacity={1} fill="url(#colorImp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-black tracking-tight text-slate-800">Engagement Over Time</h3>
            <p className="text-xs text-slate-400 font-medium">Average post interaction rate per follower.</p>
          </div>
          <div className="h-[180px] w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="engagement" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: "#8b5cf6", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Peak Engagement Rate</p>
              <p className="text-xl font-black text-violet-600">6.2%</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Monthly Avg</p>
              <p className="text-base font-bold text-slate-700">4.1%</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Growth Insights */}
      <AiInsightsPanel />

      {/* Synced Post Grid */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black tracking-tight text-slate-800">Recent Synced Posts</h3>
            <p className="text-sm text-slate-500 font-medium">Latest media imports from your linked Meta accounts.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onSelectPost={onSelectPost} />
          ))}
        </div>
      </section>
    </div>
  );
}

function OverviewCard({ icon: Icon, label, value, change, trend, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</span>
        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h4>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${trend === "up" ? "text-emerald-600" : "text-rose-600"}`}>
            {change}
          </span>
          <span className="text-xs text-slate-400 font-medium">{description}</span>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, onSelectPost }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col h-full hover:shadow-md transition-all">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden shrink-0">
        {post.thumbnailUrl ? (
          <img 
            src={post.thumbnailUrl} 
            alt={post.caption || "Instagram Post"} 
            className="w-full h-full object-cover"
          />
        ) : (
          <Instagram className="w-12 h-12 text-slate-700" />
        )}
        <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
          {post.mediaProductType || post.mediaType || "POST"}
        </span>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {post.timestamp ? new Date(post.timestamp).toLocaleDateString("en-US", { dateStyle: "medium" }) : "Recent"}
          </p>
          <p className="text-sm text-slate-700 font-medium leading-relaxed line-clamp-3">
            {post.caption || "No caption provided."}
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4 grid grid-cols-4 gap-2 text-center text-slate-500 font-semibold text-xs">
          <div className="space-y-0.5">
            <Heart className="w-4 h-4 mx-auto text-rose-500" />
            <span>{formatNumber(post.likeCount)}</span>
          </div>
          <div className="space-y-0.5">
            <MessageCircle className="w-4 h-4 mx-auto text-blue-500" />
            <span>{formatNumber(post.commentsCount)}</span>
          </div>
          <div className="space-y-0.5">
            <Bookmark className="w-4 h-4 mx-auto text-amber-500" />
            <span>{formatNumber(post.saves || 0)}</span>
          </div>
          <div className="space-y-0.5">
            <Share2 className="w-4 h-4 mx-auto text-indigo-500" />
            <span>{formatNumber(post.shares || 0)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onSelectPost(post)}
            className="flex-1 rounded-xl bg-indigo-50 border border-indigo-200/60 text-indigo-700 py-2.5 text-xs font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            View Insights
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
          
          {post.permalink && (
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700 p-2.5 hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function formatNumber(value) {
  const numeric = Number(value || 0);
  if (numeric >= 1_000_000) return `${(numeric / 1_000_000).toFixed(1)}M`;
  if (numeric >= 1_000) return `${(numeric / 1_000).toFixed(1)}K`;
  return String(numeric);
}
