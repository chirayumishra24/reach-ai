"use client";

import Link from "next/link";
import { 
  BrainCircuit, 
  TrendingUp, 
  Video, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Shield,
  Zap,
  ChevronRight
} from "lucide-react";
import { Instagram } from "../components/InstagramIcon";


export default function MarketingPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-pink-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navbar */}
      <nav className="border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tighter leading-none">
              Reach<span className="text-indigo-400">.ai</span>
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="https://github.com/chirayumishra24/socialMediaTool" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Open Source</a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-3 shadow-md shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32 text-center space-y-8 z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          The future of social media intelligence
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-[-0.05em] leading-[0.9] text-white max-w-5xl mx-auto">
          Scale your Instagram reach with <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">automated AI analytics</span>
        </h1>
        
        <p className="max-w-3xl mx-auto text-base md:text-lg text-slate-400 leading-relaxed font-medium">
          Connect your accounts, sync real-time engagement data from Meta, and deploy autonomous Gemini agents that write scripts, optimize hashtags, and guide content strategy.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/signup"
            className="rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-bold text-sm px-8 py-5 shadow-xl hover:opacity-95 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
          >
            Launch Your Workspace
            <ArrowRight className="w-4.5 h-4.5" />
          </Link>
        </div>

        {/* Hero Visual Mockup */}
        <div className="pt-12 max-w-5xl mx-auto relative">
          <div className="absolute inset-x-0 -bottom-10 h-40 bg-gradient-to-t from-slate-950 to-transparent z-20 pointer-events-none" />
          <div className="rounded-[2.5rem] border border-slate-900 bg-slate-900/50 backdrop-blur-md p-4 shadow-2xl relative overflow-hidden aspect-video flex items-center justify-center">
            <Instagram className="w-32 h-32 text-pink-500/20 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Live Dashboard Mockup</span>
              <span className="text-indigo-400 text-sm font-semibold flex items-center gap-1.5"><Zap className="w-4 h-4" /> Powered by Meta Graph API</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-slate-900 bg-slate-950/20 py-24 z-10">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Built for modern creators & managers</h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto font-medium">All the components you need to research keywords, generate script templates, and audit performance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={TrendingUp}
              title="Real-Time Analytics"
              desc="Direct connection to Meta Graph API. Track reach, impressions, views, shares, and saves seamlessly."
            />
            <FeatureCard 
              icon={BrainCircuit}
              title="Autonomous Gemini AI"
              desc="Deploy custom agents that analyze your historical metrics to recommend content angles and write high-converting scripts."
            />
            <FeatureCard 
              icon={Video}
              title="Content Studio"
              desc="Draft scripts, generate visual social previews for multiple ratios, and check character lengths instantly."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-t border-slate-900 py-24 z-10">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Flexible SaaS pricing plans</h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto font-medium">Start for free and scale as your social presence grows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            <MarketingPricingCard 
              title="Free"
              price="$0"
              desc="Perfect for validating your content strategy"
              features={["1 Connected Instagram account", "7-Day data sync history", "Basic analytics", "5 AI writing runs / month"]}
            />
            <MarketingPricingCard 
              title="Pro"
              price="$19"
              desc="For creators looking to double their reach"
              features={["3 Connected Instagram accounts", "90-Day data sync history", "Advanced trends & metrics", "Unlimited AI runs & insights", "3 Team member seats"]}
              highlight={true}
            />
            <MarketingPricingCard 
              title="Agency"
              price="$49"
              desc="For professional teams & brand managers"
              features={["10 Connected Instagram accounts", "1-Year data sync history", "White-label reporting", "10 Team member seats", "Priority API sync queue"]}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500 font-semibold">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-500" />
            <span>&copy; 2026 Reach.ai. All rights reserved.</span>
          </div>

          <div className="flex gap-8">
            <a href="https://github.com/chirayumishra24/socialMediaTool" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">GitHub Repository</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-[2rem] border border-slate-900 bg-slate-900/40 p-8 space-y-4 hover:border-slate-800 transition-all hover:bg-slate-900/60">
      <div className="w-12 h-12 rounded-2xl bg-indigo-950/50 border border-indigo-900/30 text-indigo-400 flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function MarketingPricingCard({ title, price, desc, features, highlight = false }) {
  return (
    <div className={`rounded-3xl border p-8 flex flex-col justify-between h-full ${
      highlight 
        ? "border-indigo-500 bg-slate-900 text-slate-100 shadow-xl shadow-indigo-600/5 scale-105" 
        : "border-slate-900 bg-slate-950/40 text-slate-300"
    }`}>
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-black text-white">{title}</h4>
          <p className="text-xs text-slate-500 mt-1 font-medium">{desc}</p>
          <div className="flex items-baseline gap-1 mt-4">
            <span className="text-4xl font-black text-white">{price}</span>
            <span className="text-xs text-slate-500 font-semibold">/month</span>
          </div>
        </div>

        <ul className="space-y-3.5 text-xs font-semibold text-slate-400">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${highlight ? "text-pink-400" : "text-indigo-400"}`} />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/signup"
        className={`w-full mt-8 py-3.5 rounded-xl text-xs font-bold text-center transition-all ${
          highlight 
            ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25" 
            : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
        }`}
      >
        Sign Up Free
      </Link>
    </div>
  );
}
