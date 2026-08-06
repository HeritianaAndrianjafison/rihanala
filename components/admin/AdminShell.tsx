"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

interface AdminShellProps {
  children: React.ReactNode;
  userName: string;
}

export default function AdminShell({ children, userName }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F4F5F7]">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
          {/* Hamburger mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-800 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Spacer desktop */}
          <div className="hidden lg:block" />

          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-semibold text-sm">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-slate-600 hidden sm:block">{userName}</span>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
