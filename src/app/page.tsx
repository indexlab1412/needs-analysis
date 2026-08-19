"use client";

import React from "react";
import { useFinancialStore } from "@/context/financial-store";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { DashboardView } from "@/components/DashboardView";
import { ShortfallView } from "@/components/ShortfallView";
import { PriorityPlannerView } from "@/components/PriorityPlannerView";
import { WizardView } from "@/components/WizardView";
import { SimulatorView } from "@/components/SimulatorView";
import { VaultView } from "@/components/VaultView";
import { ReportModal } from "@/components/ReportModal";
import { SyncModal } from "@/components/SyncModal";

export default function Home() {
  const { activeTab, isInitialized, isSyncModalOpen, setIsSyncModalOpen, initialSyncIdParam } = useFinancialStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isInitialized) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3">
          Loading Financial Engine...
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Mobile-Optimized Top App Bar */}
      <MobileHeader />

      {/* Main Responsive View Container */}
      <div className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-5">
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "shortfall" && <ShortfallView />}
        {activeTab === "priorities" && <PriorityPlannerView />}
        {activeTab === "wizard" && <WizardView />}
        {activeTab === "simulator" && <SimulatorView />}
        {activeTab === "vault" && <VaultView />}
      </div>

      {/* Single-Thumb Mobile Bottom Navigation */}
      <BottomNav />

      {/* Printable / Downloadable FNA Report Modal */}
      <ReportModal />

      {/* Multi-Device QR Pairing & Sync Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        initialSyncId={initialSyncIdParam || undefined}
      />
    </main>
  );
}
