"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  User,
  CheckSquare,
  Settings,
  Send,
  LogOut,
  Command,
  Building,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["superadmin","admin", "client", "employee","manager"],
  },
  {
    name: "Projects",
    href: "/dashboard/projects",
    icon: FolderKanban,
    roles: ["superadmin","admin", "client", "employee","manager"],
  },
  {
    name: "Request Project",
    href: "/dashboard/projects/request",
    icon: Send,
    roles: ["client"],
  },
  {
    name: "Employees",
    href: "/dashboard/employees",
    icon: Users,
    roles: ["superadmin","admin"],
  },
  {
    name: "Tenants",
    href: "/dashboard/tenants",
    icon: Building,
    roles: ["superadmin","admin"],
  },
  {
    name: "Tasks",
    href: "/dashboard/tasks",
    icon: CheckSquare,
    roles: ["superadmin","admin", "employee","manager"],
  },
  {
    name: "Messages",
    href: "/dashboard/messages",
    icon: Send, // Using Send for now as I don't see MessageSquare imported, will check imports
    roles: ["superadmin", "manager", "client", "employee"],
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
    roles: ["superadmin", "admin", "client", "employee", "manager"],
  },
];

export function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full w-64">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Component */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* Logo & Close Button */}
        <div className="flex h-16 items-center px-4 border-b border-gray-200 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gray-900 flex items-center justify-center text-white">
              <Command className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-gray-900">
              Flymedia
            </span>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-500 hover:text-gray-900 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col gap-0.5 p-2 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 768) onClose();
                }}
                className={clsx(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* User + Logout */}
        <div className="p-2 border-t border-gray-200">
          <div className="px-3 py-2">
            <div className="text-xs font-medium text-gray-500 mb-1">
              Signed in as
            </div>
            <div className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </div>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}