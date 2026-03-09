"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Separator } from "@/components/ui/Separator";
import { User, Mail, Phone, Lock, CheckCircle2, AlertCircle, Globe } from "lucide-react";

export default function ProfilePage() {
  const { user, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    domain: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        domain: user.domain || "",
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await api.put("/auth/updatedetails", profileData);
      if (res.data.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        await checkAuth(); // Refresh user data in context
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setMessage({ type: "error", text: "New passwords do not match" });
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await api.put("/auth/updatepassword", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.data.success) {
        setMessage({ type: "success", text: "Password updated successfully!" });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-2">Manage your personal information and security preferences.</p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-1/2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <p className="text-sm text-gray-500">Update your name, email and contact details.</p>
            </div>
            <Separator />
            <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      className="pl-10"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      className="pl-10"
                      placeholder="+1 (555) 000-0000"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                </div>
                {user?.role === "client" && (
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain / Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="domain"
                        className="pl-10"
                        placeholder="example.com"
                        value={profileData.domain}
                        onChange={(e) => setProfileData({ ...profileData, domain: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-500">Ensure your account is using a long, random password to stay secure.</p>
            </div>
            <Separator />
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="currentPassword"
                      type="password"
                      className="pl-10"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type="password"
                      className="pl-10"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="pl-10"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
