"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import Link from "next/link";
// import { Card } from "@/components/ui/Card"; // Need to create optional Card wrapper or use div
import { Clock, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard");
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500 text-sm animate-pulse">
          Loading dashboard...
        </div>
      </div>
    );
  }

  const counts = stats?.counts || {
    totalProjects: 0,
    tasks: { inProgress: 0, done: 0, overdue: 0 },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Welcome back,</span>
          <span className="font-semibold text-blue-600">{user?.name}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={counts.totalProjects}
          icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
        />
        <StatCard
          title="Tasks In Progress"
          value={counts.tasks.inProgress}
          icon={<Clock className="h-4 w-4 text-yellow-600" />}
        />
        <StatCard
          title="Completed Tasks"
          value={counts.tasks.done}
          icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
        />
        <StatCard
          title="Overdue Tasks"
          value={counts.tasks.overdue}
          isNegative={counts.tasks.overdue > 0}
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
            {stats?.recentProjects?.length > 0 ? (
              stats.recentProjects.map((project) => (
                <Link
                  key={project._id}
                  href={`/dashboard/projects/${project._id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                      {project.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {project.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Client: {project.client?.name || "Multiple"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border capitalize ${project.status === "active" ||
                      project.status === "in-progress"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : project.status === "completed"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                  >
                    {project.status}
                  </span>
                </Link>
              ))
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">
                No projects found.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-lg text-gray-900">Recent Tasks</h3>
          <div className="space-y-4">
            {stats?.recentTasks?.length > 0 ? (
              stats.recentTasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group border border-transparent hover:border-gray-200"
                >
                  <div
                    className={`mt-1 h-2 w-2 rounded-full ${task.priority === "high"
                      ? "bg-red-500"
                      : task.priority === "medium"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                      }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Project: {task.project?.name}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">
                No active tasks found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, isNegative }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {icon}
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
}
