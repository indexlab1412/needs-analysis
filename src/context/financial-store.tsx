"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from "react";
import {
  UserFinancialProfile,
  FNAReportSummary,
  PartnerProfile,
  PlanningCadence,
  PlanningScope,
  MonthlyCashflowLog,
  YearlySnapshot,
  StockHolding,
} from "@/lib/fna/types";
import { analyzeFinancialNeeds } from "@/lib/fna/engine";
import { calculatePortfolioMetrics } from "@/lib/fna/snowball-engine";
import { SAMPLE_PROFILES, DEFAULT_BLANK_PROFILE } from "@/lib/fna/sample-data";
import { generateId, formatCurrency } from "@/lib/utils";
import { encryptPayload, decryptPayload, EncryptedSyncPayload } from "@/lib/sync/crypto";

type TabType = "dashboard" | "wizard" | "shortfall" | "priorities" | "simulator" | "vault";

export type ThemeMode = "system" | "light" | "dark";

export interface SyncConfig {
  syncId: string;
  pin: string;
  isSyncActive: boolean;
  lastSyncedAt?: string;
  version: number;
}

export type SyncStatus = "synced" | "syncing" | "offline" | "error" | "unpaired";

interface MergeResult {
  success: boolean;
  partnerName?: string;
  mergedAssetsCount?: number;
  mergedDebtsCount?: number;
  mergedPoliciesCount?: number;
  error?: string;
}

interface FinancialStoreContextType {
  profile: UserFinancialProfile;
  summary: FNAReportSummary;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  wizardStep: number;
  setWizardStep: (step: number) => void;
  goToWizardStep: (step: number) => void;
  isQuickCheckinOpen: boolean;
  setIsQuickCheckinOpen: (open: boolean) => void;
  isSamplePreset: boolean;
  isWelcomeGuideDismissed: boolean;
  setWelcomeGuideDismissed: (dismissed: boolean) => void;
  updateProfile: (updater: (prev: UserFinancialProfile) => UserFinancialProfile) => void;
  setProfile: (newProfile: UserFinancialProfile) => void;
  setPlanningCadence: (cadence: PlanningCadence) => void;
  setPlanningScope: (scope: PlanningScope) => void;
  logMonthlyCashflow: (notes?: string) => void;
  closeMonthAndRollNext: (notes?: string) => void;
  captureYearlySnapshot: (milestone?: string, notes?: string) => void;
  loadPreset: (key: string) => void;
  resetProfile: () => void;
  exportData: () => void;
  importData: (json: string) => boolean;
  mergePartnerProfile: (json: string) => MergeResult;
  currency: string;
  setCurrency: (c: string) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  isGuideModalOpen: boolean;
  setIsGuideModalOpen: (open: boolean) => void;
  isInitialized: boolean;

  // Theme Mode
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;

  // Face-to-Face Privacy Shield
  isPrivacyMode: boolean;
  setIsPrivacyMode: (val: boolean) => void;
  togglePrivacyMode: () => void;
  formatMoney: (amount: number, overrideDecimals?: number) => string;

  // Local Backup Tracking & Reminder
  lastBackupExportedAt: string | null;
  backupReminderSnoozedUntil: string | null;
  shouldShowBackupReminder: boolean;
  snoozeBackupReminder: (days?: number) => void;
  dismissBackupReminder: () => void;

  // Cloud Sync & QR Pairing
  syncConfig: SyncConfig | null;
  isOnline: boolean;
  syncStatus: SyncStatus;
  isSyncModalOpen: boolean;
  setIsSyncModalOpen: (open: boolean) => void;
  initialSyncIdParam: string | null;
  setInitialSyncIdParam: (id: string | null) => void;
  enableSync: (pin: string) => Promise<void>;
  joinSync: (syncId: string, pin: string) => Promise<void>;
  disconnectSync: () => Promise<void>;
  triggerManualSync: () => Promise<void>;
  
  // Stock Holdings & Dividend Snowball
  addStockHolding: (holding: Omit<StockHolding, "id">) => void;
  updateStockHolding: (id: string, updates: Partial<StockHolding>) => void;
  removeStockHolding: (id: string) => void;
  syncStockHoldingsToFna: () => { assetUpdated: boolean; incomeUpdated: boolean; totalValue: number; monthlyDividends: number };
}

