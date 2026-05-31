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
  
  // Connections tab states
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchConnections = async () => {
    setLoadingAccounts(true);
    try {
      const res = await fetch("/api/data/insights");
      if (res.ok) {
        const data = await res.json();
        // Extract recent synced posts or accounts list if any
        if (data.instagramPosts) {
          // Construct unique connected accounts list based on posts/insights
          // For simplicity we can query a specific endpoint or use data.instagramPosts as proxy.
          // Wait, let's build an inline mock list if no posts exist, or check a direct endpoint.
          // Let's call our stats or insights to see.
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
    <div className="p-6 lg:p-14 max-w-5xl mx-auto space-y-10 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-indigo-600" strokeWidth={2.5} /> System Configuration
          </h3>
          <p className="text-sm text-slate-500 font-medium">Customize your institutional voice and AI intelligence parameters.</p>
        </div>

        <div className="flex p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          {[
            { id: "persona", l: "Identity", icon: UserCheck }, 
            { id: "knowledge", l: "Knowledge Base", icon: Database }, 
            { id: "connections", l: "Connections", icon: Instagram }, 
            { id: "billing", l: "Billing", icon: CreditCard },
            { id: "api", l: "Engine", icon: Zap }
          ].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2.5 ${activeTab === t.id ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:text-slate-700"}`}>
              <t.icon className="w-4 h-4" /> {t.l}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[500px]">
        {activeTab === "persona" && (
          <div className="space-y-10 animate-fade-in">
            <div className="rounded-[2.5rem] bg-white border border-slate-200 p-10 space-y-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-600" /> Director's Leadership Voice
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">This selection influences the emotional tone and vocabulary of all generated scripts.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PERSONAS.map((p) => (
                  <button key={p.id} onClick={() => update("directorPersona", p.id)}
                    className={`p-6 rounded-[1.8rem] border-2 text-left transition-all cursor-pointer group flex items-start gap-5 ${settings.directorPersona === p.id ? "bg-indigo-50/50 border-indigo-600 shadow-lg shadow-indigo-100" : "bg-white border-slate-200 hover:bg-slate-50 hover:border-indigo-600/20"}`}>
                    <div className={`p-4 rounded-2xl transition-all ${settings.directorPersona === p.id ? "bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-600/20" : "bg-slate-100 text-slate-400 group-hover:text-indigo-600"}`}>
                      <p.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="text-base font-black text-slate-800 mb-1">{p.label}</h5>
                      <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Field label="Institutional Tone">
                  <input type="text" value={settings.brandTone || ""} onChange={(e) => update("brandTone", e.target.value)}
                    placeholder="e.g. Nurturing, professional, and informative."
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" />
                </Field>
                <Field label="Words/Phrases to Avoid">
                  <input type="text" value={settings.brandAvoidWords || ""} onChange={(e) => update("brandAvoidWords", e.target.value)}
                    placeholder="e.g. viral, clickbait, buy now (comma separated)"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" />
                </Field>
              </div>
              <div className="space-y-4">
                <Field label="Target Audience Profile">
                  <input type="text" value={settings.brandTargetAudience || ""} onChange={(e) => update("brandTargetAudience", e.target.value)}
                    placeholder="e.g. Parents of K-12 students, prospective families"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" />
                </Field>
                <Field label="Core Values">
                  <input type="text" value={settings.brandCoreValues || ""} onChange={(e) => update("brandCoreValues", e.target.value)}
                    placeholder="e.g. Holistic education, child safety, excellence"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" />
                </Field>
              </div>
            </div>
          </div>
        )}

        {activeTab === "knowledge" && (
          <div className="space-y-8 animate-fade-in">
            <div className="rounded-[2.5rem] bg-white border border-slate-200 p-10 space-y-8 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600"><Database className="w-6 h-6" /></div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Institutional Knowledge Base</h4>
                  <p className="text-xs text-slate-400 font-medium">Add school policies, mission statements, and unique rules to provide the AI with "Internal Truth."</p>
                </div>
              </div>

              <div className="space-y-6">
                <Field label="School Context & Guidelines">
                  <textarea value={settings.schoolContext || ""} onChange={(e) => update("schoolContext", e.target.value)}
                    placeholder="Paste your school's mission, specific disciplinary policies, or seasonal focus areas here..."
                    className="w-full h-80 px-6 py-5 rounded-3xl bg-slate-50 border border-slate-200 text-[15px] text-slate-700 leading-relaxed resize-none focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none custom-scroll" />
                </Field>
                <div className="flex items-start gap-3 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                   <Info className="w-4 h-4 text-indigo-600 mt-0.5" />
                   <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                     This information is injected into the Writer Agent's context. The AI will prioritize these school-specific rules over general educational trends to ensure compliance and cultural fit.
                   </p>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "connections" && (
          <div className="space-y-8 animate-fade-in">
            <div className="rounded-[2.5rem] bg-white border border-slate-200 p-10 space-y-8 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-pink-50 text-pink-600">
                  <Instagram className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Linked Social Accounts</h4>
                  <p className="text-xs text-slate-400 font-medium">Manage Meta Instagram Business account integrations for this workspace.</p>
                </div>
              </div>

              {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {errorMsg}
                </div>
              )}

              {loadingAccounts ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {socialAccounts.length > 0 ? (
                    <div className="space-y-4">
                      {socialAccounts.map((acc) => (
                        <div key={acc.id} className="flex items-center justify-between p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 font-black text-lg">
                              <Instagram className="w-6 h-6" />
                            </div>
                            <div>
                              <h5 className="text-sm font-black text-slate-800">@{acc.username}</h5>
                              <p className="text-xs text-slate-400 font-medium capitalize">{acc.platform} connection</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full px-2.5 py-1">Active</span>
                            {/* Deleting connections can be implemented later */}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-4">
                      <Instagram className="w-12 h-12 text-slate-300 mx-auto" />
                      <div>
                        <p className="text-sm font-bold text-slate-600">No Instagram Business Accounts connected</p>
                        <p className="text-xs text-slate-400 mt-1">Connect your account to start tracking reach & insights.</p>
                      </div>
                      <a
                        href="/api/meta/connect"
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white font-bold text-xs px-5 py-3.5 shadow-md hover:bg-indigo-500 transition-all cursor-pointer"
                      >
                        <Link className="w-3.5 h-3.5" />
                        Connect Instagram via Meta
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "api" && (
          <div className="space-y-10 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="rounded-[2.5rem] bg-white border border-slate-200 p-10 space-y-6 shadow-sm">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">AI Intelligence Model</h4>
                  <div className="space-y-4">
                    {[
                      { id: "pro", label: "Gemini 3.1 Pro", icon: BrainCircuit, desc: "High reasoning, complex scripts, best quality.", color: "text-indigo-600" },
                      { id: "flash", label: "Gemini 3 Flash", icon: Zap, desc: "Ultra-fast, efficient for simple tags/metadata.", color: "text-pink-500" },
                    ].map((m) => (
                      <button key={m.id} onClick={() => update("aiModel", m.id)}
                        className={`w-full p-6 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-5 ${settings.aiModel === m.id ? "bg-indigo-50/30 border-indigo-600 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"}`}>
                        <m.icon className={`w-8 h-8 ${settings.aiModel === m.id ? m.color : "text-slate-400"}`} />
                        <div>
                          <p className="text-sm font-bold text-slate-800">{m.label}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{m.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2.5rem] bg-white border border-slate-200 p-10 space-y-8 shadow-sm">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Content Defaults</h4>
                  <div className="space-y-6">
                    <Field label="Default Intelligence Region">
                      <div className="flex gap-2.5 flex-wrap">
                        {LOCATIONS.map((l) => (
                          <button key={l.code} onClick={() => update("defaultLocation", l.code)}
                            className={`px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider border-2 transition-all cursor-pointer flex items-center gap-2.5 ${settings.defaultLocation === l.code ? "bg-indigo-50 text-indigo-600 border-indigo-600" : "bg-white border-slate-200 text-slate-400 hover:text-slate-700"}`}>
                            <l.icon className="w-4 h-4" /> {l.label}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical IDs</p>
                      <div className="space-y-3 opacity-60">
                        <div className="h-2 rounded-full bg-slate-200 w-full" />
                        <div className="h-2 rounded-full bg-slate-200 w-2/3" />
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === "billing" && <BillingSettings />}
      </div>

      {/* Global Save */}
      {activeTab !== "connections" && activeTab !== "billing" && (
        <div className="flex items-center justify-end pt-6">
          <button onClick={handleSave}
            className="px-14 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest bg-indigo-600 text-white cursor-pointer shadow-2xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4">
            {saved ? <><CheckCircle2 className="w-6 h-6" /> Configuration Optimized</> : <><Save className="w-6 h-6" /> Save Executive Profile</>}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (<div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">{label}</label>{children}</div>);
}
