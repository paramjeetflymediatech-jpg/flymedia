"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewTaskPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    priority: "medium",
    dueDate: "",
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
      const fetchData = async () => {
          try {
              const [projRes, empRes] = await Promise.all([
                  api.get('/projects'),
                  api.get('/employees')
              ]);
              if (projRes.data.success) setProjects(projRes.data.data);
              if (empRes.data.success) setEmployees(empRes.data.data);
          } catch (error) {
              console.error("Failed to fetch data", error);
          }
      };
      fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await api.post("/tasks", formData);
        router.push("/dashboard/tasks");
    } catch (error) {
        console.error("Failed to create task", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tasks">
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
            </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Create New Task</h1>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input name="title" placeholder="e.g. Design Homepage" required onChange={handleChange} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea 
                    name="description"
                    className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    placeholder="Task details..."
                    required
                    onChange={handleChange}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <select 
                        name="project" 
                        className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Project</option>
                        {projects.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assign To</Label>
                    <select 
                        name="assignedTo" 
                        className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        onChange={handleChange}
                    >
                        <option value="">Unassigned</option>
                        {employees.map(e => (
                            <option key={e._id} value={e._id}>{e.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select 
                        name="priority" 
                        className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        onChange={handleChange}
                        value={formData.priority}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input name="dueDate" type="date" onChange={handleChange} />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Link href="/dashboard/tasks">
                    <Button type="button" variant="ghost">Cancel</Button>
                </Link>
                <Button type="submit">Create Task</Button>
            </div>
        </form>
      </div>
    </div>
  );
}
