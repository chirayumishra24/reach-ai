"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

const STEPS = [
  { id: "connect", label: "Connect Instagram", icon: "🔗" },
  { id: "confirm", label: "Account Found", icon: "✓" },
  { id: "complete", label: "Ready!", icon: "🚀" },
];

export default function OnboardingWizard() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const stepParam = searchParams.get("step");
  const errorParam = searchParams.get("error");
  const connectionIdParam = searchParams.get("connectionId");
  const usernameParam = searchParams.get("username");
  const followersParam = searchParams.get("followers");

  const [currentStep, setCurrentStep] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(errorParam || null);

  // Determine step from URL
  useEffect(() => {
    if (stepParam === "confirm" && usernameParam) {
      setCurrentStep(1);
      setConnectionStatus({
        connectionId: connectionIdParam,
        username: usernameParam,
        followers: parseInt(followersParam || "0", 10),
      });
    } else if (stepParam === "error") {
      setError(errorParam || "An unknown error occurred");
    }
  }, [stepParam, connectionIdParam, usernameParam, followersParam, errorParam]);

  const handleConnect = useCallback(() => {
    setIsConnecting(true);
    setError(null);
    // Redirect to the Meta OAuth connect endpoint
    window.location.href = "/api/meta/connect";
  }, []);

  const handleConfirm = useCallback(() => {
    setCurrentStep(2);
    // After 2s auto-redirect to dashboard
    setTimeout(() => {
      router.push("/app?tab=instagram");
    }, 2500);
  }, [router]);

  const handleRetry = useCallback(() => {
    setError(null);
    setCurrentStep(0);
    router.replace("/onboarding");
  }, [router]);

  const stepIndex = currentStep;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                  i < stepIndex
                    ? "bg-green-500 text-white scale-100"
                    : i === stepIndex
                    ? "bg-indigo-500 text-white scale-110 ring-4 ring-indigo-500/30"
                    : "bg-slate-800 text-slate-500 scale-90"
                }`}
              >
                {i < stepIndex ? "✓" : step.icon}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-16 h-0.5 transition-all duration-500 ${
                    i < stepIndex ? "bg-green-500" : "bg-slate-800"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Main card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-2xl">
          {/* Error state */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-red-400 text-xl mt-0.5">⚠️</span>
                <div>
                  <h3 className="text-red-300 font-semibold text-sm">Connection Failed</h3>
                  <p className="text-red-400/80 text-sm mt-1">{decodeURIComponent(error)}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    ← Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Connect Instagram */}
          {stepIndex === 0 && !error && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg shadow-pink-500/20">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white">Connect Your Instagram</h1>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                  Link your Instagram Business or Creator account to unlock powerful analytics, AI insights, and growth recommendations.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 space-y-3 text-left">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">What we'll access</h3>
                {[
                  ["📊", "Profile analytics & engagement metrics"],
                  ["📈", "Post performance & audience insights"],
                  ["👥", "Follower demographics & growth trends"],
                  ["🔒", "Read-only access — we never post on your behalf"],
                ].map(([icon, text]) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="text-base">{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-500 hover:via-pink-400 hover:to-orange-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/>
                    </svg>
                    Connect with Instagram
                  </>
                )}
              </button>

              <p className="text-xs text-slate-500">
                Need to set up a Meta Developer App first?{" "}
                <a href="/guide" className="text-indigo-400 hover:text-indigo-300 underline">
                  Follow our setup guide →
                </a>
              </p>
            </div>
          )}

          {/* Step 2: Account Confirmation */}
          {stepIndex === 1 && connectionStatus && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white">Account Connected!</h1>
                <p className="text-slate-400 mt-2 text-sm">
                  We found your Instagram Business account
                </p>
              </div>

              <div className="bg-slate-800/60 rounded-xl p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                  {(connectionStatus.username || "?")[0].toUpperCase()}
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold text-lg">@{connectionStatus.username}</h3>
                  <p className="text-slate-400 text-sm">
                    {connectionStatus.followers?.toLocaleString() || 0} followers
                  </p>
                </div>
                <div className="ml-auto">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Connected
                  </span>
                </div>
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-left">
                <p className="text-indigo-300 text-sm leading-relaxed">
                  ✨ Your analytics dashboard is being prepared. We'll analyze your recent posts, engagement patterns, and audience demographics to give you actionable insights.
                </p>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                Go to Dashboard →
              </button>
            </div>
          )}

          {/* Step 3: Complete */}
          {stepIndex === 2 && (
            <div className="text-center space-y-6 py-4">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-ping opacity-20" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-4xl">🚀</span>
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white">You're All Set!</h1>
                <p className="text-slate-400 mt-2 text-sm">
                  Redirecting you to your analytics dashboard...
                </p>
              </div>

              <div className="flex justify-center">
                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          By connecting, you agree to our{" "}
          <a href="#" className="text-slate-500 hover:text-slate-400 underline">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="text-slate-500 hover:text-slate-400 underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
