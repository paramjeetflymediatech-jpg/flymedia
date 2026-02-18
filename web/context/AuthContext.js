"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    const token = Cookies.get("token");
    if (token) {
      try {
        // Determine if we need to fetch user details or just rely on stored info?
        // Ideally fetch from /api/auth/me to be sure and get fresh data
        const res = await api.get("/auth/me");
        if (res.data.success) {
          setUser(res.data.data);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Auth check failed", error);
        // logout(); // Only logout if token is explicitly invalid?
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (token, userData) => {
    Cookies.set("token", token, { expires: 30 });
    setUser(userData);

    if (userData.role === "employee") {
      router.push("/dashboard/tasks");
    } else if (userData.role === "client") {
      router.push("/dashboard/projects");
    } else {
      router.push("/dashboard");
    }
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
