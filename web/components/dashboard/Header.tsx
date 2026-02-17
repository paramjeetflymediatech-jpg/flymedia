"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center gap-4 border-b border-white/10 bg-black/40 px-6 backdrop-blur-xl">
      <div className="flex-1">
        <div className="relative max-w-md hidden md:block">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input placeholder="Search projects, tasks..." className="pl-9 bg-white/5 border-white/10" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500 border border-black"></span>
        </button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold ring-2 ring-white/10">
            {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="hidden md:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
        </div>
      </div>
    </header>
  );
}
