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
    <div className="bg-desk-canvas text-[#1E2330] min-h-screen flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
      {/* Navbar - Blue Label Ribbon */}
      <nav className="border-b-2 border-[#E3DCCF] bg-[#FAF8F3]/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md transform -rotate-3">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div className="blue-label-tag px-3 py-1 text-base shadow-sm">
              Reach<span className="text-yellow-300">.ai</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-y2k font-extrabold text-[#565E73]">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="https://github.com/chirayumishra24/socialMediaTool" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Open Source</a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-y2k font-bold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="blue-label-tag font-bold text-xs px-5 py-3 shadow-md hover:scale-105 transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24 text-center space-y-8 z-10">
        <div className="sticker-highlight-green inline-flex items-center gap-2 px-4 py-1.5 text-xs tracking-wider transform rotate-1">
          <Sparkles className="w-4 h-4 text-blue-800 animate-pulse" />
          Y2K Desk Edition & Physical Paper Collage
        </div>
        
        <h1 className="text-4xl md:text-6xl xl:text-7xl font-y2k font-extrabold tracking-tight text-[#1E2330] max-w-5xl mx-auto leading-tight">
          Scale your Instagram reach with <span className="text-blue-600 underline decoration-yellow-400 decoration-wavy">automated AI analytics</span>
        </h1>
        
        <p className="max-w-3xl mx-auto text-base md:text-lg text-slate-600 font-medium leading-relaxed">
          Connect your accounts, sync real-time engagement data from Meta, and deploy autonomous Gemini agents that write scripts, optimize hashtags, and guide content strategy.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            href="/signup"
            className="blue-label-tag font-extrabold text-sm px-8 py-4 shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            Launch Your Workspace
            <ArrowRight className="w-4.5 h-4.5 text-yellow-300" />
          </Link>
        </div>

        {/* Hero Visual Mockup: Ring Notebook + Floating Lanyard Badge */}
        <div className="pt-8 max-w-4xl mx-auto relative">
          <div className="paper-sheet-binder p-8 shadow-2xl relative border-2 border-[#E3DCCF] aspect-video flex items-center justify-center overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-6 paper-binder-holes opacity-70" />
            
            <div className="absolute top-10 left-10 post-it-yellow p-4 text-left max-w-xs transform -rotate-3 shadow-lg">
              <div className="tape-overlay" />
              <p className="font-handwriting text-lg font-bold text-slate-900 leading-snug">
                "Reach.ai automated our daily insights and doubled our conversion rates!"
              </p>
            </div>

            <div className="lanyard-badge-card p-6 max-w-xs text-center transform rotate-2 shadow-2xl z-30 bg-white border-2 border-[#E3DCCF]">
              <div className="w-8 h-2 bg-blue-600 rounded-full mx-auto mb-3" />
              <Instagram className="w-16 h-16 text-pink-500 mx-auto animate-pulse" />
              <p className="mt-3 font-y2k font-extrabold text-[#1E2330]">Meta Graph API</p>
              <p className="text-xs text-slate-500 font-mono">Live Sync Active</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Tilted Post-It Yellow Notes */}
      <section id="features" className="border-t-2 border-[#E3DCCF] bg-[#FAF8F3] py-20 z-10">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-y2k font-extrabold text-[#1E2330]">Built for modern creators & managers</h2>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto font-medium">All the components you need to research keywords, generate script templates, and audit performance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={TrendingUp}
              title="Real-Time Analytics"
              desc="Direct connection to Meta Graph API. Track reach, impressions, views, shares, and saves seamlessly."
              rotate="-rotate-1"
            />
            <FeatureCard 
              icon={BrainCircuit}
              title="Autonomous Gemini AI"
              desc="Deploy custom agents that analyze your historical metrics to recommend content angles and write high-converting scripts."
              rotate="rotate-1"
            />
            <FeatureCard 
              icon={Video}
              title="Content Studio"
              desc="Draft scripts, generate visual social previews for multiple ratios, and check character lengths instantly."
              rotate="-rotate-2"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section - Black Metallic Clipboards */}
      <section id="pricing" className="border-t-2 border-[#E3DCCF] py-20 z-10">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-y2k font-extrabold text-[#1E2330]">Flexible SaaS pricing plans</h2>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto font-medium">Start for free and scale as your social presence grows.</p>
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
      <footer className="border-t-2 border-[#E3DCCF] bg-[#FAF8F3] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-600 font-y2k font-bold">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-blue-600" />
            <span>&copy; 2026 Reach.ai. All rights reserved.</span>
          </div>

          <div className="flex gap-8">
            <a href="https://github.com/chirayumishra24/socialMediaTool" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">GitHub Repository</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, rotate = "rotate-0" }) {
  return (
    <div className={`post-it-yellow p-6 space-y-4 shadow-xl relative transform ${rotate} hover:rotate-0 transition-transform`}>
      <div className="tape-overlay" />
      <div className="w-10 h-10 rounded-lg bg-yellow-300 border border-yellow-400 text-blue-700 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-y2k font-extrabold text-[#1E2330] tracking-tight">{title}</h3>
      <p className="text-xs text-slate-700 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function MarketingPricingCard({ title, price, desc, features, highlight = false }) {
  return (
    <div className={`clipboard-board p-6 text-white shadow-2xl flex flex-col justify-between h-full relative ${
      highlight ? "border-2 border-yellow-400 scale-105" : ""
    }`}>
      <div className="clipboard-metal-clip" />

      <div className="space-y-5 mt-3">
        <div>
          <h4 className="text-lg font-y2k font-extrabold text-white">{title}</h4>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">{desc}</p>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-3xl font-y2k font-black text-white">{price}</span>
            <span className="text-xs text-slate-400 font-bold">/month</span>
          </div>
        </div>

        <ul className="space-y-3 text-xs font-y2k font-bold text-slate-300 border-t border-slate-800 pt-4">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${highlight ? "text-yellow-300" : "text-blue-400"}`} />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/signup"
        className={`w-full mt-6 py-3 rounded-xl text-xs font-y2k font-extrabold text-center transition-all ${
          highlight 
            ? "blue-label-tag shadow-lg" 
            : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
        }`}
      >
        Sign Up Free
      </Link>
    </div>
  );
}
