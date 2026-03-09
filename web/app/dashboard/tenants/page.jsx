"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus, Building, Globe, Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function TenantsPage() {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newTenant, setNewTenant] = useState({
        name: "",
        domain: "",
    });

    const [searchQuery, setSearchQuery] = useState("");

    const fetchTenants = async (query = "") => {
        try {
            setLoading(true);
            const endpoint = query ? `/tenants/search?q=${encodeURIComponent(query)}` : "/tenants";
            const res = await api.get(endpoint);
            if (res.data.success) {
                setTenants(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch tenants", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTenants(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/tenants", newTenant);
            if (res.data.success) {
                setTenants([...tenants, res.data.data]);
                setNewTenant({ name: "", domain: "" });
                setShowAdd(false);
            }
        } catch (error) {
            console.error("Failed to create tenant", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
                    <p className="text-gray-400">Manage platform organizations.</p>
                </div>
                <Button className="gap-2" onClick={() => setShowAdd(!showAdd)}>
                    <Plus className="h-4 w-4" />
                    Add Tenant
                </Button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search tenants by name or domain..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white"
                />
            </div>

            {showAdd && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in slide-in-from-top-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tenant Name</Label>
                                <Input
                                    value={newTenant.name}
                                    onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                                    required
                                    placeholder="Acme Corp"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Domain (Optional)</Label>
                                <Input
                                    value={newTenant.domain}
                                    onChange={(e) => setNewTenant({ ...newTenant, domain: e.target.value })}
                                    placeholder="acme.com"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Create Tenant</Button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-center py-10">Loading tenants...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tenants.map((tenant) => (
                        <div key={tenant._id} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                    <Building className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{tenant.name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                        <Globe className="h-3 w-3" />
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
                                </div>
                            </div>
                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    Created {new Date(tenant.createdAt).toLocaleDateString()}
                                </div>
                                <Link href={`/dashboard/tenants/${tenant._id}`} className="text-blue-600 hover:text-blue-700 font-medium">
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