const STORAGE_KEY = "fna_user_profile_v1";
const GUIDE_STORAGE_KEY = "fna_guide_dismissed_v1";
const SAMPLE_FLAG_STORAGE_KEY = "fna_is_sample_preset_v1";
const SYNC_CONFIG_KEY = "fna_sync_config_v1";
const LAST_BACKUP_KEY = "fna_last_backup_exported_at_v1";
const BACKUP_SNOOZED_KEY = "fna_backup_reminder_snoozed_v1";
const THEME_KEY = "fna_theme_mode_v1";
const PRIVACY_KEY = "fna_privacy_mode_v1";

const FinancialStoreContext = createContext<FinancialStoreContextType | undefined>(undefined);

export function FinancialStoreProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserFinancialProfile>({
    ...SAMPLE_PROFILES.fresh_grad.data,
    planningCadence: "monthly",
    planningScope: "individual",
  });
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [isQuickCheckinOpen, setIsQuickCheckinOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isSamplePreset, setIsSamplePreset] = useState<boolean>(true);
  const [isWelcomeGuideDismissed, setIsWelcomeGuideDismissed] = useState<boolean>(false);

  // Theme Mode State
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  // Face-to-Face Privacy Shield State
  const [isPrivacyMode, setIsPrivacyModeState] = useState<boolean>(false);

  // Local Backup State
  const [lastBackupExportedAt, setLastBackupExportedAt] = useState<string | null>(null);
  const [backupReminderSnoozedUntil, setBackupReminderSnoozedUntil] = useState<string | null>(null);
  const [isBackupDismissedSession, setIsBackupDismissedSession] = useState<boolean>(false);

  // Sync state
  const [syncConfig, setSyncConfig] = useState<SyncConfig | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("unpaired");
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [initialSyncIdParam, setInitialSyncIdParam] = useState<string | null>(null);

  const setIsPrivacyMode = useCallback((val: boolean) => {
    setIsPrivacyModeState(val);
    try {
      localStorage.setItem(PRIVACY_KEY, String(val));
    } catch (e) {
      console.error("Failed to save privacy mode:", e);
    }
  }, []);

  const togglePrivacyMode = useCallback(() => {
    setIsPrivacyModeState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(PRIVACY_KEY, String(next));
      } catch (e) {
        console.error("Failed to save privacy mode:", e);
      }
      return next;
    });
  }, []);

  const formatMoney = useCallback(
    (amount: number, overrideDecimals: number = 0): string => {
      return formatCurrency(amount, profile.currency || "SGD", overrideDecimals, isPrivacyMode);
    },
    [profile.currency, isPrivacyMode]
  );

  // Ref to track whether local edit should trigger auto-push
  const isSyncingFromRemoteRef = useRef<boolean>(false);
  const syncDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestProfileRef = useRef<UserFinancialProfile>(profile);
  latestProfileRef.current = profile;

  // 1. Initial Local Storage Load & URL Search Param check
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        setIsOnline(navigator.onLine);
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      const savedGuide = localStorage.getItem(GUIDE_STORAGE_KEY);
      const savedSampleFlag = localStorage.getItem(SAMPLE_FLAG_STORAGE_KEY);
      const savedSync = localStorage.getItem(SYNC_CONFIG_KEY);
      const savedLastBackup = localStorage.getItem(LAST_BACKUP_KEY);
      const savedSnooze = localStorage.getItem(BACKUP_SNOOZED_KEY);
      const savedTheme = localStorage.getItem(THEME_KEY) as ThemeMode | null;
      const savedPrivacy = localStorage.getItem(PRIVACY_KEY);

      if (savedPrivacy !== null) {
        setIsPrivacyModeState(savedPrivacy === "true");
      }

      if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system")) {
        setThemeModeState(savedTheme);
      }

      if (savedLastBackup) {
        setLastBackupExportedAt(savedLastBackup);
      }
      if (savedSnooze) {
        setBackupReminderSnoozedUntil(savedSnooze);
      }

      if (savedSync) {
        try {
          const parsedSync: SyncConfig = JSON.parse(savedSync);
          if (parsedSync && parsedSync.isSyncActive) {
            setSyncConfig(parsedSync);
            setSyncStatus("synced");
          }
        } catch (e) {
          console.warn("Could not parse sync config:", e);
        }
      }

      if (saved) {
        const parsed = JSON.parse(saved);
        const isPreset =
          parsed &&
          (parsed.id === "profile-fresh-grad" || parsed.id === "profile-young-family") &&
          parsed.name === "Alex Lee";

        if (savedGuide !== null) {
          setIsWelcomeGuideDismissed(savedGuide === "true");
        } else {
          setIsWelcomeGuideDismissed(!isPreset);
        }

        if (savedSampleFlag !== null) {
          setIsSamplePreset(savedSampleFlag === "true");
        } else {
          setIsSamplePreset(Boolean(isPreset));
        }

        if (parsed && parsed.id) {
          setProfileState((prev) => ({
            ...parsed,
            planningCadence: parsed.planningCadence || "monthly",
            planningScope: parsed.planningScope || (parsed.partner?.isEnabled ? "joint" : "individual"),
          }));
        }
      } else {
        setIsSamplePreset(true);
        if (savedGuide !== null) {
          setIsWelcomeGuideDismissed(savedGuide === "true");
        } else {
          setIsWelcomeGuideDismissed(false);
        }
      }

      // Check URL query parameters for auto-pairing (?syncId=...&action=pair)
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const urlSyncId = urlParams.get("syncId");
        if (urlSyncId) {
          setInitialSyncIdParam(urlSyncId);
          setIsSyncModalOpen(true);
        }
      }
    } catch (e) {
      console.warn("Could not load stored profile, using initial state:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // 2. Sync to local storage on state updates
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        localStorage.setItem(SAMPLE_FLAG_STORAGE_KEY, String(isSamplePreset));
        localStorage.setItem(GUIDE_STORAGE_KEY, String(isWelcomeGuideDismissed));
      } catch (e) {
        console.error("Failed to save to localStorage", e);
      }
    }
  }, [profile, isInitialized, isSamplePreset, isWelcomeGuideDismissed]);

  // 3. Online/Offline Network Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (syncConfig?.isSyncActive) {
        setSyncStatus("synced");
        // trigger check
        triggerPull();
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncConfig]);

  // 4. Theme Mode Listener and Class Application
  useEffect(() => {
    const applyTheme = () => {
      if (typeof window === "undefined") return;
      const root = document.documentElement;
      const isDark =
        themeMode === "dark" ||
        (themeMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme();

    if (themeMode === "system" && typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [themeMode]);

  // 5. Privacy Mode Keyboard Shortcut Listener (Alt+P or Ctrl/Cmd+Shift+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.altKey && (e.key === "p" || e.key === "P")) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "p" || e.key === "P"))
      ) {
        e.preventDefault();
        togglePrivacyMode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePrivacyMode]);

  // Push local changes to cloud (Encrypted with PIN)
  const pushEncryptedUpdate = useCallback(async (currentProfile: UserFinancialProfile, config: SyncConfig) => {
    if (!navigator.onLine || !config.isSyncActive) return;

    try {
      setSyncStatus("syncing");
      const nextVersion = (config.version || 1) + 1;
      const encrypted = await encryptPayload(currentProfile, config.pin, nextVersion);

      const res = await fetch(`/api/sync/${encodeURIComponent(config.syncId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: encrypted }),
      });

      if (!res.ok) {
        throw new Error("Failed to push update to sync room");
      }

      const updatedConfig: SyncConfig = {
        ...config,
        version: nextVersion,
        lastSyncedAt: new Date().toISOString(),
      };
      setSyncConfig(updatedConfig);
      localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(updatedConfig));
      setSyncStatus("synced");
    } catch (err) {
      console.error("Sync push error:", err);
      setSyncStatus("error");
    }
  }, []);

  // Pull latest changes from cloud (Decrypt with PIN)
  const triggerPull = useCallback(async () => {
    if (!syncConfig || !syncConfig.isSyncActive || !navigator.onLine) return;

    try {
      setSyncStatus("syncing");
      const res = await fetch(`/api/sync/${encodeURIComponent(syncConfig.syncId)}`);
      if (res.status === 404) {
        // Room expired or deleted
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to fetch sync room");
      }

      const data = await res.json();
      if (data.success && data.payload) {
        const remotePayload = data.payload as EncryptedSyncPayload;
        if (remotePayload.version > (syncConfig.version || 0)) {
          // Decrypt and update local state
          const decryptedProfile = await decryptPayload<UserFinancialProfile>(remotePayload, syncConfig.pin);
          if (decryptedProfile && decryptedProfile.id) {
            isSyncingFromRemoteRef.current = true;
            setProfileState(decryptedProfile);
            const updatedConfig: SyncConfig = {
              ...syncConfig,
              version: remotePayload.version,
              lastSyncedAt: new Date().toISOString(),
            };
            setSyncConfig(updatedConfig);
            localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(updatedConfig));
            setTimeout(() => {
              isSyncingFromRemoteRef.current = false;
            }, 500);
          }
        }
      }
      setSyncStatus("synced");
    } catch (err) {
      console.warn("Sync pull check error:", err);
      setSyncStatus("error");
    }
  }, [syncConfig]);

  // 4. Debounced Auto-Push on Local Profile Edits
  useEffect(() => {
    if (!isInitialized || !syncConfig?.isSyncActive || isSyncingFromRemoteRef.current) {
      return;
    }

    if (syncDebounceTimerRef.current) {
      clearTimeout(syncDebounceTimerRef.current);
    }

    syncDebounceTimerRef.current = setTimeout(() => {
      pushEncryptedUpdate(profile, syncConfig);
    }, 1500);

    return () => {
      if (syncDebounceTimerRef.current) {
        clearTimeout(syncDebounceTimerRef.current);
      }
    };
  }, [profile, syncConfig, isInitialized, pushEncryptedUpdate]);

  // 5. Periodic Pull & Window Focus Sync Check
  useEffect(() => {
    if (!syncConfig?.isSyncActive) return;

    const interval = setInterval(() => {
      triggerPull();
    }, 20000); // Check every 20s

    const handleFocus = () => {
      triggerPull();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [syncConfig, triggerPull]);

  // Enable Sync / Create new sync room
  const enableSync = async (pin: string) => {
    if (!navigator.onLine) {
      throw new Error("Internet connection is required to create a sync room.");
    }

    const syncId = `sync_${generateId("v")}`;
    const encrypted = await encryptPayload(profile, pin, 1);

    const res = await fetch(`/api/sync/${encodeURIComponent(syncId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: encrypted }),
    });

    if (!res.ok) {
      throw new Error("Failed to initialize sync room on server.");
    }

    const newConfig: SyncConfig = {
      syncId,
      pin,
      isSyncActive: true,
      version: 1,
      lastSyncedAt: new Date().toISOString(),
    };

    setSyncConfig(newConfig);
    localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(newConfig));
    setSyncStatus("synced");
  };

  // Join existing sync room with PIN
  const joinSync = async (syncId: string, pin: string) => {
    if (!navigator.onLine) {
      throw new Error("Internet connection is required to join a sync room.");
    }

    const res = await fetch(`/api/sync/${encodeURIComponent(syncId)}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Sync room not found. Check the Room ID or generate a new QR code.");
      }
      throw new Error("Failed to connect to sync room.");
    }

    const data = await res.json();
    if (!data.payload) {
      throw new Error("Invalid sync room response.");
    }

    const remotePayload = data.payload as EncryptedSyncPayload;
    // Decrypt payload
    const decryptedProfile = await decryptPayload<UserFinancialProfile>(remotePayload, pin);
    if (!decryptedProfile || !decryptedProfile.id) {
      throw new Error("Decrypted profile is invalid.");
    }

    isSyncingFromRemoteRef.current = true;
    setProfileState(decryptedProfile);
    setIsSamplePreset(false);

    const newConfig: SyncConfig = {
      syncId,
      pin,
      isSyncActive: true,
      version: remotePayload.version || 1,
      lastSyncedAt: new Date().toISOString(),
    };

    setSyncConfig(newConfig);
    localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(newConfig));
    setSyncStatus("synced");

    setTimeout(() => {
      isSyncingFromRemoteRef.current = false;
    }, 500);
  };

  // Disconnect sync
  const disconnectSync = async () => {
    if (syncConfig?.syncId) {
      try {
        await fetch(`/api/sync/${encodeURIComponent(syncConfig.syncId)}`, { method: "DELETE" });
      } catch {
        // ignore delete failure
      }
    }
    setSyncConfig(null);
    localStorage.removeItem(SYNC_CONFIG_KEY);
    setSyncStatus("unpaired");
  };

  // Manual Push/Pull
  const triggerManualSync = async () => {
    if (!syncConfig?.isSyncActive) return;
    if (!navigator.onLine) {
      throw new Error("Cannot sync while offline. Please connect to the internet.");
    }
    await triggerPull();
    await pushEncryptedUpdate(latestProfileRef.current, syncConfig);
  };

  // Compute live FNA summary
  const summary: FNAReportSummary = analyzeFinancialNeeds(profile);

  const goToWizardStep = (step: number) => {
    setWizardStep(step);
    setActiveTab("wizard");
  };

  const handleSetWelcomeGuideDismissed = (dismissed: boolean) => {
    setIsWelcomeGuideDismissed(dismissed);
    try {
      localStorage.setItem(GUIDE_STORAGE_KEY, String(dismissed));
    } catch (e) {
      console.error(e);
    }
  };

  const updateProfile = (updater: (prev: UserFinancialProfile) => UserFinancialProfile) => {
    setIsSamplePreset(false);
    setProfileState((prev) => updater(prev));
  };

  const setProfile = (newProfile: UserFinancialProfile) => {
    setProfileState(newProfile);
  };

  const setPlanningCadence = (cadence: PlanningCadence) => {
    updateProfile((p) => ({ ...p, planningCadence: cadence }));
  };

  const setPlanningScope = (scope: PlanningScope) => {
    updateProfile((p) => {
      const isJoint = scope === "joint";
      return {
        ...p,
        planningScope: scope,
        partner: p.partner
          ? { ...p.partner, isEnabled: isJoint }
          : isJoint
          ? {
              isEnabled: true,
              name: "Chloe (Partner)",
              currentAge: Math.max(20, p.currentAge - 1),
              targetRetirementAge: p.targetRetirementAge,
              monthlyIncome: 3500,
              monthlyPersonalExpenses: 800,
              personalDebts: 8000,
              monthlyDebtRepayment: 200,
              liquidSavings: 12000,
              investmentsValue: 10000,
              monthlyDCA: 200,
              deathBenefit: 300000,
              ciBenefit: 150000,
              cpfLifeEstimatedMonthlyToday: 1650,
            }
          : undefined,
      };
    });
  };

  const logMonthlyCashflow = (notes?: string) => {
    const activeMY = profile.activePlanningMonthYear || "2026-08";
    const [yearStr, monthStr] = activeMY.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const dateObj = new Date(year, month - 1, 1);
    const monthLabel = dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const newLog: MonthlyCashflowLog = {
      id: generateId("log"),
      monthYear: activeMY,
      monthLabel,
      dateRecorded: new Date().toISOString().split("T")[0],
      totalIncome: summary.cashFlow.totalMonthlyIncome,
      totalExpenses: summary.cashFlow.totalMonthlyExpenses,
      totalDcaInvested: summary.cashFlow.totalMonthlyDCAInvestments,
      netSavings: summary.cashFlow.monthlyNetSavings,
      savingsRatePercentage: summary.cashFlow.savingsRatePercentage,
      netWorthAtMonthEnd: summary.netWorth.netWorth,
      keyNotes: notes || `Recorded cashflow snapshot for ${monthLabel}.`,
      expensesSnapshot: JSON.parse(JSON.stringify(profile.expenses)),
      assetsSnapshot: JSON.parse(JSON.stringify(profile.assets)),
    };

    updateProfile((p) => {
      const existing = p.monthlyLogs || [];
      const filtered = existing.filter((l) => l.monthYear !== activeMY);
      return { ...p, monthlyLogs: [...filtered, newLog].sort((a, b) => a.monthYear.localeCompare(b.monthYear)) };
    });
  };

  const closeMonthAndRollNext = (notes?: string) => {
    const activeMY = profile.activePlanningMonthYear || "2026-08";
    const [yearStr, monthStr] = activeMY.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const dateObj = new Date(year, month - 1, 1);
    const monthLabel = dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const newLog: MonthlyCashflowLog = {
      id: generateId("log"),
      monthYear: activeMY,
      monthLabel,
      dateRecorded: new Date().toISOString().split("T")[0],
      totalIncome: summary.cashFlow.totalMonthlyIncome,
      totalExpenses: summary.cashFlow.totalMonthlyExpenses,
      totalDcaInvested: summary.cashFlow.totalMonthlyDCAInvestments,
      netSavings: summary.cashFlow.monthlyNetSavings,
      savingsRatePercentage: summary.cashFlow.savingsRatePercentage,
      netWorthAtMonthEnd: summary.netWorth.netWorth,
      keyNotes: notes || `Closed ${monthLabel} and archived snapshot.`,
      expensesSnapshot: JSON.parse(JSON.stringify(profile.expenses)),
      assetsSnapshot: JSON.parse(JSON.stringify(profile.assets)),
    };

    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    const nextMonthYear = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;

    updateProfile((p) => {
      const existing = p.monthlyLogs || [];
      const filtered = existing.filter((l) => l.monthYear !== activeMY);
      return {
        ...p,
        activePlanningMonthYear: nextMonthYear,
        monthlyLogs: [...filtered, newLog].sort((a, b) => a.monthYear.localeCompare(b.monthYear)),
      };
    });
  };

  const captureYearlySnapshot = (milestone?: string, notes?: string) => {
    const currentYear = new Date().getFullYear();
    const newSnap: YearlySnapshot = {
      id: generateId("snap"),
      year: currentYear,
      dateRecorded: new Date().toISOString().split("T")[0],
      totalNetWorth: summary.netWorth.netWorth,
      totalLiquidSavings: summary.netWorth.liquidAssets,
      totalInvestments: summary.profile.assets
        .filter((a) => !a.isLiquid && a.category !== "cash_savings")
        .reduce((sum, a) => sum + (Number(a.currentValue) || 0), 0),
      totalLiabilities: summary.netWorth.totalLiabilities,
      annualIncome: summary.cashFlow.totalMonthlyIncome * 12,
      annualSavingsRate: summary.cashFlow.savingsRatePercentage,
      financialHealthScore: summary.overallFinancialHealthScore,
      keyMilestoneAchieved: milestone || "Annual review snapshot captured.",
      reflectionNotes: notes || "Review completed.",
    };

    updateProfile((p) => {
      const existing = p.yearlySnapshots || [];
      const filtered = existing.filter((s) => s.year !== currentYear);
      return { ...p, yearlySnapshots: [...filtered, newSnap].sort((a, b) => a.year - b.year) };
    });
  };

  const loadPreset = (key: string) => {
    if (SAMPLE_PROFILES[key]) {
      setIsSamplePreset(true);
      setProfileState(JSON.parse(JSON.stringify(SAMPLE_PROFILES[key].data)));
    }
  };

  const resetProfile = () => {
    setIsSamplePreset(false);
    setProfileState(JSON.parse(JSON.stringify(DEFAULT_BLANK_PROFILE)));
  };

  const setCurrency = (c: string) => {
    updateProfile((p) => ({ ...p, currency: c }));
  };

  const addStockHolding = (holding: Omit<StockHolding, "id">) => {
    const newHolding: StockHolding = {
      ...holding,
      id: generateId("stk"),
    };
    updateProfile((p) => ({
      ...p,
      stockHoldings: [...(p.stockHoldings || []), newHolding],
    }));
  };

  const updateStockHolding = (id: string, updates: Partial<StockHolding>) => {
    updateProfile((p) => ({
      ...p,
      stockHoldings: (p.stockHoldings || []).map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
  };

  const removeStockHolding = (id: string) => {
    updateProfile((p) => ({
      ...p,
      stockHoldings: (p.stockHoldings || []).filter((h) => h.id !== id),
    }));
  };

  const syncStockHoldingsToFna = () => {
    const holdings = profile.stockHoldings || [];
    const metrics = calculatePortfolioMetrics(holdings);

    let assetUpdated = false;
    let incomeUpdated = false;

    updateProfile((p) => {
      // 1. Update or add asset
      const assets = [...p.assets];
      const existingAssetIndex = assets.findIndex(
        (a) =>
          a.description.toLowerCase().includes("dividend stock") ||
          a.description.toLowerCase().includes("stock holdings") ||
          a.description.toLowerCase().includes("stock portfolio")
      );

      const blendedReturn = Math.max(5.0, Math.round((metrics.portfolioYield + 4.5) * 10) / 10);

      if (existingAssetIndex >= 0) {
        assets[existingAssetIndex] = {
          ...assets[existingAssetIndex],
          currentValue: metrics.totalValue,
          expectedReturnRate: blendedReturn,
        };
        assetUpdated = true;
      } else if (metrics.totalValue > 0) {
        assets.push({
          id: generateId("ast"),
          category: "stocks_funds",
          description: "Dividend Stock Portfolio",
          platformOrVehicle: "Direct Equities / Brokerage",
          currentValue: metrics.totalValue,
          isLiquid: false,
          expectedReturnRate: blendedReturn,
          monthlyContribution: 0,
          targetPurpose: "retirement",
        });
        assetUpdated = true;
      }

      // 2. Update or add dividend income
      const incomes = [...p.incomes];
      const existingIncomeIndex = incomes.findIndex((i) => i.category === "dividends");

      if (existingIncomeIndex >= 0) {
        incomes[existingIncomeIndex] = {
          ...incomes[existingIncomeIndex],
          monthlyAmount: metrics.monthlyDividends,
        };
        incomeUpdated = true;
      } else if (metrics.monthlyDividends > 0) {
        incomes.push({
          id: generateId("inc"),
          category: "dividends",
          description: "Stock Dividend Payouts",
          monthlyAmount: metrics.monthlyDividends,
        });
        incomeUpdated = true;
      }

      return {
        ...p,
        assets,
        incomes,
      };
    });

    return {
      assetUpdated,
      incomeUpdated,
      totalValue: metrics.totalValue,
      monthlyDividends: metrics.monthlyDividends,
    };
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(THEME_KEY, mode);
    } catch (e) {
      console.error("Failed to save theme to localStorage", e);
    }
  };

  const toggleTheme = () => {
    const isCurrentDark =
      themeMode === "dark" ||
      (themeMode === "system" &&
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    const newMode: ThemeMode = isCurrentDark ? "light" : "dark";
    setThemeMode(newMode);
  };

  const snoozeBackupReminder = (days: number = 7) => {
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + days);
    const iso = snoozeDate.toISOString();
    setBackupReminderSnoozedUntil(iso);
    try {
      localStorage.setItem(BACKUP_SNOOZED_KEY, iso);
    } catch (e) {
      console.error(e);
    }
  };

  const dismissBackupReminder = () => {
    setIsBackupDismissedSession(true);
  };

  const shouldShowBackupReminder = (() => {
    if (!isInitialized || isBackupDismissedSession || isSamplePreset) {
      return false;
    }
    if (backupReminderSnoozedUntil) {
      const snoozeTime = new Date(backupReminderSnoozedUntil).getTime();
      if (Date.now() < snoozeTime) {
        return false;
      }
    }
    if (!lastBackupExportedAt) {
      // User has customized plan and hasn't exported a backup yet
      return true;
    }
    const daysSince = (Date.now() - new Date(lastBackupExportedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 14;
  })();

  const exportData = () => {
    const nowIso = new Date().toISOString();
    setLastBackupExportedAt(nowIso);
    try {
      localStorage.setItem(LAST_BACKUP_KEY, nowIso);
    } catch (e) {
      console.error(e);
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `financial-plan-${(profile.name || "profile").toLowerCase().replace(/\s+/g, "-")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importData = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.id && parsed.incomes && parsed.expenses) {
        setProfileState(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const mergePartnerProfile = (jsonStr: string): MergeResult => {
    try {
      const partnerData: UserFinancialProfile = JSON.parse(jsonStr);
      if (!partnerData || !partnerData.id || !partnerData.name) {
        return { success: false, error: "Invalid financial plan file format." };
      }

      const partnerName = partnerData.name || "Partner";

      const mergedIncomes = [
        ...profile.incomes,
        ...partnerData.incomes.map((inc) => ({
          ...inc,
          id: generateId("p-inc"),
          description: `[${partnerName}] ${inc.description}`,
        })),
      ];

      const mergedExpenses = [
        ...profile.expenses,
        ...partnerData.expenses.map((exp) => ({
          ...exp,
          id: generateId("p-exp"),
          description: `[${partnerName}] ${exp.description}`,
        })),
      ];

      const mergedAssets = [
        ...profile.assets,
        ...partnerData.assets.map((ast) => ({
          ...ast,
          id: generateId("p-ast"),
          description: `[${partnerName}] ${ast.description}`,
        })),
      ];

      const mergedLiabilities = [
        ...profile.liabilities,
        ...partnerData.liabilities.map((lia) => ({
          ...lia,
          id: generateId("p-lia"),
          description: `[${partnerName}] ${lia.description}`,
        })),
      ];

      const mergedPolicies = [
        ...profile.insurancePolicies,
        ...partnerData.insurancePolicies.map((pol) => ({
          ...pol,
          id: generateId("p-pol"),
          policyName: `[${partnerName}] ${pol.policyName}`,
        })),
      ];

      const mergedGoals = [
        ...profile.goals,
        ...partnerData.goals.map((g) => ({
          ...g,
          id: generateId("p-goal"),
          name: `[${partnerName}] ${g.name}`,
        })),
      ];

      const partnerMonthlyIncome = partnerData.incomes.reduce((sum, i) => sum + (Number(i.monthlyAmount) || 0), 0);
      const partnerMonthlyExpenses = partnerData.expenses.reduce((sum, e) => sum + (Number(e.monthlyAmount) || 0), 0);
      const partnerDebts = partnerData.liabilities.reduce((sum, l) => sum + (Number(l.outstandingBalance) || 0), 0);
      const partnerDebtRepay = partnerData.liabilities.reduce((sum, l) => sum + (Number(l.monthlyRepayment) || 0), 0);
      const partnerLiquidSavings = partnerData.assets
        .filter((a) => a.isLiquid || a.category === "cash_savings")
        .reduce((sum, a) => sum + (Number(a.currentValue) || 0), 0);
      const partnerInvestments = partnerData.assets
        .filter((a) => !a.isLiquid && a.category !== "cash_savings")
        .reduce((sum, a) => sum + (Number(a.currentValue) || 0), 0);
      const partnerDCA = partnerData.assets.reduce((sum, a) => sum + (Number(a.monthlyContribution) || 0), 0);
      const partnerDeath = partnerData.insurancePolicies.reduce((sum, p) => sum + (Number(p.deathBenefit) || 0), 0);
      const partnerCi = partnerData.insurancePolicies.reduce((sum, p) => sum + (Number(p.majorCiBenefit) || 0), 0);
      const partnerCpf = partnerData.cpfLife?.estimatedMonthlyPayoutToday ?? 1650;

      const newPartnerObj: PartnerProfile = {
        isEnabled: true,
        name: partnerName,
        currentAge: partnerData.currentAge || 25,
        targetRetirementAge: partnerData.targetRetirementAge || 58,
        monthlyIncome: partnerMonthlyIncome,
        monthlyPersonalExpenses: partnerMonthlyExpenses,
        personalDebts: partnerDebts,
        monthlyDebtRepayment: partnerDebtRepay,
        liquidSavings: partnerLiquidSavings,
        investmentsValue: partnerInvestments,
        monthlyDCA: partnerDCA,
        deathBenefit: partnerDeath,
        ciBenefit: partnerCi,
        cpfLifeEstimatedMonthlyToday: partnerCpf,
      };

      setProfileState((prev) => ({
        ...prev,
        maritalStatus: "married",
        planningScope: "joint",
        incomes: mergedIncomes,
        expenses: mergedExpenses,
        assets: mergedAssets,
        liabilities: mergedLiabilities,
        insurancePolicies: mergedPolicies,
        goals: mergedGoals,
        partner: newPartnerObj,
      }));

      return {
        success: true,
        partnerName,
        mergedAssetsCount: partnerData.assets.length,
        mergedDebtsCount: partnerData.liabilities.length,
        mergedPoliciesCount: partnerData.insurancePolicies.length,
      };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to parse partner file." };
    }
  };

  return (
    <FinancialStoreContext.Provider
      value={{
        profile,
        summary,
        activeTab,
        setActiveTab,
        wizardStep,
        setWizardStep,
        goToWizardStep,
        isQuickCheckinOpen,
        setIsQuickCheckinOpen,
        isSamplePreset,
        isWelcomeGuideDismissed,
        setWelcomeGuideDismissed: handleSetWelcomeGuideDismissed,
        updateProfile,
        setProfile,
        setPlanningCadence,
        setPlanningScope,
        logMonthlyCashflow,
        closeMonthAndRollNext,
        captureYearlySnapshot,
        loadPreset,
        resetProfile,
        exportData,
        importData,
        mergePartnerProfile,
        currency: profile.currency || "SGD",
        setCurrency,
        isReportModalOpen,
        setIsReportModalOpen,
        isGuideModalOpen,
        setIsGuideModalOpen,
        isInitialized,

        // Theme Mode
        themeMode,
        setThemeMode,
        toggleTheme,

        // Face-to-Face Privacy Shield
        isPrivacyMode,
        setIsPrivacyMode,
        togglePrivacyMode,
        formatMoney,

        // Local Backup
        lastBackupExportedAt,
        backupReminderSnoozedUntil,
        shouldShowBackupReminder,
        snoozeBackupReminder,
        dismissBackupReminder,

        // Sync exports
        syncConfig,
        isOnline,
        syncStatus,
        isSyncModalOpen,
        setIsSyncModalOpen,
        initialSyncIdParam,
        setInitialSyncIdParam,
        enableSync,
        joinSync,
        disconnectSync,
        triggerManualSync,

        // Stock Holdings & Dividend Snowball
        addStockHolding,
        updateStockHolding,
        removeStockHolding,
        syncStockHoldingsToFna,
      }}
    >
      {children}
    </FinancialStoreContext.Provider>
  );
}

export function useFinancialStore() {
  const context = useContext(FinancialStoreContext);
  if (!context) {
    throw new Error("useFinancialStore must be used within a FinancialStoreProvider");
  }
  return context;
}
