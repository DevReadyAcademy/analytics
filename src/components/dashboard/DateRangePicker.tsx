"use client";

import { format, subDays } from "date-fns";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onRangeChange: (startDate: string, endDate: string) => void;
}

const presets = [
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
  const handlePreset = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);
    onRangeChange(
      format(start, "yyyy-MM-dd"),
      format(end, "yyyy-MM-dd")
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {presets.map((preset) => {
        const end = new Date();
        const start = subDays(end, preset.days);
        const isActive =
          startDate === format(start, "yyyy-MM-dd") &&
          endDate === format(end, "yyyy-MM-dd");

        return (
          <button
            key={preset.days}
            onClick={() => handlePreset(preset.days)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {preset.label}
          </button>
        );
      })}
      <div className="flex items-center gap-2 ml-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onRangeChange(e.target.value, endDate)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
        />
        <span className="text-gray-400">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onRangeChange(startDate, e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
        />
      </div>
    </div>
  );
}
