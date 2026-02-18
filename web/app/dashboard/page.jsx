"use client";

import { useAuth } from "@/context/AuthContext";
// import { Card } from "@/components/ui/Card"; // Need to create optional Card wrapper or use div
import { Clock, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Welcome back,</span>
          <span className="font-medium text-blue-600">{user?.name}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value="12"
          change="+2.5%"
          icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
        />
        <StatCard
          title="Tasks In Progress"
          value="34"
          change="+12%"
          icon={<Clock className="h-4 w-4 text-yellow-600" />}
        />
        <StatCard
          title="Completed Tasks"
          value="128"
          change="+4%"
          icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
        />
        <StatCard
          title="Overdue Tasks"
          value="3"
          change="-2%"
          isNegative
          icon={<AlertCircle className="h-4 w-4 text-red-600" />}
        />
      </div>

      {/* Recent Activity / Projects */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-lg text-gray-900">
            Recent Projects
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    P{i}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Website Redesign
                    </p>
                    <p className="text-xs text-gray-500">Client: Tech Corp</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  In Progress
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-lg text-gray-900">My Tasks</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
              >
                <div className="mt-1 h-2 w-2 rounded-full bg-yellow-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    Implement authentication flow
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Due Today</p>
                </div>
                <button className="h-6 w-6 rounded-full border border-gray-300 hover:bg-white flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-gray-400 hover:text-green-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon, isNegative }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {icon}
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <p
          className={`text-xs ${isNegative ? "text-red-600" : "text-green-600"}`}
        >
          {change} from last month
        </p>
      </div>
    </div>
  );
}
