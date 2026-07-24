/**
 * Reach.ai — Hybrid Storage Adapter syncing with Server-side Postgres via API
 */

import { useMemo, useSyncExternalStore, useEffect } from "react";

const KEYS = {
  research: "research",
  content: "content",
  stats: "stats",
  insights: "insights",
  ig_analysis: "reach_ig_analysis",
};

const STORAGE_EVENT = "reach-storage-updated";

// In-memory cache to support synchronous returns needed by components
let memoryCache = {
  research: [],
  content: [],
  stats: {
    totalResearch: 0,
    pendingApproval: 0,
    approved: 0,
    published: 0,
    totalContent: 0,
    totalClicks: 0,
    totalViews: 0,
    totalReach: 0,
    totalFollowers: 0,
  },
  insights: {
    platformPerformance: [],
    topTags: [],
    topContent: [],
    instagramPosts: [],
    totals: { avgCtr: "0.0" },
  },
};

let hasFetched = {
  research: false,
  content: false,
  stats: false,
  insights: false,
};

function triggerUpdate(key) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
  }
}

// Fetch helper functions
async function fetchResearch() {
  try {
    const res = await fetch("/api/data/research");
    if (res.ok) {
      memoryCache.research = await res.json();
      hasFetched.research = true;
      triggerUpdate(KEYS.research);
    }
  } catch (err) {
    console.error("Failed to fetch research from DB:", err);
  }
}

async function fetchContent() {
  try {
    const res = await fetch("/api/data/content");
    if (res.ok) {
      memoryCache.content = await res.json();
      hasFetched.content = true;
      triggerUpdate(KEYS.content);
    }
  } catch (err) {
    console.error("Failed to fetch content from DB:", err);
  }
}

async function fetchStats() {
  try {
    const res = await fetch("/api/data/stats");
    if (res.ok) {
      memoryCache.stats = await res.json();
      hasFetched.stats = true;
      triggerUpdate(KEYS.stats);
    }
  } catch (err) {
    console.error("Failed to fetch stats from DB:", err);
  }
}

async function fetchInsights() {
  try {
    const res = await fetch("/api/data/insights");
    if (res.ok) {
      memoryCache.insights = await res.json();
      hasFetched.insights = true;
      triggerUpdate(KEYS.insights);
    }
  } catch (err) {
    console.error("Failed to fetch insights from DB:", err);
  }
}

// Global fetch initiator
export function triggerSync() {
  fetchResearch();
  fetchContent();
  fetchStats();
  fetchInsights();
}

// Start initial fetches in browser
if (typeof window !== "undefined") {
  // Let Next.js hydrate first, then sync
  setTimeout(triggerSync, 500);
}

export function subscribeToStorage(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

// ═══ RESEARCH ═══

export function getResearchHistory() {
  if (typeof window !== "undefined" && !hasFetched.research) {
    fetchResearch();
  }
  return memoryCache.research;
}

export function useResearchHistory() {
  useEffect(() => {
    if (!hasFetched.research) fetchResearch();
  }, []);

  const rawValue = useSyncExternalStore(
    subscribeToStorage,
    () => JSON.stringify(memoryCache.research),
    () => "[]"
  );
  
  return useMemo(() => {
    try {
      return JSON.parse(rawValue);
    } catch {
      return [];
    }
  }, [rawValue]);
}

export function saveResearch(data) {
  // Optimistic update
  const entry = {
    ...data,
    id: data.id || `temp-${Date.now()}`,
    keyword: data.keyword || "Untitled",
    status: data.status || "pending",
    savedAt: data.savedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = memoryCache.research.findIndex(r => r.id === entry.id);
  if (existingIndex >= 0) {
    memoryCache.research[existingIndex] = entry;
  } else {
    memoryCache.research.unshift(entry);
  }
  
  if (memoryCache.research.length > 50) memoryCache.research.length = 50;
  triggerUpdate(KEYS.research);

  // Sync to backend DB
  fetch("/api/data/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(async (res) => {
    if (res.ok) {
      const savedEntry = await res.json();
      // Replace optimistic temp ID if created
      const index = memoryCache.research.findIndex(r => r.id === entry.id || r.id === savedEntry.id);
      if (index >= 0) {
        memoryCache.research[index] = savedEntry;
      }
      triggerUpdate(KEYS.research);
      fetchStats();
    }
  });

  return entry;
}

export function updateResearchStatus(id, status) {
  // Optimistic update
  const index = memoryCache.research.findIndex(r => r.id === id);
  if (index >= 0) {
    memoryCache.research[index].status = status;
    memoryCache.research[index].updatedAt = new Date().toISOString();
    triggerUpdate(KEYS.research);
  }

  // Sync to backend DB
  fetch("/api/data/research", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  }).then((res) => {
    if (res.ok) {
      fetchResearch();
      fetchStats();
    }
  });
}

// ═══ CONTENT ═══

export function getContentHistory() {
  if (typeof window !== "undefined" && !hasFetched.content) {
    fetchContent();
  }
  return memoryCache.content;
}

