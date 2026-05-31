"use client";

import { useState, useEffect } from "react";
import { CreditCard, Check, ShieldCheck, Sparkles, Zap, ArrowRight, ExternalLink } from "lucide-react";

export default function BillingSettings() {
  const [activePlan, setActivePlan] = useState("free");
  const [loading, setLoading] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/data/stats");
      if (res.ok) {
        const data = await res.json();
        // Assume stats return connected account information or current plan
        // (Wait, we can default or read from session as well, but stats has overall status)
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    // Resolve active plan from user session info
    fetch("/api/data/insights")
      .then(res => res.json())
      .then(data => {
        // Simple heuristic or read directly
      })
      .catch(console.error);
  }, []);

  const handleUpgrade = async (plan) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.message || "Failed to trigger checkout flow.");
      }
    } catch (err) {
      setError("Failed to create billing checkout session.");
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setLoadingPortal(true);
    setError("");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.message || "Stripe customer profile not created yet. Upgrade first.");
      }
    } catch (err) {
      setError("Failed to connect to billing portal.");
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <div className="rounded-[2.5rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" /> Workspace Subscription & Billing
          </h4>
          <p className="text-xs text-slate-400 font-medium mt-1">Upgrade your workspace to unlock multi-account tracking and deep AI analytics.</p>
        </div>

        {activePlan !== "free" && (
          <button
            onClick={handleManageBilling}
            disabled={loadingPortal}
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {loadingPortal ? "Loading Portal..." : "Manage Subscription"}
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Free Plan */}
        <PlanCard 
          title="Free"
          price="$0"
          frequency="forever"
          features={[
            "1 Connected Instagram Account",
            "7-Day Historical Data Sync",
            "Basic Analytics Reports",
            "5 AI Writing generations / mo",
            "1 Team member workspace"
          ]}
          isActive={activePlan === "free"}
          buttonText="Current Plan"
          buttonDisabled={true}
        />

        {/* Pro Plan */}
        <PlanCard 
          title="Pro"
          price="$19"
          frequency="month"
          features={[
            "3 Connected Instagram Accounts",
            "90-Day Historical Data Sync",
            "Advanced Analytics & Trends",
            "Unlimited AI writing & analysis",
            "3 Team member workspace",
            "AI growth recommendations"
          ]}
          isActive={activePlan === "pro"}
          highlight={true}
          buttonText={activePlan === "free" ? "Upgrade to Pro" : "Current Plan"}
          buttonDisabled={activePlan === "pro" || activePlan === "agency"}
          onClick={() => handleUpgrade("pro")}
          loading={loading}
        />

        {/* Agency Plan */}
        <PlanCard 
          title="Agency"
          price="$49"
          frequency="month"
          features={[
            "10 Connected Instagram Accounts",
            "1-Year Data Retention Sync",
            "Advanced Analytics & Trends",
            "Unlimited AI writing & analysis",
            "10 Team member workspace",
            "White-label exports & reports",
            "Confidential Slack integration"
          ]}
          isActive={activePlan === "agency"}
          buttonText={activePlan !== "agency" ? "Get Agency" : "Current Plan"}
          buttonDisabled={activePlan === "agency"}
          onClick={() => handleUpgrade("agency")}
          loading={loading}
        />
      </div>
    </div>
  );
}

function PlanCard({ title, price, frequency, features, isActive, highlight = false, buttonText, buttonDisabled, onClick, loading }) {
  return (
    <div className={`rounded-3xl border p-6 flex flex-col justify-between h-full relative transition-all ${
      highlight 
        ? "border-indigo-600 bg-slate-900 text-slate-100 shadow-xl shadow-indigo-600/10 scale-105" 
        : "border-slate-200 bg-white text-slate-800 hover:shadow-md"
    }`}>
      {highlight && (
        <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-pink-500 to-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 shadow-md">
          Popular
        </span>
      )}

      <div className="space-y-5">
        <div>
          <h5 className="text-lg font-black tracking-tight">{title}</h5>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black">{price}</span>
            <span className={`text-xs font-semibold ${highlight ? "text-slate-400" : "text-slate-400"}`}>/{frequency}</span>
          </div>
        </div>

        <ul className="space-y-3 text-xs font-semibold">
          {features.map((feat, i) => (
            <li key={i} className="flex items-start gap-2.5 leading-tight">
              <Check className={`w-4 h-4 shrink-0 mt-0.5 ${highlight ? "text-pink-400" : "text-indigo-600"}`} />
              <span className={highlight ? "text-slate-300" : "text-slate-600"}>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onClick}
        disabled={buttonDisabled || loading}
        className={`w-full mt-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
          isActive 
            ? "bg-slate-100 text-slate-500 border border-slate-200" 
            : highlight 
              ? "bg-gradient-to-r from-pink-500 to-indigo-600 text-white hover:opacity-90 shadow-md"
              : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
        }`}
      >
        {buttonText}
        {!buttonDisabled && <ArrowRight className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
