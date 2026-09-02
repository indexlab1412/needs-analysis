"use client";

import React, { useState, useEffect } from "react";
import { useFinancialStore } from "@/context/financial-store";

export interface NumericInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number | undefined | null;
  onChange: (val: number) => void;
  allowDecimals?: boolean;
  skipMask?: boolean;
}

/**
 * High-reliability numeric input that smoothly handles:
 * 1. Typing '0.' or '.5' without stripping decimal points
 * 2. Backspacing all the way to empty without snapping back to 0 or initial values
 * 3. Fast mobile touch keyboard support with inputMode="decimal"
 * 4. Face-to-Face Privacy Shield: automatically masks sensitive input when privacy mode is active unless focused or skipped
 */
export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  allowDecimals = true,
  skipMask = false,
  className = "",
  placeholder = "0",
  ...props
}) => {
  const { isPrivacyMode } = useFinancialStore();
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const shouldMask = Boolean(isPrivacyMode && !skipMask);

  const [localStr, setLocalStr] = useState<string>(() => {
    if (value === undefined || value === null || value === 0) return "";
    return String(value);
  });

  useEffect(() => {
    if (value === undefined || value === null || value === 0) {
      if (localStr !== "" && localStr !== "0" && localStr !== "0." && !localStr.startsWith("0.0")) {
        setLocalStr("");
      }
    } else {
      const currentParsed = Number(localStr);
      if (isNaN(currentParsed) || currentParsed !== value) {
        setLocalStr(String(value));
      }
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Handle empty
    if (raw === "") {
      setLocalStr("");
      onChange(0);
      return;
    }

    // Filter characters
    if (allowDecimals) {
      if (!/^\d*\.?\d*$/.test(raw)) return;
    } else {
      if (!/^\d*$/.test(raw)) return;
    }

    setLocalStr(raw);

    if (raw === "." || raw.endsWith(".")) {
      const parsed = parseFloat(raw);
      onChange(isNaN(parsed) ? 0 : parsed);
      return;
    }

    const num = Number(raw);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (localStr === "." || localStr === "") {
      setLocalStr("");
      onChange(0);
    } else if (localStr.endsWith(".")) {
      const clean = localStr.slice(0, -1);
      setLocalStr(clean);
      onChange(Number(clean) || 0);
    }
    if (props.onBlur) props.onBlur(e);
  };

  const isMaskActive = shouldMask && !isFocused && localStr !== "";

  return (
    <input
      type={isMaskActive ? "password" : "text"}
      inputMode={allowDecimals ? "decimal" : "numeric"}
      value={localStr}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={shouldMask ? "••••" : placeholder}
      className={`${className} ${isMaskActive ? "tracking-widest select-none" : ""}`}
      {...props}
    />
  );
};
