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
