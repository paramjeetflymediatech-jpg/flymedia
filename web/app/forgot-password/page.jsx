"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/forgotpassword", { email });
      if (res.data.success) {
        setSuccess(true);
        // We could store email in session storage to use in reset page
        sessionStorage.setItem("resetEmail", email);
        setTimeout(() => {
          router.push("/reset-password");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-xl">
        <div className="text-center">
          <Link href="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Forgot password
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email and we'll send you an OTP to reset your password
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm text-center animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-md text-sm text-center animate-in fade-in zoom-in duration-300">
            OTP sent successfully! Redirecting...
          </div>
        )}

        {!success && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
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
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
