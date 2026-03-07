"use client";

import { AuthProvider, user } from "../context/AuthContext";

export function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
