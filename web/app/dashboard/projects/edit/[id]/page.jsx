"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useRouter, useParams } from "next/navigation";
import { Building, Send, FileUp, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditProjectPage() {
    const router = useRouter();
    const { id } = useParams();
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        tenant: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectRes, tenantsRes] = await Promise.all([
                    api.get(`/projects/${id}`),
                    api.get("/tenants")
                ]);

                if (projectRes.data.success) {
                    const project = projectRes.data.data;
                    setFormData({
                        name: project.name,
                        description: project.description,
                        tenant: project.tenant?._id || project.tenant,
                    });
                }
                
                if (tenantsRes.data.success) {
                    setTenants(tenantsRes.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
                router.push("/dashboard/projects");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put(`/projects/${id}`, {
                name: formData.name,
                description: formData.description,
            });

            router.push("/dashboard/projects");
        } catch (error) {
            console.error("Failed to update project", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/projects">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Projects
                    </Button>
                </Link>
            </div>
            
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Project Request</h1>
                <p className="text-gray-500 mt-2">
                    Update the details of your project request.
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

                <div className="space-y-2 opacity-60">
                    <Label htmlFor="tenant">Organization (Cannot be changed)</Label>
                    <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                        <select
                            id="tenant"
                            disabled
                            className="w-full pl-10 h-10 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm cursor-not-allowed"
                            value={formData.tenant}
                        >
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

                <div className="pt-4">
                    <Button type="submit" className="w-full gap-2" disabled={saving}>
                        <Send className="h-4 w-4" />
                        {saving ? "Updating..." : "Update Request"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
