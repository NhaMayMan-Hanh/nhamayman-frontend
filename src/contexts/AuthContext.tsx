"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const hasCheckedAuth = useRef(false); // Ref để check chỉ chạy 1 lần

  useEffect(() => {
    if (hasCheckedAuth.current) return; // Skip nếu đã check

    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/client/auth/profile", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUser(data.data);
            // Không redirect ở đây nữa, để login handle hoặc page handle
          }
        }
      } catch (error) {
        // Unauthorized - clear cookie nếu cần
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } finally {
        hasCheckedAuth.current = true; // Đánh dấu đã check
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]); // Giữ dep, nhưng ref ngăn re-run

  const login = (userData: User) => {
    setUser(userData);
    // Redirect dựa trên role
    if (userData.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/");
    }
  };

  const logout = () => {
    setUser(null);
    hasCheckedAuth.current = false; // Reset flag cho lần sau
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
