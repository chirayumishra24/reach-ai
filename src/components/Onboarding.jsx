"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Building, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles,
  Link,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { Instagram } from "./InstagramIcon";


export default function Onboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const successParam = searchParams.get("success");
  const errorParam = searchParams.get("error");

  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [syncStatus, setSyncStatus] = useState("idle"); // idle, syncing, completed, failed

  useEffect(() => {
    // If redirecting back from Meta OAuth with success, jump to Step 3 (Syncing)
    if (successParam === "connected") {
      setStep(3);
      triggerInitialSync();
    } else if (errorParam) {
      setStep(2);
      setError(`Meta connection failed: ${errorParam.replaceAll("_", " ")}`);
    }
  }, [successParam, errorParam]);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding/org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workspaceName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create workspace");
      } else {
        setStep(2);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const triggerInitialSync = async () => {
    setSyncStatus("syncing");
    try {
      const res = await fetch("/api/meta/instagram/sync-all", { method: "POST" });
      if (res.ok) {
        setSyncStatus("completed");
        setTimeout(() => setStep(4), 1500);
      } else {
        setSyncStatus("failed");
      }
    } catch (err) {
      setSyncStatus("failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Progress indicators */}
      <div className="absolute top-8 left-0 right-0 max-w-md mx-auto px-4 z-10">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= 1 ? "border-indigo-500 text-indigo-400 bg-indigo-950/30" : "border-slate-800"}`}>1</span>
            <span className={step >= 1 ? "text-slate-300" : ""}>Workspace</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= 2 ? "border-indigo-500 text-indigo-400 bg-indigo-950/30" : "border-slate-800"}`}>2</span>
            <span className={step >= 2 ? "text-slate-300" : ""}>Connect</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= 3 ? "border-indigo-500 text-indigo-400 bg-indigo-950/30" : "border-slate-800"}`}>3</span>
            <span className={step >= 3 ? "text-slate-300" : ""}>Sync</span>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 mt-8">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl rounded-3xl p-8 sm:p-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-3 text-red-300 text-xs font-semibold">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <Building className="w-6 h-6 text-indigo-400" /> Create Workspace
                </h2>
                <p className="text-xs text-slate-400 font-medium">Name your agency or business workspace to orchestrate your social channels.</p>
              </div>

              <form onSubmit={handleCreateWorkspace} className="space-y-5">
                <div>
                  <label htmlFor="workspace" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Workspace Name
                  </label>
                  <input
                    id="workspace"
                    type="text"
                    required
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="block w-full mt-1.5 px-4 py-3.5 border border-slate-800 rounded-xl bg-slate-950/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="Acme Digital"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? "Creating..." : "Continue"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <Instagram className="w-6 h-6 text-pink-400" /> Link Social Account
                </h2>
                <p className="text-xs text-slate-400 font-medium">Connect your Instagram Business or Creator account to start tracking insights and performance.</p>
              </div>

              <div className="py-4 border border-slate-800/80 bg-slate-950/40 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-pink-950/30 text-pink-400 flex items-center justify-center font-bold">1</span>
                  <span className="text-xs font-semibold text-slate-300">Grant Insights & Analytics permissions</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-pink-950/30 text-pink-400 flex items-center justify-center font-bold">2</span>
                  <span className="text-xs font-semibold text-slate-300">Link Business account to FB Page</span>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href="/api/meta/connect"
                  className="w-full flex justify-center items-center gap-2.5 py-4 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 transition-all cursor-pointer shadow-lg"
                >
                  <Link className="w-4 h-4" />
                  Connect via Meta (Facebook)
                </a>

                <button
                  onClick={() => router.push("/app")}
                  className="w-full text-center py-3 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Skip connection for now
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center animate-fade-in py-6">
              <div className="mx-auto w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin flex items-center justify-center" />
              <div className="space-y-2">
                <h3 className="text-lg font-black tracking-tight text-white">Performing Initial Sync</h3>
                <p className="text-xs text-slate-400 font-medium">Fetching your recent posts and insights directly from Meta Graph API...</p>
              </div>

              {syncStatus === "failed" && (
                <div className="pt-4 space-y-4">
                  <p className="text-xs text-red-400 font-bold">Sync took longer than expected. You can continue to your dashboard and the sync will finalize in the background.</p>
                  <button
                    onClick={() => router.push("/app")}
                    className="mx-auto flex items-center justify-center gap-2 rounded-xl bg-slate-800 text-white font-semibold text-xs px-5 py-3 hover:bg-slate-700 cursor-pointer"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center animate-fade-in py-6">
              <div className="mx-auto w-16 h-16 bg-emerald-950/40 border border-emerald-800 text-emerald-400 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
                  Workspace Ready <Sparkles className="w-5 h-5 text-amber-400" />
                </h3>
                <p className="text-xs text-slate-400 font-medium">All settings and accounts are successfully integrated. Welcome aboard!</p>
              </div>

              <button
                onClick={() => router.push("/app")}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all cursor-pointer mt-4"
              >
                Enter Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
