"use client";

import { useRef } from "react";
import { format, subDays } from "date-fns";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onRangeChange: (startDate: string, endDate: string) => void;
}

const presets = [
  { label: "Today", days: 0 },
  { label: "Yesterday", days: 1, fixed: true },
  { label: "Last 7 days", days: 7 },
  { label: "Last 14 days", days: 14 },
  { label: "Last 28 days", days: 28 },
  { label: "Last 90 days", days: 90 },
];

export default function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
}: DateRangePickerProps) {
  const endDateRef = useRef<HTMLInputElement>(null);

  const handlePreset = (days: number, fixed?: boolean) => {
    if (fixed) {
      // "Yesterday" = single day
      const day = subDays(new Date(), days);
      const formatted = format(day, "yyyy-MM-dd");
      onRangeChange(formatted, formatted);
    } else {
      const end = new Date();
      const start = subDays(end, days);
      onRangeChange(format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd"));
    }
  };

  const isPresetActive = (days: number, fixed?: boolean) => {
    const today = format(new Date(), "yyyy-MM-dd");
    if (fixed) {
      const day = format(subDays(new Date(), days), "yyyy-MM-dd");
      return startDate === day && endDate === day;
    }
    const start = format(subDays(new Date(), days), "yyyy-MM-dd");
    return startDate === start && endDate === today;
  };

  const handleStartDateChange = (value: string) => {
    onRangeChange(value, endDate);
    // Auto-focus end date input after picking start date
    setTimeout(() => {
      endDateRef.current?.showPicker?.();
    }, 100);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((preset) => (
        <button
          key={preset.label}
          onClick={() => handlePreset(preset.days, preset.fixed)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isPresetActive(preset.days, preset.fixed)
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {preset.label}
        </button>
      ))}
      <div className="flex items-center gap-2 ml-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          max={endDate}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
        />
        <span className="text-gray-400">to</span>
        <input
          ref={endDateRef}
          type="date"
          value={endDate}
          onChange={(e) => onRangeChange(startDate, e.target.value)}
          min={startDate}
          max={format(new Date(), "yyyy-MM-dd")}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
        />
      </div>
    </div>
  );
}
