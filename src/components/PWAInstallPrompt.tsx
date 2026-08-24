"use client";

import React, { useState, useEffect } from "react";
import { Download, Smartphone, X, Share2, PlusSquare, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(true);
  const [showIOSTip, setShowIOSTip] = useState<boolean>(false);
  const [installedSuccessfully, setInstalledSuccessfully] = useState<boolean>(false);

  useEffect(() => {
    // 1. Register Service Worker for offline capability & check for updates
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Check for worker updates
          registration.update();
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  newWorker.postMessage({ type: "SKIP_WAITING" });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn("PWA Service Worker registration failed:", error);
        });
    }

    // 2. Check standalone mode (already installed)
    const isAppStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(isAppStandalone);
    if (isAppStandalone) return;

    // 3. Check dismissed flag in localStorage
    const dismissed = localStorage.getItem("fna_pwa_install_dismissed_v1");
    if (!dismissed) {
      setIsDismissed(false);
    }

    // 4. Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // 5. Capture beforeinstallprompt for Chromium / Android / Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsDismissed(false);
    };

    const handleAppInstalled = () => {
      setInstalledSuccessfully(true);
      setDeferredPrompt(null);
      setTimeout(() => {
        setIsDismissed(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstalledSuccessfully(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    } else if (isIOS) {
      setShowIOSTip((prev) => !prev);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem("fna_pwa_install_dismissed_v1", "true");
    } catch {
      // ignore
    }
  };

  // Don't render if standalone, dismissed, or unsupported
  if (isStandalone || isDismissed) {
    return null;
  }

  // Only show if prompt is captured or device is iOS
  if (!deferredPrompt && !isIOS && !installedSuccessfully) {
    return null;
  }

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-4 right-4 max-w-md mx-auto z-40 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="p-3.5 bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md text-white rounded-2xl border border-indigo-500/40 shadow-2xl space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 font-bold shadow-sm">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                Install FNA Pro for Offline Access
              </h4>
              <p className="text-[10px] text-slate-300">
                Launch instantly from your home screen with 100% offline support
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* iOS Step Guide Tooltip */}
        {showIOSTip && (
          <div className="p-2.5 bg-indigo-950/80 border border-indigo-500/30 rounded-xl text-[11px] text-indigo-200 space-y-1.5 animate-in fade-in">
            <div className="font-bold text-white flex items-center gap-1">
              <span>To install on iPhone/iPad:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[10px] text-indigo-100">
              <li className="flex items-center gap-1.5">
                1. Tap the <Share2 className="w-3 h-3 text-indigo-400 inline shrink-0" /> <strong>Share</strong> button in Safari's toolbar.
              </li>
              <li className="flex items-center gap-1.5">
                2. Scroll down and tap <PlusSquare className="w-3 h-3 text-indigo-400 inline shrink-0" /> <strong>Add to Home Screen</strong>.
              </li>
            </ol>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-2.5 py-1 text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
          >
            Not Now
          </button>

          {installedSuccessfully ? (
            <div className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-[11px] font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Installed!
            </div>
          ) : (
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isIOS ? "How to Install" : "Install App"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
