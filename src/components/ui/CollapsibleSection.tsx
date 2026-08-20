"use client";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export type AccentColor = "indigo" | "emerald" | "blue" | "amber" | "purple" | "rose";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  collapsedSummary?: React.ReactNode;
  defaultOpen?: boolean;
  isOpenControlled?: boolean;
  onToggleControlled?: (open: boolean) => void;
  variant?: "plain" | "card";
  accentColor?: AccentColor;
  children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  icon,
  badge,
  collapsedSummary,
  defaultOpen = true,
  isOpenControlled,
  onToggleControlled,
  variant = "plain",
  accentColor = "indigo",
  children,
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isOpenControlled !== undefined ? isOpenControlled : internalOpen;

  const handleToggle = () => {
    if (onToggleControlled) {
      onToggleControlled(!isOpen);
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  const getAccentStyles = (accent: AccentColor) => {
    switch (accent) {
      case "emerald":
        return {
          borderLeft: "border-l-4 border-l-emerald-500",
          activeContainer: "bg-white dark:bg-slate-900 border-2 border-emerald-500/40 dark:border-emerald-500/50 shadow-md shadow-emerald-500/5 ring-4 ring-emerald-500/10",
          headerActive: "bg-emerald-50/50 dark:bg-emerald-950/20",
          chevronActive: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
        };
      case "blue":
        return {
          borderLeft: "border-l-4 border-l-blue-500",
          activeContainer: "bg-white dark:bg-slate-900 border-2 border-blue-500/40 dark:border-blue-500/50 shadow-md shadow-blue-500/5 ring-4 ring-blue-500/10",
          headerActive: "bg-blue-50/50 dark:bg-blue-950/20",
          chevronActive: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
        };
      case "amber":
        return {
          borderLeft: "border-l-4 border-l-amber-500",
          activeContainer: "bg-white dark:bg-slate-900 border-2 border-amber-500/40 dark:border-amber-500/50 shadow-md shadow-amber-500/5 ring-4 ring-amber-500/10",
          headerActive: "bg-amber-50/50 dark:bg-amber-950/20",
          chevronActive: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
        };
      case "purple":
        return {
          borderLeft: "border-l-4 border-l-purple-500",
          activeContainer: "bg-white dark:bg-slate-900 border-2 border-purple-500/40 dark:border-purple-500/50 shadow-md shadow-purple-500/5 ring-4 ring-purple-500/10",
          headerActive: "bg-purple-50/50 dark:bg-purple-950/20",
          chevronActive: "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300",
        };
      case "rose":
        return {
          borderLeft: "border-l-4 border-l-rose-500",
          activeContainer: "bg-white dark:bg-slate-900 border-2 border-rose-500/40 dark:border-rose-500/50 shadow-md shadow-rose-500/5 ring-4 ring-rose-500/10",
          headerActive: "bg-rose-50/50 dark:bg-rose-950/20",
          chevronActive: "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
        };
      case "indigo":
      default:
        return {
          borderLeft: "border-l-4 border-l-indigo-600",
          activeContainer: "bg-white dark:bg-slate-900 border-2 border-indigo-500/40 dark:border-indigo-500/50 shadow-md shadow-indigo-500/5 ring-4 ring-indigo-500/10",
          headerActive: "bg-indigo-50/50 dark:bg-indigo-950/20",
          chevronActive: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300",
        };
    }
  };

  const acc = getAccentStyles(accentColor);

  if (variant === "card") {
    return (
      <div
        className={`fin-card rounded-2xl overflow-hidden transition-all duration-200 ${acc.borderLeft} ${
          isOpen
            ? acc.activeContainer
            : "bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-none"
        }`}
      >
        <div
          onClick={handleToggle}
          className={`w-full p-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none ${
            isOpen ? acc.headerActive : "hover:bg-slate-200/50 dark:hover:bg-slate-750/50"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {icon && <div className="shrink-0">{icon}</div>}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {title}
                </h4>
                {badge}
              </div>
              {subtitle && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {!isOpen && collapsedSummary && (
              <div className="hidden sm:flex items-center text-xs text-slate-600 dark:text-slate-300 font-semibold bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                {collapsedSummary}
              </div>
            )}
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                isOpen
                  ? acc.chevronActive
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
              }`}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isOpen ? "rotate-0" : "-rotate-90"
                }`}
              />
            </div>
          </div>
        </div>

        {!isOpen && collapsedSummary && (
          <div className="sm:hidden px-4 pb-3 pt-0 border-t border-slate-200/60 dark:border-slate-700/40">
            <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold pt-1">
              {collapsedSummary}
            </div>
          </div>
        )}

        {isOpen && (
          <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-150">
            {children}
          </div>
        )}
      </div>
    );
  }

  // Plain variant
  return (
    <div className="space-y-2">
      <div className="w-full flex items-center justify-between px-1 py-1 gap-2">
        <div
          onClick={handleToggle}
          className="flex items-center gap-1.5 text-left group flex-1 cursor-pointer select-none"
        >
          {icon}
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] text-slate-400 font-normal truncate">{subtitle}</p>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200 ${
              isOpen ? "rotate-0" : "-rotate-90"
            }`}
          />
        </div>
        {badge && <div className="shrink-0 flex items-center">{badge}</div>}
      </div>
      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};
