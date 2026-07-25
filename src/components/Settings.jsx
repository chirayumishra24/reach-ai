"use client";

import { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  BrainCircuit, 
  Globe, 
  Zap, 
  CheckCircle2, 
  Save, 
  UserCheck, 
  ShieldCheck, 
  HeartPulse, 
  GraduationCap, 
  Database, 
  Info,
  Link,
  Trash2,
  AlertCircle,
  CreditCard
} from "lucide-react";
import { Instagram } from "./InstagramIcon";
import BillingSettings from "./BillingSettings";

const PERSONAS = [
  { id: "visionary", label: "Visionary Leader", desc: "Inspiring, forward-thinking, and bold.", icon: BrainCircuit },
  { id: "nurturing", label: "Nurturing Mentor", desc: "Empathetic, supportive, and parent-focused.", icon: HeartPulse },
  { id: "authoritative", label: "Professional Expert", desc: "Direct, factual, and strictly academic.", icon: ShieldCheck },
  { id: "community", label: "Community Pillar", desc: "Inclusive, warm, and locally engaged.", icon: GraduationCap },
];

const LOCATIONS = [
  { code: "IN", label: "India", icon: Globe }, { code: "US", label: "United States", icon: Globe },
  { code: "GB", label: "United Kingdom", icon: Globe }, { code: "GLOBAL", label: "Global", icon: Globe },
];

