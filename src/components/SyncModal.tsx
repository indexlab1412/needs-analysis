"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useFinancialStore } from "@/context/financial-store";
import {
  X,
  QrCode,
  Lock,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Unplug,
  ArrowRight,
  Smartphone,
  Laptop,
} from "lucide-react";

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSyncId?: string;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose, initialSyncId }) => {
  const {
    syncConfig,
    isOnline,
    syncStatus,
    enableSync,
    joinSync,
    disconnectSync,
    triggerManualSync,
  } = useFinancialStore();

  const [activeTab, setActiveTab] = useState<"pair_qr" | "join_code" | "status">(
    syncConfig?.isSyncActive ? "status" : initialSyncId ? "join_code" : "pair_qr"
  );

  // PIN & Pairing states
  const [pin, setPin] = useState<string>("");
  const [confirmPin, setConfirmPin] = useState<string>("");
  const [showPin, setShowPin] = useState<boolean>(false);
  const [joinSyncId, setJoinSyncId] = useState<string>(initialSyncId || "");
  const [joinPin, setJoinPin] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    if (initialSyncId) {
      setJoinSyncId(initialSyncId);
      if (!syncConfig?.isSyncActive) {
        setActiveTab("join_code");
      }
    }
  }, [initialSyncId, syncConfig?.isSyncActive]);

  useEffect(() => {
    if (syncConfig?.isSyncActive) {
      setActiveTab("status");
    }
  }, [syncConfig?.isSyncActive]);

  if (!isOpen) return null;

  const pairingUrl = typeof window !== "undefined" && syncConfig?.syncId
    ? `${window.location.origin}${window.location.pathname}?syncId=${syncConfig.syncId}&action=pair`
    : "";

  const handleGeneratePairing = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (pin.length < 4) {
      setErrorMessage("PIN must be at least 4 digits.");
      return;
    }

    if (pin !== confirmPin) {
      setErrorMessage("PINs do not match.");
      return;
    }

    if (!isOnline) {
      setErrorMessage("Internet connection is required to create a sync room.");
      return;
    }

    setIsLoading(true);
    try {
      await enableSync(pin);
      setSuccessMessage("Sync room created! Scan the QR code with your second device.");
      setActiveTab("status");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initialize sync room.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!joinSyncId.trim()) {
      setErrorMessage("Please enter a valid Sync Room ID.");
      return;
    }

    if (joinPin.length < 4) {
      setErrorMessage("PIN must be at least 4 digits.");
      return;
    }

    if (!isOnline) {
      setErrorMessage("Internet connection is required to join a sync room.");
      return;
    }

    setIsLoading(true);
    try {
      await joinSync(joinSyncId.trim(), joinPin.trim());
      setSuccessMessage("Device paired and financial data synced successfully!");
      setActiveTab("status");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to decrypt and sync data. Check your PIN and Room ID.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!pairingUrl) return;
    navigator.clipboard.writeText(pairingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Multi-Device Cloud Sync
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                End-to-end encrypted device pairing with PIN protection
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Internet & Privacy Warning Banner */}
        <div className="px-4 sm:px-5 pt-3 pb-1 space-y-2">
          {!isOnline ? (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <WifiOff className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">Internet Connection Offline</strong>
                <span>You are currently offline. An active internet connection is required to sync or pair devices. Local changes remain saved safely on this device.</span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl flex items-start gap-2 text-[11px] text-indigo-900 dark:text-indigo-200">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Zero-Knowledge AES-256 Encryption:</span> Data is encrypted with your PIN in your browser before syncing. Unlimited profile size and multi-year history supported.
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-5 pt-2">
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-700 text-xs">
            {syncConfig?.isSyncActive ? (
              <>
                <button
                  onClick={() => setActiveTab("status")}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "status"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sync Status</span>
                </button>

                <button
                  onClick={() => setActiveTab("pair_qr")}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "pair_qr"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Show QR Code</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab("pair_qr")}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "pair_qr"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>1. Start Sync (This Device)</span>
                </button>

                <button
                  onClick={() => setActiveTab("join_code")}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "join_code"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>2. Link Second Device</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {/* Alerts */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 dark:bg-rose-950/60 dark:border-rose-800 rounded-2xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800 rounded-2xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB: PAIR WITH QR / START SYNC */}
          {activeTab === "pair_qr" && (
            <div className="space-y-4">
              {syncConfig?.isSyncActive ? (
                // Already paired: Show QR code for adding more devices
                <div className="space-y-4 text-center">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700 inline-block mx-auto shadow-inner">
                    <div className="bg-white p-3 rounded-2xl shadow-sm">
                      <QRCodeSVG
                        value={pairingUrl}
                        size={200}
                        level="M"
                        includeMargin={false}
                        className="mx-auto"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Scan with your phone's native camera
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      Opening the link on your second device will prompt for your PIN to unlock and mirror your plan.
                    </p>
                  </div>

                  {/* Copy Link & Sync ID */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-left">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Sync Room ID:</span>
                      <code className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-lg">
                        {syncConfig.syncId}
                      </code>
                    </div>

                    <button
                      onClick={handleCopyLink}
                      className="w-full py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? "Link Copied to Clipboard!" : "Copy Direct Pairing Link"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                // Not yet active: Set PIN to generate QR code
                <form onSubmit={handleGeneratePairing} className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-indigo-600" />
                      Set a 4-6 Digit Security PIN
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      This PIN creates an encrypted master key. You will need to type this PIN on your other device after scanning the QR code.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Choose PIN
                      </label>
                      <div className="relative">
                        <input
                          type={showPin ? "text" : "password"}
                          maxLength={8}
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          placeholder="e.g. 1234"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono tracking-widest text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Confirm PIN
                      </label>
                      <input
                        type={showPin ? "text" : "password"}
                        maxLength={8}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        placeholder="Re-enter PIN"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono tracking-widest text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !isOnline}
                    className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <QrCode className="w-4 h-4" />
                    )}
                    <span>Generate Encrypted QR Code</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB: JOIN WITH CODE */}
          {activeTab === "join_code" && (
            <form onSubmit={handleJoinSync} className="space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                  Link Device via Room ID & PIN
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enter the Sync Room ID from your primary device along with your PIN.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Sync Room ID
                  </label>
                  <input
                    type="text"
                    value={joinSyncId}
                    onChange={(e) => setJoinSyncId(e.target.value)}
                    placeholder="e.g. sync_9b1a2c3d"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Security PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? "text" : "password"}
                      maxLength={8}
                      value={joinPin}
                      onChange={(e) => setJoinPin(e.target.value)}
                      placeholder="Enter 4-6 digit PIN"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono tracking-widest text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isOnline}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>Unlock & Sync Financial Plan</span>
              </button>
            </form>
          )}

          {/* TAB: SYNC STATUS & CONTROLS */}
          {activeTab === "status" && syncConfig?.isSyncActive && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-emerald-900 dark:text-emerald-300">
                      Live Multi-Device Sync Active
                    </h3>
                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
                      End-to-End Encrypted Room: <strong className="font-mono">{syncConfig.syncId}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Network Status</span>
                  <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-900 dark:text-white">
                    {isOnline ? (
                      <>
                        <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Online</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-amber-600">Offline</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Synchronized</span>
                  <div className="mt-1 font-bold text-slate-900 dark:text-white truncate">
                    {syncConfig.lastSyncedAt
                      ? new Date(syncConfig.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                      : "Just now"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      await triggerManualSync();
                      setSuccessMessage("Synchronized latest changes successfully!");
                      setTimeout(() => setSuccessMessage(null), 3000);
                    } catch (e: any) {
                      setErrorMessage(e.message || "Manual sync failed");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading || !isOnline}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  <span>Sync Now (Push & Pull Updates)</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to disconnect this device from sync? Local data will remain intact.")) {
                      disconnectSync();
                      setActiveTab("pair_qr");
                    }
                  }}
                  className="w-full py-2 px-4 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Unplug className="w-3.5 h-3.5" />
                  <span>Unlink / Disconnect Sync</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
