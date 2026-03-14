"use client";

import { useEffect, useRef } from "react";

interface InfoDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function InfoDrawer({ open, onClose, title, children }: InfoDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [open, onClose]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/20 z-40 transition-opacity" />
      )}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-white shadow-2xl border-l border-gray-200 z-50 transform transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
        <div className="p-5 overflow-y-auto" style={{ height: "calc(100% - 65px)" }}>
          <div className="prose prose-sm prose-gray max-w-none text-sm text-gray-700 space-y-3">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
