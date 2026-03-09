"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/Input";

export function Header({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 md:px-6">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-900 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
        </button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 flex items-center justify-center text-xs font-bold text-gray-700 ring-2 ring-white">
          {user?.name?.charAt(0) || "U"}
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
      </div>
    </header>
  );
}
