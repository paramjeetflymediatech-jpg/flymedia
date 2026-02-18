"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus, Folder, Calendar, MoreVertical } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-gray-400">
            Manage your ongoing and completed projects.
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-300 rounded-xl bg-gray-50">
          <Folder className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No projects found
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by creating your first project.
          </p>
          <Link href="/dashboard/projects/new">
            <Button variant="outline">Create Project</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project._id}
              className="group relative rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-all hover:border-gray-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Folder className="h-5 w-5" />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <h3 className="font-semibold text-lg mb-1 text-gray-900">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{project.client}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(project.startDate).toLocaleDateString()}
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full border ${
                    project.status === "completed"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : project.status === "in-progress"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-6 w-6 rounded-full bg-gray-100 border border-white ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-gray-600"
                    >
                      U
                    </div>
                  ))}
                </div>
                <Link
                  href={`/dashboard/projects/${project._id}`}
                  className="text-xs font-medium text-blue-600 hover:text-blue-500"
                >
                  View Details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
