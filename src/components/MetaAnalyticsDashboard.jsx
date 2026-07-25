"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const PERIOD_OPTIONS = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
];

const COLORS = ["#818cf8", "#a78bfa", "#c084fc", "#e879f9", "#f472b6", "#fb7185", "#fb923c", "#fbbf24"];

function MetricCard({ label, value, change, icon, color = "indigo" }) {
  const isPositive = change > 0;
  const colorMap = {
    indigo: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/20",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/20",
    pink: "from-pink-500/20 to-pink-600/10 border-pink-500/20",
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20",
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color] || colorMap.indigo} border rounded-xl p-5 transition-all hover:scale-[1.02] duration-300`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-sm font-medium">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-white">{typeof value === "number" ? value.toLocaleString() : value}</div>
      {change !== undefined && change !== null && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
          <span>{isPositive ? "↑" : "↓"}</span>
          <span>{Math.abs(change)}%</span>
          <span className="text-slate-500 ml-1">vs last period</span>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-800/50 rounded-xl p-5 h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-800/50 rounded-xl h-80" />
        <div className="bg-slate-800/50 rounded-xl h-80" />
      </div>
    </div>
  );
}

function PostCard({ post }) {
  const engagement = (post.likes || 0) + (post.comments || 0);
  return (
    <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300 group">
      <div className="aspect-square relative bg-slate-900">
        {post.thumbnail ? (
          <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 bg-black/60 backdrop-blur text-white text-xs rounded-md font-medium">
            {post.contentType}
          </span>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-white font-bold text-lg">❤️ {post.likes?.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-lg">💬 {post.comments?.toLocaleString()}</div>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1">❤️ {post.likes?.toLocaleString()}</span>
            <span className="flex items-center gap-1">💬 {post.comments?.toLocaleString()}</span>
          </div>
          {post.insights?.reach > 0 && (
            <span className="text-xs text-indigo-400 font-medium">
              {post.insights.reach.toLocaleString()} reach
            </span>
          )}
        </div>
        {post.caption && (
          <p className="text-xs text-slate-500 mt-2 line-clamp-2">{post.caption}</p>
        )}
      </div>
    </div>
  );
}

export default function MetaAnalyticsDashboard() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [insights, setInsights] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [profileRes, postsRes] = await Promise.all([
        fetch("/api/analytics/profile"),
        fetch("/api/analytics/posts?limit=24"),
      ]);

      const profileData = await profileRes.json();
      const postsData = await postsRes.json();

      if (!profileData.connected) {
        setConnected(false);
        setLoading(false);
        return;
      }

      setConnected(true);
      setProfile(profileData.profile);
      setPosts(postsData.posts || []);

      // Fetch insights in background
      fetch("/api/analytics/insights?period=day")
        .then((r) => r.json())
        .then((d) => setInsights(d.metrics || null))
        .catch(() => {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchAi = useCallback(async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/analytics/ai");
      const data = await res.json();
      setAiInsights(data.insights || null);
    } catch { } finally {
      setAiLoading(false);
    }
  }, []);

  // Not connected state
  if (connected === false) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800/50 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Connect Instagram to See Analytics</h2>
          <p className="text-slate-400 text-sm">Link your Instagram Business or Creator account to unlock detailed performance insights.</p>
          <a
            href="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Connect Instagram →
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6"><LoadingSkeleton /></div>;
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-300 font-medium">Failed to load analytics</p>
          <p className="text-red-400/70 text-sm mt-1">{error}</p>
          <button onClick={fetchData} className="mt-3 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm hover:bg-red-500/30 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Compute derived data
  const totalLikes = posts.reduce((s, p) => s + (p.likes || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comments || 0), 0);
  const avgEngagement = posts.length > 0
    ? ((totalLikes + totalComments) / posts.length / (profile?.followers || 1) * 100).toFixed(2)
    : "0";
  const totalReach = posts.reduce((s, p) => s + (p.insights?.reach || 0), 0);

  // Content type breakdown for pie chart
  const typeMap = {};
  posts.forEach((p) => { typeMap[p.contentType] = (typeMap[p.contentType] || 0) + 1; });
  const pieData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  // Engagement chart data (per post, sorted by date)
  const chartPosts = [...posts]
    .filter((p) => p.timestamp)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map((p) => ({
      date: new Date(p.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      likes: p.likes || 0,
      comments: p.comments || 0,
      reach: p.insights?.reach || 0,
    }));

  // Top posts by engagement
  const topPosts = [...posts].sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments)).slice(0, 6);

  return (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-slate-800/50 rounded-2xl p-6">
        <div className="flex items-center gap-5">
          {profile?.profilePic ? (
            <img src={profile.profilePic} alt={profile.username} className="w-16 h-16 rounded-full ring-2 ring-indigo-500/50" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
              {(profile?.username || "?")[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">@{profile?.username}</h1>
            <p className="text-slate-400 text-sm mt-0.5">{profile?.name} {profile?.bio ? `• ${profile.bio.slice(0, 80)}` : ""}</p>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <div className="text-lg font-bold text-white">{profile?.followers?.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Followers</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{profile?.following?.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Following</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{profile?.postCount?.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Posts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Avg Engagement" value={`${avgEngagement}%`} icon="📊" color="indigo" />
        <MetricCard label="Total Reach" value={totalReach} icon="👁️" color="purple" />
        <MetricCard label="Avg Likes" value={posts.length > 0 ? Math.round(totalLikes / posts.length) : 0} icon="❤️" color="pink" />
        <MetricCard label="Avg Comments" value={posts.length > 0 ? Math.round(totalComments / posts.length) : 0} icon="💬" color="emerald" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Engagement Trend */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Engagement Trend</h3>
            <div className="flex gap-1">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedPeriod(opt.value)}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    selectedPeriod === opt.value
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-slate-500 hover:text-slate-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartPosts}>
              <defs>
                <linearGradient id="likesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="commentsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Area type="monotone" dataKey="likes" stroke="#818cf8" fill="url(#likesGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="comments" stroke="#a78bfa" fill="url(#commentsGrad)" strokeWidth={2} />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Content Type Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Content Mix</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              <Legend formatter={(val) => <span className="text-slate-400 text-xs">{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm">✨</div>
            <h3 className="text-white font-semibold">AI Insights</h3>
          </div>
          {!aiInsights && (
            <button
              onClick={fetchAi}
              disabled={aiLoading}
              className="px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-lg text-sm font-medium hover:bg-indigo-500/30 transition-colors disabled:opacity-50"
            >
              {aiLoading ? "Analyzing..." : "Generate Insights"}
            </button>
          )}
        </div>

        {aiLoading && (
          <div className="flex items-center gap-3 py-4">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Analyzing your account with AI...</p>
          </div>
        )}

        {aiInsights && (
          <div className="space-y-4">
            <p className="text-slate-300 text-sm leading-relaxed">{aiInsights.summary}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <h4 className="text-emerald-300 font-medium text-sm mb-2">💪 Strengths</h4>
                <ul className="space-y-1.5">
                  {(aiInsights.strengths || []).map((s, i) => (
                    <li key={i} className="text-xs text-emerald-400/80 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <h4 className="text-amber-300 font-medium text-sm mb-2">🎯 Improve</h4>
                <ul className="space-y-1.5">
                  {(aiInsights.improvements || []).map((s, i) => (
                    <li key={i} className="text-xs text-amber-400/80 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                <h4 className="text-indigo-300 font-medium text-sm mb-2">💡 Tips</h4>
                <ul className="space-y-1.5">
                  {(aiInsights.contentTips || []).map((s, i) => (
                    <li key={i} className="text-xs text-indigo-400/80 flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {aiInsights.growthPrediction && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">📈 Growth Prediction</p>
                <p className="text-sm text-slate-300">{aiInsights.growthPrediction}</p>
              </div>
            )}
          </div>
        )}

        {!aiInsights && !aiLoading && (
          <p className="text-slate-500 text-sm">Click "Generate Insights" to get AI-powered analysis of your Instagram performance.</p>
        )}
      </div>

      {/* Top Posts Grid */}
      <div>
        <h3 className="text-white font-semibold mb-4">Top Performing Posts</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {topPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      {/* All Recent Posts */}
      <div>
        <h3 className="text-white font-semibold mb-4">Recent Posts ({posts.length})</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {posts.slice(0, 12).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
