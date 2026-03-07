"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useRouter } from "next/navigation";
import { Building, Send, FileUp } from "lucide-react";

export default function RequestProjectPage() {
    const router = useRouter();
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        tenant: "",
    });
    const [files, setFiles] = useState(null);

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const res = await api.get("/tenants");
            if (res.data.success) {
                setTenants(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch organizations", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("description", formData.description);
            data.append("tenant", formData.tenant);

            if (files) {
                Array.from(files).forEach((file) => {
                    data.append("files", file);
                });
            }

            await api.post("/projects", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            router.push("/dashboard/projects");
        } catch (error) {
            console.error("Failed to submit project request", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Request New Project</h1>
                <p className="text-gray-500 mt-2">
                    Tell us about your project and choose an organization to work with.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                        id="name"
                        placeholder="e.g. Website Redesign"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tenant">Target Organization</Label>
                    <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                        <select
                            id="tenant"
                            className="w-full pl-10 h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.tenant}
                            onChange={(e) => setFormData({ ...formData, tenant: e.target.value })}
                            required
                        >
                            <option value="">Select Organization</option>
                            {tenants.map((t) => (
                                <option key={t._id} value={t._id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Outline the goals, requirements, and timeline..."
                        rows={5}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="files">Reference Files / Documents</Label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <FileUp className="w-8 h-8 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-400">PDF, image, or ZIP (max 10MB)</p>
                            </div>
                            <input
                                id="files"
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => setFiles(e.target.files)}
                            />
                        </label>
                    </div>
                    {files && (
                        <p className="text-xs text-blue-600 mt-2 font-medium">
                            {files.length} file(s) selected
                        </p>
                    )}
                </div>

                <div className="pt-4">
                    <Button type="submit" className="w-full gap-2" disabled={loading}>
                        <Send className="h-4 w-4" />
                        {loading ? "Submitting..." : "Send Request"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
