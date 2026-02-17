"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, User } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/register", { name, email, password, tenantName });
      if (res.data.success) {
        login(res.data.token, res.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-md space-y-8 bg-white/5 p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
        <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
            <p className="mt-2 text-sm text-gray-400">Start managing your projects today</p>
        </div>

        {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm text-center">
                {error}
            </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                    <Input 
                        id="name" 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required 
                        className="pl-10"
                        placeholder="John Doe"
                    />
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="tenantName">Company Name</Label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                    <Input 
                        id="tenantName" 
                        type="text" 
                        value={tenantName}
                        onChange={(e) => setTenantName(e.target.value)}
                        required 
                        className="pl-10"
                        placeholder="Acme Inc."
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                    <Input 
                        id="email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                        className="pl-10"
                        placeholder="you@example.com"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                    <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        className="pl-10"
                        placeholder="••••••••"
                    />
                </div>
            </div>
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all">
            Get Started
          </Button>
        </form>

        <div className="text-center text-sm">
            <span className="text-gray-400">Already have an account? </span>
            <Link href="/login" className="font-medium text-blue-500 hover:text-blue-400">
                Sign in
            </Link>
        </div>
      </div>
    </div>
  );
}
