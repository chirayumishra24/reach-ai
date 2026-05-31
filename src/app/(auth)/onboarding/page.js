import Onboarding from "@/components/Onboarding";
import { Suspense } from "react";

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Loading Onboarding...</p>
        </div>
      </div>
    }>
      <Onboarding />
    </Suspense>
  );
}

