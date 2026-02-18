"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6">
      <div className="flex-1">
        <div className="relative max-w-md hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects, tasks..."
            className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-gray-200"
          />
        </div>
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
