"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ArrowLeft, UploadCloud } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    client: "",
    startDate: "",
    endDate: "",
    status: "planned",
  });
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (files) {
        Array.from(files).forEach((file) => {
          data.append("files", file);
        });
      }

      // We need to make sure api client handles multipart/form-data correctly
      // Axios usually detects FormData and sets header automatically, but let's be safe
      await api.post("/projects", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Create New Project
        </h1>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  name="name"
                  placeholder="e.g. Website Redesign"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client Name</Label>
                <Input
                  name="client"
                  placeholder="e.g. Acme Corp"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                name="description"
                className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                placeholder="Project details..."
                required
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input name="startDate" type="date" onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input name="endDate" type="date" onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                name="status"
                className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                onChange={handleChange}
                value={formData.status}
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="files">Attachments</Label>
              <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
                <Input
                  type="file"
                  multiple
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  onChange={handleFileChange}
                />
                <UploadCloud className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  {files && files.length > 0
                    ? `${files.length} files selected`
                    : "Drag files here or click to upload"}
                </p>
              </div>
              {files && files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">
                    Selected Files:
                  </p>
                  <ul className="space-y-1">
                    {Array.from(files).map((file, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-400 flex items-center gap-2"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Link href="/dashboard/projects">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
