"use client";

import { useState } from "react";

const SETUP_STEPS = [
  {
    title: "Create a Meta Developer Account",
    icon: "👤",
    content: [
      { type: "instruction", text: "Go to developers.facebook.com" },
      { type: "instruction", text: 'Click "Get Started" in the top-right corner' },
      { type: "instruction", text: "Log in with your Facebook account (or create one)" },
      { type: "instruction", text: "Accept the Meta Platform Terms and Developer Policies" },
      { type: "instruction", text: "Complete the verification steps (phone/email)" },
    ],
    lookFor: "You should see the Meta for Developers dashboard with a \"My Apps\" button in the top navigation.",
    faq: [
      { q: "Do I need a Facebook account?", a: "Yes, a Meta/Facebook account is required to access the developer platform." },
      { q: "Is the developer account free?", a: "Yes, creating a Meta developer account is completely free." },
    ],
    link: "https://developers.facebook.com/docs/development/register/",
  },
  {
    title: "Create a New App",
    icon: "📱",
    content: [
      { type: "instruction", text: 'Click "My Apps" in the top-right, then "Create App"' },
      { type: "instruction", text: 'Select app type: Choose "Business" (or "None" if Business isn\'t available)' },
      { type: "instruction", text: 'Enter app name (e.g., "My Instagram Analytics")' },
      { type: "instruction", text: 'Enter your contact email address' },
      { type: "instruction", text: 'Select your business portfolio (or "I don\'t have a Business Portfolio")' },
      { type: "instruction", text: 'Click "Create App" to finish' },
    ],
    lookFor: "You'll be taken to your new app's dashboard. Note the App ID displayed at the top — you'll need this.",
    faq: [
      { q: "Which app type should I choose?", a: "\"Business\" type gives access to Instagram Graph API. If that's not available, choose \"None\" — you can add products later." },
      { q: "Can I use an existing app?", a: "Yes! If you already have a Meta app, you can add Instagram Graph API to it." },
    ],
    link: "https://developers.facebook.com/docs/development/create-an-app/",
  },
  {
    title: "Add Instagram Graph API Product",
    icon: "📊",
    content: [
      { type: "instruction", text: 'In your app dashboard, click "Add Product" in the left sidebar' },
      { type: "instruction", text: 'Find "Instagram" in the product list and click "Set Up"' },
      { type: "instruction", text: "Select \"Instagram Graph API\" (not Basic Display — that's deprecated)" },
      { type: "instruction", text: 'Go to "Settings" → "Basic" in the left sidebar' },
      { type: "instruction", text: "Copy the App ID and App Secret — you'll need both" },
      { type: "highlight", text: '⚠️ Keep your App Secret private! Never share it or commit it to a public repository.' },
    ],
    lookFor: "The App ID is shown at the top of Settings → Basic. Click \"Show\" next to App Secret to reveal it.",
    faq: [
      { q: "I don't see Instagram in the products list", a: "Make sure your app type is \"Business\" or \"None\". Some app types don't support Instagram." },
      { q: "What's the difference between App ID and App Secret?", a: "App ID is public (used in OAuth URLs). App Secret is private (used server-side for token exchange). Never expose the secret." },
    ],
    link: "https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/getting-started/",
  },
  {
    title: "Configure OAuth Redirect URI",
    icon: "🔗",
    content: [
      { type: "instruction", text: 'In your app dashboard, click "Facebook Login" → "Settings" in the left sidebar' },
      { type: "instruction", text: 'If you don\'t see Facebook Login, click "Add Product" and add it first' },
      { type: "instruction", text: 'Find the "Valid OAuth Redirect URIs" field' },
      { type: "copyable", text: `${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/meta/callback`, label: "Your redirect URI" },
      { type: "instruction", text: "Paste the URI above into the field and click Save Changes" },
    ],
    lookFor: "The redirect URI should appear in the list after saving. Make sure there are no trailing slashes or typos.",
    faq: [
      { q: "Can I use localhost?", a: "Yes! For development, use http://localhost:3000/api/meta/callback. Meta allows localhost for testing." },
      { q: "I see 'URL blocked' error during OAuth", a: "Double-check the redirect URI matches exactly — including https vs http and any trailing slashes." },
    ],
    link: "https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/",
  },
  {
    title: "Switch to Business or Creator Account",
    icon: "💼",
    content: [
      { type: "highlight", text: "⚠️ Instagram Personal accounts DO NOT work with the Graph API. You must have a Business or Creator account." },
      { type: "instruction", text: "Open the Instagram app on your phone" },
      { type: "instruction", text: "Go to Settings → Account → Switch to Professional Account" },
      { type: "instruction", text: 'Choose "Business" or "Creator" (both work)' },
      { type: "instruction", text: "Select a category for your account" },
      { type: "instruction", text: "Link your Instagram account to a Facebook Page (required for API access)" },
      { type: "highlight", text: "💡 If you don't have a Facebook Page, you'll be prompted to create one. Any Page works." },
    ],
    lookFor: "After switching, you should see \"Professional dashboard\" in your Instagram settings. Your profile will show a category label.",
    faq: [
      { q: "Will switching to Business change my account?", a: "You'll get access to Insights and the API. Your content and followers stay the same. You can switch back to Personal anytime." },
      { q: "Do I need a Facebook Page?", a: "Yes — Instagram Business accounts must be linked to a Facebook Page for API access. You can create a simple Page just for this purpose." },
    ],
    link: "https://help.instagram.com/502981923235522",
  },
  {
    title: "Set App to Live Mode",
    icon: "🟢",
    content: [
      { type: "instruction", text: 'In your Meta app dashboard, find the toggle at the top that says "In development"' },
      { type: "instruction", text: 'Switch it to "Live" mode' },
      { type: "instruction", text: "You may need to complete a Privacy Policy URL and Terms of Service URL in Settings → Basic" },
      { type: "instruction", text: "For personal use: In development mode, only you (app admin/tester) can connect — this is fine!" },
      { type: "highlight", text: "💡 For personal analytics, you can keep the app in Development mode. Only switch to Live if other users need to connect." },
    ],
    lookFor: "The mode indicator at the top should show \"Live\" (green) or stay as \"In development\" for personal use.",
    faq: [
      { q: "Do I need App Review?", a: "For personal use with your own account, No. In development mode, admins and testers can use all permissions. For other users, you'd need to submit for App Review." },
      { q: "Can I use this in Development mode?", a: "Yes! If only you (or people you add as testers) need access, Development mode is perfectly fine." },
    ],
    link: "https://developers.facebook.com/docs/development/release/",
  },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function StepCard({ step, index, isExpanded, onToggle }) {
  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800/50 rounded-xl overflow-hidden transition-all duration-300">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center gap-4 text-left hover:bg-slate-800/30 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-lg shrink-0">
          {step.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 text-xs font-bold">STEP {index + 1}</span>
          </div>
          <h3 className="text-white font-semibold mt-0.5">{step.title}</h3>
        </div>
        <svg
          className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-3 pl-2">
            {step.content.map((item, i) => {
              if (item.type === "highlight") {
                return (
                  <div key={i} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-200 text-sm">
                    {item.text}
                  </div>
                );
              }
              if (item.type === "copyable") {
                return (
                  <div key={i} className="p-3 bg-slate-800/80 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-indigo-300 font-mono break-all flex-1">{item.text}</code>
                      <CopyButton text={item.text} />
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>

          {/* What to look for */}
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-xs text-green-400 font-semibold mb-1">✅ What to look for</p>
            <p className="text-sm text-green-300/80">{step.lookFor}</p>
          </div>

          {/* FAQ */}
          {step.faq.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-400 font-medium flex items-center gap-2">
                <span>🤔 Having trouble?</span>
                <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-3 space-y-3 pl-2">
                {step.faq.map((item, i) => (
                  <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-medium text-slate-300">{item.q}</p>
                    <p className="text-sm text-slate-400 mt-1">{item.a}</p>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* Documentation link */}
          <a
            href={step.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>📖 Official Meta Documentation</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}

export default function SetupGuide() {
  const [expandedStep, setExpandedStep] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-300 font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Setup Guide
          </div>
          <h1 className="text-3xl font-bold text-white">
            Set Up Your Meta Developer App
          </h1>
          <p className="text-slate-400 mt-3 max-w-lg mx-auto text-sm leading-relaxed">
            Before connecting Instagram, you need a Meta Developer App. Follow these 6 steps — it takes about 10 minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {SETUP_STEPS.map((step, i) => (
            <StepCard
              key={step.title}
              step={step}
              index={i}
              isExpanded={expandedStep === i}
              onToggle={() => setExpandedStep(expandedStep === i ? -1 : i)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center space-y-4">
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800/50 rounded-xl p-6">
            <h3 className="text-white font-semibold text-lg">All set up? 🎉</h3>
            <p className="text-slate-400 text-sm mt-2">
              Once your Meta Developer App is configured, head to the onboarding page to connect your Instagram account.
            </p>
            <a
              href="/onboarding"
              className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              Connect Instagram →
            </a>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <a href="/app" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
