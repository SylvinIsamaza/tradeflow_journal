"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogout, useCurrentUser } from "@/lib/hooks";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAI: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenAI,
}) => {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const getRouteFromId = (id: string): string => {
    const routes: Record<string, string> = {
      dashboard: "/",
      analytic: "/analytics",
      "daily-journal": "/journal",
      trades: "/trades",
      reports: "/reports",
      notebook: "/notebook",
      playbooks: "/playbooks",
    };
    return routes[id] || "/";
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
    },
    {
      id: "analytic",
      label: "Analytic",
      icon: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      id: "daily-journal",
      label: "Daily Journal",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    { id: "trades", label: "Trades", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
    {
      id: "reports",
      label: "Reports",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2zm0 0v-5a2 2 0 012-2h2a2 2 0 012 2v5",
    },
    {
      id: "notebook",
      label: "Notebook",
      icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    },
    {
      id: "playbooks",
      label: "Playbooks",
      badge: "NEW",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  ];

  return (
    <aside className="w-[240px] bg-[#1a1f37] h-screen sticky top-0 flex flex-col z-50 select-none">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#5e5ce6] flex items-center justify-center">
            <span className="text-white font-black italic">T</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight uppercase">
            Trade<span className="text-slate-400 font-medium">Flow</span>
          </span>
        </div>
      </div>

      <div className="px-4 mb-6">
        <Link
          href="/add-trade"
          className="w-full bg-[#5e5ce6] text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#4d4acb] transition-all shadow-lg shadow-indigo-900/20 active:scale-95 block"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Trade
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={getRouteFromId(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all block ${
              activeTab === item.id
                ? "bg-[#2a304d] text-white shadow-sm"
                : "text-slate-400 hover:bg-[#2a304d]/50 hover:text-slate-200"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={item.icon}
              />
            </svg>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="bg-[#5e5ce6] text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                {item.badge}
              </span>
            )}
          </Link>
        ))}

        <div className="pt-4 pb-2 border-t border-slate-700/50 mt-4">
          <p className="px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">
            Power Tools
          </p>
          <button
            onClick={onOpenAI}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="flex-1 text-left">AI Companion</span>
            <span className="bg-indigo-500 text-white text-[8px] px-1 py-0.5 rounded font-black uppercase tracking-widest animate-pulse">
              Live
            </span>
          </button>
        </div>
      </nav>


      <div className="p-4 border-t border-slate-700/50 space-y-4">
        <Link
          href="/settings"
          className={`flex items-center gap-3 text-xs font-semibold transition-colors w-full px-3 py-2 rounded-xl block ${activeTab === "settings" ? "bg-[#2a304d] text-white" : "text-slate-400 hover:text-white"}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066"
            />
          </svg>
          Settings
        </Link>
        <Link
          href="/profile"
          className={`flex items-center gap-3 px-3 py-2 group rounded-xl transition-all block ${activeTab === "profile" ? "bg-[#2a304d]" : "hover:bg-[#2a304d]/30"}`}
        >
          <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden border-2 border-transparent group-hover:border-[#5e5ce6] transition-all">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" />
            ) : (
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="avatar"
              />
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p
              className={`text-[11px] font-bold truncate transition-colors ${activeTab === "profile" ? "text-white" : "text-slate-300"}`}
            >
              {user?.name || "Demo User"}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {user?.email || "demo@tradeflow.com"}
            </p>
          </div>
        </Link>
      </div>

      {/* Logout Button */}
      <div className="p-4 pt-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="flex-1 text-left">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
