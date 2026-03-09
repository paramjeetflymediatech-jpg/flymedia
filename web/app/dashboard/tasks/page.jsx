"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Plus, CheckSquare, Calendar, User, Search } from "lucide-react";
import Link from "next/link";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const fetchTasks = async (query = "") => {
    try {
      setLoading(true);
      const endpoint = query ? `/tasks/search?q=${encodeURIComponent(query)}` : "/tasks";
      const res = await api.get(endpoint);
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-gray-400">Track and manage project tasks.</p>
        </div>
        <Link href="/dashboard/tasks/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks by title, description, priority or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5">
          <CheckSquare className="h-10 w-10 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">No tasks found</h3>
          <p className="text-gray-400">Create tasks to track your work.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 h-4 w-4 rounded border flex items-center justify-center ${
                    task.status === "done"
                      ? "bg-green-500 border-green-500"
                      : "border-gray-500"
                  }`}
                >
                  {task.status === "done" && (
                    <CheckSquare className="h-3 w-3 text-white" />
                  )}
                </div>
                <div>
                  <h3
                    className={`font-semibold text-lg ${task.status === "done" ? "line-through text-gray-500" : ""}`}
                  >
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {task.project?.name || "No Project"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs border ${
                      task.priority === "high"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : task.priority === "medium"
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "No Date"}
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Assigned
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
