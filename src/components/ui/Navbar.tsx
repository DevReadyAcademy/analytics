"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Meta Ads" },
  { href: "/analytics", label: "Analytics" },
  { href: "/search-console", label: "Search Console" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
              <span className="text-sm text-gray-400">devready.gr</span>
            </div>
            <div className="flex items-center gap-1">
              {links.map(({ href, label }) => {
                const isActive =
                  href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(href);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
