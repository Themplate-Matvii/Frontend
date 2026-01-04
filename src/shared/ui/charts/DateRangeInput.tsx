"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Flatpickr from "react-flatpickr";
import { Calendar as CalendarIcon } from "lucide-react";
import { Russian } from "flatpickr/dist/l10n/ru.js";
import type { Instance as FlatpickrInstance } from "flatpickr";

import "flatpickr/dist/flatpickr.min.css";
import "./dateRangeInput.css";

import { Theme, colors } from "@/shared/ui";
import { useTheme } from "@/shared/lib/theme";

export type DateRange = {
  from?: Date;
  to?: Date;
};

interface DateRangeInputProps {
  value?: DateRange;
  onChange: (range?: DateRange) => void;
  placeholder: string;
  className?: string;
  language?: string;
}

export function DateRangeInput({
  value,
  onChange,
  placeholder,
  className,
  language,
}: DateRangeInputProps) {
  const { theme } = useTheme();
  const tone = theme === Theme.DARK ? "dark" : "light";
  const localeCode = language ?? "en";
  const calendarRef = useRef<FlatpickrInstance | null>(null);

  const fpLocale = useMemo(() => {
    return localeCode.toLowerCase().startsWith("ru") ? Russian : undefined;
  }, [localeCode]);

  const fpValue = useMemo(() => {
    if (value?.from && value?.to) return [value.from, value.to];
    if (value?.from) return [value.from];
    return [];
  }, [value?.from, value?.to]);

  const inputStyle = useMemo(
    () => ({
      backgroundColor: colors.background[tone],
      borderColor: colors.border[tone],
      color: colors.text[tone],
    }),
    [tone],
  );

  const applyCalendarTone = useCallback(
    (instance?: FlatpickrInstance | null) => {
      if (!instance?.calendarContainer) return;

      instance.calendarContainer.classList.remove(
        "flatpickr-theme-light",
        "flatpickr-theme-dark",
      );
      instance.calendarContainer.classList.add(
        tone === "dark" ? "flatpickr-theme-dark" : "flatpickr-theme-light",
      );
    },
    [tone],
  );

  useEffect(() => {
    applyCalendarTone(calendarRef.current);
  }, [applyCalendarTone]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted z-10">
        <CalendarIcon size={18} />
      </span>

      <Flatpickr
        value={fpValue}
        options={{
          mode: "range",
          locale: fpLocale,
          dateFormat: "Y-m-d",
          disableMobile: true,
          closeOnSelect: false,
        }}
        onClose={(selectedDates: Date[], _dateStr: string, instance: FlatpickrInstance) => {
          if (selectedDates.length < 2) {
            instance.open();
          }
        }}
        onOpen={(_, __, instance: FlatpickrInstance) => {
          calendarRef.current = instance;
          applyCalendarTone(instance);
        }}
        onReady={(_, __, instance: FlatpickrInstance) => {
          calendarRef.current = instance;
          applyCalendarTone(instance);
        }}
        onChange={(selectedDates: Date[], _dateStr: string, instance: FlatpickrInstance) => {
          if (!selectedDates || selectedDates.length === 0) {
            onChange(undefined);
            return;
          }

          if (selectedDates.length === 1) {
            onChange({ from: selectedDates[0], to: undefined });
            instance.open();
            return;
          }

          const [from, to] = selectedDates;
          onChange({ from, to });
          instance.close();
        }}
        className="w-full rounded-lg border px-3 py-2 pl-10 text-left text-sm shadow-sm hover:border-primary transition focus:outline-none focus:ring-2 focus:ring-primary/30"
        placeholder={placeholder}
        style={inputStyle as any}
      />
    </div>
  );
}