export default function Settings() {
  const [settings, setSettings] = useState(() => {
    const defaults = {
      defaultLocation: "IN", defaultLanguage: "en",
      defaultFormat: "youtube_long", defaultStyle: "professional",
      aiModel: "pro", geminiKey: "", youtubeKey: "",
      directorPersona: "visionary",
      brandTone: "Authoritative, nurturing, informative, and professional.",
      brandAvoidWords: "viral, smash the like button, clickbait, buy now",
      brandTargetAudience: "Parents of K-12 students, prospective families, and the local community.",
      brandCoreValues: "Holistic education, child safety, academic excellence, transparency.",
      schoolContext: "",
    };

    try {
      const { getSettings } = require("@/lib/storage");
      return { ...defaults, ...getSettings() };
    } catch {
      return defaults;
    }
  });

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("persona");
  
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const fetchConnections = async () => {
    setLoadingAccounts(true);
    try {
      const res = await fetch("/api/data/insights");
      if (res.ok) {
        const data = await res.json();
        if (data.instagramPosts) {
          const accountsMap = {};
          data.instagramPosts.forEach(p => {
            if (p.socialAccountId) {
              accountsMap[p.socialAccountId] = {
                id: p.socialAccountId,
                username: p.username || "connected_instagram",
                platform: "instagram",
                followers: p.followersCount || 0
              };
            }
          });
          setSocialAccounts(Object.values(accountsMap));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    if (activeTab === "connections") {
      fetchConnections();
    }
  }, [activeTab]);

  const handleSave = () => {
    try {
      const { saveSettings } = require("@/lib/storage");
      saveSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  const update = (key, value) => setSettings((p) => ({ ...p, [key]: value }));

  return (
    <div className="min-h-screen bg-desk-canvas p-6 lg:p-10 max-w-5xl mx-auto space-y-8 animate-fade-in font-sans text-[#1E2330]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#E3DCCF] pb-4">
        <div>
          <h3 className="text-2xl font-y2k font-extrabold text-[#1E2330] tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-blue-600" strokeWidth={2.5} /> System Configuration
          </h3>
          <p className="text-xs text-slate-600 font-medium">Customize your institutional voice and AI intelligence parameters.</p>
        </div>

        <div className="flex p-1 rounded-xl bg-white border border-[#E3DCCF] shadow-xs">
          {[
            { id: "persona", l: "Identity", icon: UserCheck }, 
            { id: "knowledge", l: "Knowledge Base", icon: Database }, 
            { id: "connections", l: "Connections", icon: Instagram }, 
            { id: "billing", l: "Billing", icon: CreditCard },
            { id: "api", l: "Engine", icon: Zap }
          ].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-y2k font-extrabold cursor-pointer transition-all flex items-center gap-2 ${activeTab === t.id ? "blue-label-tag text-white shadow-xs" : "text-slate-500 hover:text-[#1E2330]"}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.l}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[450px]">
        {activeTab === "persona" && (
          <div className="space-y-6 animate-fade-in">
            <div className="paper-sheet p-8 space-y-6 shadow-xl border-2 border-[#E3DCCF]">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-y2k font-extrabold text-[#1E2330] uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" /> Director&apos;s Leadership Voice
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">This selection influences the emotional tone and vocabulary of all generated scripts.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PERSONAS.map((p) => (
                  <button key={p.id} onClick={() => update("directorPersona", p.id)}
                    className={`p-5 rounded-xl border text-left transition-all cursor-pointer group flex items-start gap-4 ${settings.directorPersona === p.id ? "bg-yellow-300 border-yellow-400 text-slate-900 shadow-md font-bold" : "bg-[#FAF8F3] border-[#E3DCCF] hover:bg-[#EFEADF]"}`}>
                    <div className={`p-3 rounded-lg transition-all ${settings.directorPersona === p.id ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-500"}`}>
                      <p.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-y2k font-extrabold text-[#1E2330] mb-0.5">{p.label}</h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 paper-sheet p-6 border-2 border-[#E3DCCF]">
                <Field label="Institutional Tone">
                  <input type="text" value={settings.brandTone || ""} onChange={(e) => update("brandTone", e.target.value)}
                    placeholder="e.g. Nurturing, professional, and informative."
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] text-xs font-y2k font-extrabold text-[#1E2330] focus:ring-2 focus:ring-blue-600 transition-all outline-none" />
                </Field>
                <Field label="Words/Phrases to Avoid">
                  <input type="text" value={settings.brandAvoidWords || ""} onChange={(e) => update("brandAvoidWords", e.target.value)}
                    placeholder="e.g. viral, clickbait, buy now (comma separated)"
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] text-xs font-y2k font-extrabold text-[#1E2330] placeholder-slate-400 focus:ring-2 focus:ring-blue-600 transition-all outline-none" />
                </Field>
              </div>
              <div className="space-y-4 paper-sheet p-6 border-2 border-[#E3DCCF]">
                <Field label="Target Audience Profile">
                  <input type="text" value={settings.brandTargetAudience || ""} onChange={(e) => update("brandTargetAudience", e.target.value)}
                    placeholder="e.g. Parents of K-12 students, prospective families"
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] text-xs font-y2k font-extrabold text-[#1E2330] focus:ring-2 focus:ring-blue-600 transition-all outline-none" />
                </Field>
                <Field label="Core Values">
                  <input type="text" value={settings.brandCoreValues || ""} onChange={(e) => update("brandCoreValues", e.target.value)}
                    placeholder="e.g. Holistic education, child safety, excellence"
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] text-xs font-y2k font-extrabold text-[#1E2330] focus:ring-2 focus:ring-blue-600 transition-all outline-none" />
                </Field>
              </div>
            </div>
          </div>
        )}

        {activeTab === "knowledge" && (
          <div className="space-y-6 animate-fade-in">
            <div className="paper-sheet p-8 space-y-6 shadow-xl border-2 border-[#E3DCCF]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-600 text-white"><Database className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-xs font-y2k font-extrabold text-[#1E2330] uppercase tracking-wider">Institutional Knowledge Base</h4>
                  <p className="text-xs text-slate-500 font-medium">Add school policies, mission statements, and unique rules to provide the AI with &ldquo;Internal Truth.&rdquo;</p>
                </div>
              </div>

              <div className="space-y-4">
                <Field label="School Context & Guidelines">
                  <textarea value={settings.schoolContext || ""} onChange={(e) => update("schoolContext", e.target.value)}
                    placeholder="Paste your school's mission, specific disciplinary policies, or seasonal focus areas here..."
                    className="w-full h-64 p-4 rounded-xl bg-[#FAF8F3] border border-[#E3DCCF] text-xs font-y2k font-extrabold text-[#1E2330] leading-relaxed resize-none focus:ring-2 focus:ring-blue-600 transition-all outline-none" />
                </Field>
              </div>
            </div>
          </div>
        )}

        {activeTab === "billing" && <BillingSettings />}

        {activeTab === "connections" && (
          <div className="space-y-6 animate-fade-in">
            <div className="paper-sheet p-8 space-y-6 shadow-xl border-2 border-[#E3DCCF]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white"><Instagram className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-xs font-y2k font-extrabold text-[#1E2330] uppercase tracking-wider">Instagram Connection</h4>
                  <p className="text-xs text-slate-500 font-medium">Connect your Instagram Business or Creator account for analytics.</p>
                </div>
              </div>

              <MetaConnectionPanel />
            </div>

            <div className="paper-sheet p-6 shadow-lg border-2 border-[#E3DCCF]">
              <div className="flex items-center gap-3 mb-3">
                <Info className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-y2k font-extrabold text-[#1E2330]">Need Help?</h4>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                If you haven&apos;t set up a Meta Developer App yet, follow our step-by-step guide.
              </p>
              <a href="/guide" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
                <Link className="w-3.5 h-3.5" /> Setup Guide
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Global Save Button */}
      {activeTab !== "connections" && activeTab !== "billing" && (
        <div className="flex items-center justify-end pt-4">
          <button onClick={handleSave}
            className="blue-label-tag px-8 py-3.5 text-xs font-y2k font-extrabold uppercase tracking-wider cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
            {saved ? <><CheckCircle2 className="w-4 h-4 text-yellow-300" /> Saved</> : <><Save className="w-4 h-4 text-yellow-300" /> Save Profile</>}
          </button>
        </div>
      )}
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

function MetaConnectionPanel() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/profile");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleDisconnect = async (connectionId) => {
    if (!confirm("Disconnect this Instagram account? You can reconnect anytime.")) return;
    setActionLoading(true);
    try {
      await fetch("/api/meta/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });
      await fetchStatus();
    } catch (err) {
      alert("Failed to disconnect: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = async () => {
    setActionLoading(true);
    try {
      await fetch("/api/meta/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await fetchStatus();
    } catch (err) {
      alert("Refresh failed: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-6">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Checking connection status...</span>
      </div>
    );
  }

  if (!status?.connected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800 font-medium">No Instagram account connected. Connect your Business or Creator account to access analytics.</p>
        </div>
        <a
          href="/onboarding"
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity shadow-md"
        >
          <Instagram className="w-4 h-4" />
          Connect Instagram
        </a>
      </div>
    );
  }

  const profile = status.profile || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-white border border-[#E3DCCF] rounded-xl">
        {profile.profilePic ? (
          <img src={profile.profilePic} alt={profile.username} className="w-12 h-12 rounded-full border-2 border-purple-400" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
            {(profile.username || "?")[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-y2k font-extrabold text-[#1E2330]">@{profile.username}</h4>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Active
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium truncate">{profile.name} • {profile.followers?.toLocaleString()} followers</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={actionLoading}
            className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {actionLoading ? "..." : "↻ Refresh Token"}
          </button>
          <button
            onClick={() => handleDisconnect(status.connectionId)}
            disabled={actionLoading}
            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-[#FAF8F3] border border-[#E3DCCF] rounded-lg text-center">
          <div className="text-sm font-extrabold text-[#1E2330]">{profile.followers?.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 font-medium">Followers</div>
        </div>
        <div className="p-3 bg-[#FAF8F3] border border-[#E3DCCF] rounded-lg text-center">
          <div className="text-sm font-extrabold text-[#1E2330]">{profile.following?.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 font-medium">Following</div>
        </div>
        <div className="p-3 bg-[#FAF8F3] border border-[#E3DCCF] rounded-lg text-center">
          <div className="text-sm font-extrabold text-[#1E2330]">{profile.postCount?.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 font-medium">Posts</div>
        </div>
      </div>
    </div>
  );
}

