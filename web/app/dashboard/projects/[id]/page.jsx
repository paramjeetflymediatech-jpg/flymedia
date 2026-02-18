"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { TaskDetailModal } from "@/components/board/TaskDetailModal";
import { Button } from "@/components/ui/Button";
import { Plus, ChevronRight, LayoutGrid, List } from "lucide-react";
import Link from "next/link";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project=${id}`),
      ]);

      if (projRes.data.success) {
        setProject(projRes.data.data);
      }
      if (tasksRes.data.success) {
        setTasks(tasksRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch project data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (taskId, newStatus) => {
    const updatedTasks = tasks.map((t) =>
      t._id === taskId ? { ...t, status: newStatus } : t,
    );
    setTasks(updatedTasks);

    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
    } catch (error) {
      console.error("Failed to update task status", error);
      fetchProjectData();
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)),
    );
    setSelectedTask(updatedTask);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Project Not Found
        </h2>
        <Link href="/dashboard/projects">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <header className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard/projects" className="hover:text-gray-900">
            Projects
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-medium">{project.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {project.name}
            </h1>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${
                project.status === "active"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : project.status === "completed"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-gray-100 text-gray-700 border-gray-200"
              }`}
            >
              {project.status}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-200 rounded-md p-0.5 bg-gray-50">
              <button className="p-1.5 rounded text-gray-900 bg-white shadow-sm border border-gray-200">
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded text-gray-400 hover:text-gray-700">
                <List className="h-4 w-4" />
              </button>
            </div>
            <Link href={`/dashboard/tasks/new?project=${id}`}>
              <Button className="h-8 text-xs bg-gray-900 text-white hover:bg-gray-800 shadow-sm">
                New Task
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Project Files Section */}
      {project.files && project.files.length > 0 && (
        <div className="px-6 py-2 bg-gray-50 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Project Assets
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.files.map((file, idx) => (
              <a
                key={idx}
                href={`http://localhost:5000${file.url}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <span className="truncate max-w-[150px]">{file.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden p-6">
        <KanbanBoard
          tasks={tasks}
          onDragEnd={handleDragEnd}
          onTaskClick={handleTaskClick}
        />
      </div>

      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleTaskUpdate}
      />
    </div>
  );
}
