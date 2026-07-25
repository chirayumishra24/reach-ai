import OnboardingWizard from "@/components/OnboardingWizard";
import { Suspense } from "react";

export const metadata = {
  title: "Connect Instagram — Reach.ai",
  description: "Connect your Instagram Business account to unlock AI-powered analytics.",
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Loading...</p>
        </div>
      </div>
    }>
      <OnboardingWizard />
    </Suspense>
  );
}
