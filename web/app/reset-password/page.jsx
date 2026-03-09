"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Link from "next/link";
import { Lock, KeyRound, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("resetEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/resetpassword", {
        email: formData.email,
        otp: formData.otp,
        password: formData.password,
      });
      if (res.data.success) {
        setSuccess(true);
        sessionStorage.removeItem("resetEmail");
        // Login the user automatically
        login(res.data.token, res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-xl">
        <div className="text-center">
          <Link href="/forgot-password" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Create new password
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter the OTP sent to your email and your new password
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm text-center animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-md text-sm text-center animate-in fade-in zoom-in duration-300">
            Password reset successfully! Redirecting...
          </div>
        )}

        {!success && (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                    />
                </div>

              <div className="space-y-2">
                <Label htmlFor="otp">6-Digit OTP</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                  <Input
                    id="otp"
                    type="text"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                    maxLength={6}
                    className="pl-10 tracking-[0.5em] font-mono text-center"
                    placeholder="000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold mt-4"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
