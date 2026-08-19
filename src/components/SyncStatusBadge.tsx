"use client";

import React from "react";
import { useFinancialStore } from "@/context/financial-store";
import { WifiOff, RefreshCw, CheckCircle2, QrCode, AlertCircle } from "lucide-react";

interface SyncStatusBadgeProps {
  onOpenModal: () => void;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ onOpenModal }) => {
  const { syncConfig, isOnline, syncStatus } = useFinancialStore();

  if (!isOnline) {
    return (
      <button
        onClick={onOpenModal}
        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700 hover:bg-amber-100 transition-all shadow-sm"
        title="Internet connection is offline. Changes are saved locally on this device."
      >
        <WifiOff className="w-3 h-3 text-amber-500 animate-pulse" />
        <span className="hidden sm:inline">Offline (Local Only)</span>
        <span className="sm:hidden">Offline</span>
      </button>
    );
  }

  if (!syncConfig?.isSyncActive) {
    return (
      <button
        onClick={onOpenModal}
        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all shadow-sm"
        title="Pair this device with another device via QR code & PIN"
      >
        <QrCode className="w-3 h-3 text-indigo-500" />
        <span className="hidden sm:inline">Pair Device</span>
        <span className="sm:hidden">Pair</span>
      </button>
    );
  }

  if (syncStatus === "syncing") {
    return (
      <button
        onClick={onOpenModal}
        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 animate-pulse shadow-sm"
        title="Syncing encrypted changes..."
      >
        <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
        <span>Syncing...</span>
      </button>
    );
  }

  if (syncStatus === "error") {
    return (
      <button
        onClick={onOpenModal}
        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 shadow-sm"
        title="Sync encountered an error. Click to resolve."
      >
        <AlertCircle className="w-3 h-3 text-rose-500" />
        <span>Sync Issue</span>
      </button>
    );
  }

  return (
    <button
      onClick={onOpenModal}
      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all shadow-sm"
      title={`Live Encrypted Sync Active. Last synced: ${
        syncConfig.lastSyncedAt ? new Date(syncConfig.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"
      }`}
    >
      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
      <span className="hidden sm:inline">Synced</span>
    </button>
  );
};
