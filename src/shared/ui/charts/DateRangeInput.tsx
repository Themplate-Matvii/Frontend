"use client";

import { useMemo } from "react";
import {
  Button as AriaButton,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  DateInput,
  DateRangePicker,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Popover,
  RangeCalendar,
} from "react-aria-components";
import { I18nProvider } from "react-aria";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { getLocalTimeZone, toCalendarDate, fromDate } from "@internationalized/date";

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
  const localeCode = language ?? "en-US";
  const timeZone = getLocalTimeZone();

  const rangeValue = useMemo(() => {
    const start = value?.from
      ? toCalendarDate(fromDate(value.from, timeZone))
      : null;
    const end = value?.to
      ? toCalendarDate(fromDate(value.to, timeZone))
      : null;
    if (!start && !end) return null;
    return { start: start ?? null, end: end ?? null };
  }, [timeZone, value?.from, value?.to]);

  return (
    <I18nProvider locale={localeCode}>
      <DateRangePicker
        value={rangeValue ?? undefined}
        onChange={(range) => {
          if (!range?.start && !range?.end) {
            onChange(undefined);
            return;
          }
          onChange({
            from: range?.start ? range.start.toDate(timeZone) : undefined,
            to: range?.end ? range.end.toDate(timeZone) : undefined,
          });
        }}
        shouldCloseOnSelect={false}
        className={className}
        aria-label={placeholder}
      >
        <div className="relative">
          <Group className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm transition hover:border-primary focus-within:ring-2 focus-within:ring-primary/30">
            <span className="text-muted">
              <CalendarIcon size={18} />
            </span>
            <DateInput
              slot="start"
              className="flex flex-1 items-center gap-1 text-text"
            >
              {(segment) => (
                <DateSegment
                  segment={segment}
                  className="rounded px-0.5 data-[placeholder]:text-muted data-[focused]:bg-primary/10 data-[invalid]:text-danger"
                />
              )}
            </DateInput>
            <span className="text-muted">–</span>
            <DateInput
              slot="end"
              className="flex flex-1 items-center gap-1 text-text"
            >
              {(segment) => (
                <DateSegment
                  segment={segment}
                  className="rounded px-0.5 data-[placeholder]:text-muted data-[focused]:bg-primary/10 data-[invalid]:text-danger"
                />
              )}
            </DateInput>
            <AriaButton className="rounded-md p-1 text-muted transition hover:bg-primary/10 hover:text-text">
              <span className="sr-only">{placeholder}</span>
              <CalendarIcon size={16} />
            </AriaButton>
          </Group>
        </div>

        <Popover
          placement="bottom start"
          className="z-50 mt-2 rounded-xl border border-border bg-background p-3 shadow-lg"
        >
          <Dialog className="outline-none">
            <RangeCalendar className="w-full">
              <header className="mb-2 flex items-center justify-between">
                <AriaButton
                  slot="previous"
                  className="rounded-md p-1 text-muted transition hover:bg-primary/10 hover:text-text"
                >
                  <ChevronLeft size={16} />
                </AriaButton>
                <Heading className="text-sm font-semibold text-text" />
                <AriaButton
                  slot="next"
                  className="rounded-md p-1 text-muted transition hover:bg-primary/10 hover:text-text"
                >
                  <ChevronRight size={16} />
                </AriaButton>
              </header>
              <CalendarGrid className="w-full">
                <CalendarGridHeader>
                  {(day) => (
                    <CalendarHeaderCell className="pb-1 text-xs font-medium text-muted">
                      {day}
                    </CalendarHeaderCell>
                  )}
                </CalendarGridHeader>
                <CalendarGridBody>
                  {(date) => (
                    <CalendarCell
                      date={date}
                      className="mx-auto flex h-9 w-9 items-center justify-center rounded-md text-sm transition data-[outside-visible-range]:text-muted/50 data-[disabled]:text-muted/40 data-[hovered]:bg-primary/10 data-[selected]:bg-primary/15 data-[selected]:text-text data-[selection-start]:bg-primary data-[selection-start]:text-onPrimary data-[selection-end]:bg-primary data-[selection-end]:text-onPrimary"
                    />
                  )}
                </CalendarGridBody>
              </CalendarGrid>
            </RangeCalendar>
          </Dialog>
        </Popover>
      </DateRangePicker>
    </I18nProvider>
  );
}
