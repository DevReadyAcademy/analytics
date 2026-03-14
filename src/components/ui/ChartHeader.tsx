"use client";

import { useState } from "react";
import InfoDrawer from "@/components/ui/InfoDrawer";

interface ChartHeaderProps {
  title: string;
  description?: string;
  infoContent?: React.ReactNode;
}

export default function ChartHeader({ title, description, infoContent }: ChartHeaderProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        {infoContent && (
          <button
            onClick={() => setInfoOpen(true)}
            className="shrink-0 ml-3 p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Learn more"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 8v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="9" cy="5.5" r="0.75" fill="currentColor" />
            </svg>
          </button>
        )}
      </div>

      {infoContent && (
        <InfoDrawer open={infoOpen} onClose={() => setInfoOpen(false)} title={title}>
          {infoContent}
        </InfoDrawer>
      )}
    </>
  );
}
