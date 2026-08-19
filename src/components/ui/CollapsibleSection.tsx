"use client";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

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

  if (variant === "card") {
    return (
      <div className="fin-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all">
        <button
          type="button"
          onClick={handleToggle}
          className="w-full p-3.5 flex items-center justify-between gap-2 text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && <div className="shrink-0">{icon}</div>}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
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

          <div className="flex items-center gap-2 shrink-0">
            {!isOpen && collapsedSummary && (
              <div className="hidden sm:flex items-center text-xs text-slate-500 dark:text-slate-400">
                {collapsedSummary}
              </div>
            )}
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isOpen ? "rotate-0" : "-rotate-90"
                }`}
              />
            </div>
          </div>
        </button>

        {!isOpen && collapsedSummary && (
          <div className="sm:hidden px-3.5 pb-3 pt-0 border-t border-slate-100 dark:border-slate-800/60">
            {collapsedSummary}
          </div>
        )}

        {isOpen && (
          <div className="p-3.5 pt-1 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-150">
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
        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center gap-1.5 text-left group flex-1 cursor-pointer focus:outline-none"
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
        </button>
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
