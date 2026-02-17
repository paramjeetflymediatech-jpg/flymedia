"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus, Folder, Calendar, MoreVertical } from "lucide-react";

interface Project {
    _id: string;
    name: string;
    client: string;
    status: string;
    startDate: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
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
            <p className="text-gray-400">Manage your ongoing and completed projects.</p>
        </div>
        <Link href="/dashboard/projects/new">
            <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Project
            </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5">
            <Folder className="h-10 w-10 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white">No projects found</h3>
            <p className="text-gray-400 mb-6">Get started by creating your first project.</p>
            <Link href="/dashboard/projects/new">
                <Button variant="outline">Create Project</Button>
            </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
                <div key={project._id} className="group relative rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all hover:border-white/20">
                    <div className="flex items-start justify-between mb-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Folder className="h-5 w-5" />
                        </div>
                        <button className="text-gray-500 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                        </button>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">{project.client}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(project.startDate).toLocaleDateString()}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full border ${
                            project.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            project.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                            {project.status}
                        </span>
                    </div>

                    <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                         <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-6 w-6 rounded-full bg-gray-700 border border-black ring-2 ring-black flex items-center justify-center text-[10px] font-bold">
                                    U
                                </div>
                            ))}
                         </div>
                         <Link href={`/dashboard/projects/${project._id}`} className="text-xs font-medium text-blue-400 hover:text-blue-300">
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
