"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CheckSquare,
  Settings,
  LogOut,
  Command,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Employees", href: "/dashboard/employees", icon: Users },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const filteredNavigation = navigation.filter((item) => {
    if (user?.role === "employee") {
      return item.name !== "Employees" && item.name !== "Settings";
    }
    if (user?.role === "client") {
      return (
        item.name === "Projects" ||
        item.name === "Settings" ||
        item.name === "Dashboard"
      );
    }
    return true;
  });

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-4 border-b border-gray-200 gap-2">
        <div className="w-6 h-6 rounded bg-gray-900 flex items-center justify-center text-white">
          <Command className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-gray-900">
          Flymedia
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-0.5 p-2 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-2 border-t border-gray-200">
        <div className="px-3 py-2">
          <div className="text-xs font-medium text-gray-500 mb-1">
            Signed in as
          </div>
          <div className="text-sm font-medium text-gray-900 truncate">
            {user?.name}
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
