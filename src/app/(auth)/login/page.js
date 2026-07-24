"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, AlertCircle, BrainCircuit } from "lucide-react";
import { Chrome, Facebook } from "../../../components/InstagramIcon";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      await signIn(provider, { callbackUrl });
    } catch (err) {
      setError(`Failed to sign in with ${provider}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative bg-desk-canvas font-sans text-[#1E2330]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md mx-auto transform -rotate-3">
          <BrainCircuit className="w-7 h-7" />
        </div>
        <div className="blue-label-tag px-4 py-1.5 text-2xl inline-block shadow-md">
          Welcome back
        </div>
        <p className="mt-1 text-xs font-y2k font-extrabold text-slate-600">
          Or{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="paper-sheet py-8 px-6 border-2 border-[#E3DCCF] shadow-2xl rounded-2xl sm:px-10 relative">
          <div className="tape-overlay" />

          {error && (
            <div className="mb-6 p-4 rounded-xl sticker-highlight-orange flex items-start gap-3 text-xs font-y2k font-extrabold">
              <AlertCircle className="w-5 h-5 shrink-0 text-white" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-y2k font-extrabold uppercase tracking-wider text-slate-600">
                Email Address
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-[#E3DCCF] rounded-xl bg-[#FAF8F3] text-[#1E2330] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-y2k font-extrabold uppercase tracking-wider text-slate-600">
                Password
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-[#E3DCCF] rounded-xl bg-[#FAF8F3] text-[#1E2330] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full blue-label-tag flex justify-center items-center gap-2 py-3 px-4 text-xs font-y2k font-extrabold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {loading ? "Signing in..." : "Sign in"}
                <ArrowRight className="w-4 h-4 text-yellow-300" />
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E3DCCF]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="px-3 bg-white text-slate-500 font-y2k font-extrabold">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuthLogin("google")}
                className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-[#E3DCCF] rounded-xl bg-[#FAF8F3] text-xs font-y2k font-bold text-[#1E2330] hover:bg-[#EFEADF] transition-all cursor-pointer shadow-xs"
              >
                <Chrome className="w-4 h-4 text-red-500" />
                Google
              </button>

              <button
                onClick={() => handleOAuthLogin("facebook")}
                className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-[#E3DCCF] rounded-xl bg-[#FAF8F3] text-xs font-y2k font-bold text-[#1E2330] hover:bg-[#EFEADF] transition-all cursor-pointer shadow-xs"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                Meta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-desk-canvas text-[#1E2330] flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-600 font-y2k font-bold tracking-wider uppercase">Loading Login...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
