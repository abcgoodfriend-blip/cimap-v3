import React from "react";
import DashboardShell from "@/components/shell/DashboardShell";
import OverviewTab from "@/components/overview/OverviewTab";
import GeoMapTab from "@/components/map/GeoMapTab";
import AnalysisTab from "@/components/analysis/AnalysisTab";
import LiveFeedTab from "@/components/feed/LiveFeedTab";
import AIAnalystPanel from "@/components/ai/AIAnalystPanel";
import DetailDrawer from "@/components/overview/DetailDrawer";
import PostDetailDialog from "@/components/feed/PostDetailDialog";
import { useApp } from "@/contexts/AppContext";

export default function Dashboard() {
  const { activeTab } = useApp();

  return (
    <DashboardShell>
      <div className="p-4" data-testid="dashboard-root">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "map" && <GeoMapTab />}
        {activeTab === "analysis" && <AnalysisTab />}
        {activeTab === "feed" && <LiveFeedTab />}
      </div>
      <DetailDrawer />
      <PostDetailDialog />
      <AIAnalystPanel />
    </DashboardShell>
  );
}
