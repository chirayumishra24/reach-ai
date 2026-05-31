"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import ResearchLab from "@/components/ResearchLab";
import ContentStudio from "@/components/ContentStudio";
import ContentCalendar from "@/components/ContentCalendar";
import ApprovalBoard from "@/components/ApprovalBoard";
import DiscoverHub from "@/components/DiscoverHub";
import Analytics from "@/components/Analytics";
import Settings from "@/components/Settings";
import InstagramDashboard from "@/components/InstagramDashboard";
import PostAnalytics from "@/components/PostAnalytics";

export default function AppPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [researchContext, setResearchContext] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const handleResearchComplete = (ctx) => setResearchContext(ctx);

  const handleGoToStudio = (ctx) => {
    setResearchContext(ctx);
    setActiveTab("studio");
  };

  const handleStartResearch = (keyword) => {
    handleResearchComplete({ keyword });
    setActiveTab("research");
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Restoring secure session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar activeTab={activeTab} onTabChange={(tab) => {
        setSelectedPost(null);
        setActiveTab(tab);
      }} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header activeTab={activeTab} />

        {/* Global background glow */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-50/20 to-transparent pointer-events-none -z-10" />

        <main className="flex-1 overflow-y-auto relative custom-scroll pb-10">
          {selectedPost ? (
            <PostAnalytics 
              post={selectedPost} 
              onBack={() => setSelectedPost(null)} 
            />
          ) : (
            <>
              {activeTab === "dashboard" && (
                <Dashboard 
                  onNavigate={setActiveTab} 
                  onStartResearch={handleStartResearch} 
                  onGoToStudio={handleGoToStudio} 
                />
              )}
              {activeTab === "instagram" && (
                <InstagramDashboard 
                  onSelectPost={setSelectedPost}
                />
              )}
              {activeTab === "research" && (
                <ResearchLab
                  onResearchComplete={handleResearchComplete}
                  onGoToStudio={handleGoToStudio}
                />
              )}
              {activeTab === "studio" && (
                <ContentStudio
                  researchContext={researchContext}
                />
              )}
              {activeTab === "calendar" && <ContentCalendar />}
              {activeTab === "approval" && <ApprovalBoard />}
              {activeTab === "discover" && (
                <DiscoverHub onStartResearch={handleStartResearch} />
              )}
              {activeTab === "analytics" && <Analytics />}
              {activeTab === "accounts" && <Settings />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