export function useContentHistory() {
  useEffect(() => {
    if (!hasFetched.content) fetchContent();
  }, []);

  const rawValue = useSyncExternalStore(
    subscribeToStorage,
    () => JSON.stringify(memoryCache.content),
    () => "[]"
  );

  return useMemo(() => {
    try {
      return JSON.parse(rawValue);
    } catch {
      return [];
    }
  }, [rawValue]);
}

export function saveContent(data) {
  // Optimistic update
  const entry = {
    ...data,
    id: data.id || `temp-${Date.now()}`,
    keyword: data.keyword || data.metadata?.keyword || "Untitled",
    format: data.format || data.metadata?.format || "youtube_long",
    savedAt: data.savedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = memoryCache.content.findIndex(c => c.id === entry.id);
  if (existingIndex >= 0) {
    memoryCache.content[existingIndex] = entry;
  } else {
    memoryCache.content.unshift(entry);
  }

  if (memoryCache.content.length > 100) memoryCache.content.length = 100;
  triggerUpdate(KEYS.content);

  // Sync to backend DB
  fetch("/api/data/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(async (res) => {
    if (res.ok) {
      const savedEntry = await res.json();
      const index = memoryCache.content.findIndex(c => c.id === entry.id || c.id === savedEntry.id);
      if (index >= 0) {
        memoryCache.content[index] = savedEntry;
      }
      triggerUpdate(KEYS.content);
      fetchStats();
      fetchInsights();
    }
  });

  return entry;
}

export function updateContentBody(id, script) {
  // Optimistic update
  const index = memoryCache.content.findIndex(c => c.id === id);
  if (index >= 0) {
    memoryCache.content[index].script = script;
    memoryCache.content[index].updatedAt = new Date().toISOString();
    triggerUpdate(KEYS.content);
  }

  // Sync to backend DB
  fetch("/api/data/content", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, script }),
  }).then((res) => {
    if (res.ok) {
      fetchContent();
    }
  });
}

export function updateContentTracking(id, trackingData) {
  // Optimistic update
  const index = memoryCache.content.findIndex(c => c.id === id);
  let optimisticEntry = null;
  if (index >= 0) {
    memoryCache.content[index].publication = { 
      ...(memoryCache.content[index].publication || {}), 
      ...(trackingData.publication || {}) 
    };
    memoryCache.content[index].performance = { 
      ...(memoryCache.content[index].performance || {}), 
      ...(trackingData.performance || {}) 
    };
    memoryCache.content[index].updatedAt = new Date().toISOString();
    optimisticEntry = memoryCache.content[index];
    triggerUpdate(KEYS.content);
  }

  // Sync to backend DB
  fetch("/api/data/content", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      id, 
      publication: trackingData.publication, 
      performance: trackingData.performance 
    }),
  }).then((res) => {
    if (res.ok) {
      fetchContent();
      fetchStats();
      fetchInsights();
    }
  });

  return optimisticEntry;
}

export function getWorkflowStage(entry) {
  return entry?.status || entry?.stage || "saved";
}

// ═══ ANALYTICS & STATS ═══

export function useStats() {
  useEffect(() => {
    if (!hasFetched.stats) fetchStats();
  }, []);

  const rawValue = useSyncExternalStore(
    subscribeToStorage,
    () => JSON.stringify(memoryCache.stats),
    () => JSON.stringify(memoryCache.stats)
  );

  return useMemo(() => {
    try {
      return JSON.parse(rawValue);
    } catch {
      return memoryCache.stats;
    }
  }, [rawValue]);
}

export function usePerformanceInsights() {
  useEffect(() => {
    if (!hasFetched.insights) fetchInsights();
  }, []);

  const rawValue = useSyncExternalStore(
    subscribeToStorage,
    () => JSON.stringify(memoryCache.insights),
    () => JSON.stringify(memoryCache.insights)
  );

  return useMemo(() => {
    try {
      return JSON.parse(rawValue);
    } catch {
      return memoryCache.insights;
    }
  }, [rawValue]);
}

// --- SETTINGS (MOCK) ---
export function useSettingsSnapshot() {
  return { schoolName: "Reach.ai Workspace", schoolVision: "Shaping the future of education" };
}
export function saveAnalysis(data) {
  if (typeof window === "undefined") return data;
  const all = getAnalysisHistory();
  const entry = {
    ...data,
    id: data.id || `analysis-${Date.now()}`,
    savedAt: data.savedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const existingIndex = all.findIndex(a => a.id === entry.id || a.profile?.username === entry.profile?.username);
  if (existingIndex >= 0) {
    all[existingIndex] = entry;
  } else {
    all.unshift(entry);
  }
  
  if (all.length > 20) all.length = 20;
  try {
    localStorage.setItem(KEYS.ig_analysis, JSON.stringify(all));
  } catch (e) {}
  return entry;
}

export function getAnalysisHistory() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS.ig_analysis) || "[]");
  } catch (e) {
    return [];
  }
}

export function useAnalysisHistory() {
  return getAnalysisHistory();
}
