import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "SGD", decimals: number = 0): string {
  const symbolMap: { [key: string]: string } = {
    SGD: "S$",
    USD: "$",
    MYR: "RM",
    AUD: "A$",
    EUR: "€",
    GBP: "£",
    HKD: "HK$",
    JPY: "¥",
  };

  const symbol = symbolMap[currency] || `${currency} `;
  return `${symbol}${Math.round(amount).toLocaleString()}`;
}

export function formatNumber(amount: number): string {
  return Math.round(amount).toLocaleString();
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function generateId(prefix: string = "id"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

export function parseNumberInput(val: string): number {
  if (val === "" || val === undefined || val === null) return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
}
