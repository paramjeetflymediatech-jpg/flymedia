"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
    Building,
    Globe,
    Calendar,
    ChevronRight,
    Folder,
    ArrowLeft,
    Users,
    LayoutGrid
} from "lucide-react";

export default function TenantDetailPage() {
    const { id } = useParams();
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTenantData();
    }, [id]);

    const fetchTenantData = async () => {
        try {
            const res = await api.get(`/tenants/${id}`);
            if (res.data.success) {
                setTenant(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch tenant data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-20 text-gray-500">
                Loading tenant details...
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-20 gap-4 text-center">
                <h2 className="text-xl font-semibold text-gray-900">Tenant Not Found</h2>
                <Link href="/dashboard/tenants">
                    <Button variant="outline">Back to Tenants</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/dashboard/tenants" className="hover:text-gray-900">Tenants</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gray-900 font-medium">{tenant.name}</span>
            </div>

            {/* Header Section */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-inner">
                        <Building className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{tenant.name}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <Globe className="h-4 w-4" />
                                {tenant.domain ? (
                                    <a
                                        href={tenant.domain.startsWith("http") ? tenant.domain : `https://${tenant.domain}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:text-blue-500 hover:underline transition-all"
                                    >
                                        {tenant.domain}
                                    </a>
                                ) : "No domain"}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                Joined on {new Date(tenant.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        Edit Organization
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors">
                    <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <LayoutGrid className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{tenant.projects?.length || 0}</div>
                        <div className="text-sm text-gray-500 font-medium">Total Projects</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:border-green-200 transition-colors">
                    <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">--</div>
                        <div className="text-sm text-gray-500 font-medium">Total Users</div>
                    </div>
                </div>
            </div>

            {/* Projects Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <Folder className="h-5 w-5 text-gray-400" />
                        Linked Projects
                    </h2>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    {tenant.projects?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-4">Project Name</th>
                                        <th className="px-6 py-4">Client</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Start Date</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {tenant.projects.map((project) => (
                                        <tr key={project._id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-900">{project.name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {project.client?.name || "Self"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${project.status === "completed" ? "bg-green-50 text-green-700 border-green-200" :
                                                    project.status === "in-progress" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                        project.status === "requested" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                                            "bg-gray-100 text-gray-700 border-gray-200"
                                                    }`}>
                                                    {project.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(project.startDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/dashboard/projects/${project._id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                                    View detail &rarr;
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-20 text-center text-gray-500">
                            No projects linked to this organization yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

