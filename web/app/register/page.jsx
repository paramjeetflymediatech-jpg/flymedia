"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, User, Phone } from "lucide-react";
import Image from "next/image";
import { logo } from "@/components/constant.js";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    tenantName: "",
    domain: "",
    email: "",
    phone: "",
    password: "",
    role: "client",
    error: "",
    loading: false,
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const cleanDomain = (domain) => {
    return domain
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
  };
  const validateDomain = (domain) => {
    const regex =
      /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

    return regex.test(domain);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleaned = form.domain.trim() ? cleanDomain(form.domain) : "";
    if (cleaned && !validateDomain(cleaned)) {
      setForm((prev) => ({
        ...prev,
        error: "Please enter a valid domain (example: demo.flymedia.in)",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, error: "", loading: true }));

    try {
      const res = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        tenantName: form.tenantName,
        domain: cleaned,
        role: form.role,
      });

      if (res.data.success) {
        login(res.data.token, res.data.user);
        router.push("/dashboard");
      }
    } catch (err) {
      setForm((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Registration failed",
      }));
    } finally {
      setForm((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <header className="px-6 lg:px-10 py-5 flex items-center justify-between fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-full h-10 rounded-lg   flex items-center justify-center font-bold text-white text-lg">
            <Link href="/">
              <Image src={logo} alt="Logo" width={150} height={50} />
            </Link>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link
            href="/#features"
            className="hover:text-gray-900 transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#testimonials"
            className="hover:text-gray-900 transition-colors"
          >
            Testimonials
          </Link>
          
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">

        <div className="w-full max-w-md bg-white p-8 rounded-2xl   shadow-xl">

          <h2 className="text-3xl font-bold text-center mb-6">
            Create an account
          </h2>

          {form.error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm text-center mb-4">
              {form.error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <Label>Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Company Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  name="tenantName"
                  value={form.tenantName}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="Acme Inc."
                   
                />
              </div>
            </div>
            <div>
              <Label>Company Domain</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  name="domain"
                  value={form.domain}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      domain: e.target.value.toLowerCase().trim(),
                    })
                  }
                  className="pl-10"
                  placeholder="demo.flymedia.in"
                   
                />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={form.loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {form.loading ? "Creating account..." : "Get Started"}
            </Button>

          </form>

          <div className="text-center text-sm mt-6">
            <span className="text-gray-500">Already have an account? </span>
            <Link href="/login" className="text-blue-500 font-medium">
              Sign in
            </Link>
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-10 border-t border-gray-200 text-center text-gray-500 text-sm bg-gray-50">
        <p>© 2026 Flymedia. All rights reserved.</p>
      </footer>
    </div>
  );
}