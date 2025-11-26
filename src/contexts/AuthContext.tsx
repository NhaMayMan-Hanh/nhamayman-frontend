"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
  login: (userData: User) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (initialUser || hasCheckedAuth.current) return;

    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/users/profile`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUser(data.data);
          }
        }
      } catch (error) {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } finally {
        hasCheckedAuth.current = true;
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (userData: User) => {
    console.log("🔐 [AuthContext] Login called with user:", userData);
    setUser(userData);

    // Check if there's a local cart to merge
    const localCartStr = localStorage.getItem("cart");
    let hasLocalCart = false;

    if (localCartStr) {
      try {
        const localCart = JSON.parse(localCartStr);
        hasLocalCart = localCart && localCart.length > 0;
        console.log("🛒 [AuthContext] Local cart found:", localCart.length, "items");
      } catch (e) {
        hasLocalCart = false;
        console.log("❌ [AuthContext] Invalid local cart data");
      }
    } else {
      console.log("📭 [AuthContext] No local cart found");
    }

    if (hasLocalCart) {
      console.log("⏳ [AuthContext] Waiting for cart merge...");
      const mergeSuccess = await new Promise((resolve) => {
        const handleMerge = () => {
          console.log("✅ [AuthContext] Cart merge completed!");
          window.removeEventListener("cart-merged", handleMerge);
          resolve(true);
        };
        window.addEventListener("cart-merged", handleMerge);

        setTimeout(() => {
          console.log("⏰ [AuthContext] Cart merge timeout (5s)");
          window.removeEventListener("cart-merged", handleMerge);
          resolve(false);
        }, 5000);
      });
      console.log("[AuthContext] Cart merge result:", mergeSuccess);
    } else {
      console.log("⏳ [AuthContext] Waiting 300ms for server cart to load...");
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log("✅ [AuthContext] Server cart load wait completed");
    }

    // Refresh page để AuthLayout tự động redirect dựa trên role
    console.log("🔄 [AuthContext] Refreshing router to trigger AuthLayout redirect...");
    window.location.href = userData.role === "admin" ? "/admin/dashboard" : "/";
  };

  const logout = async () => {
    console.log("🚪 [AuthContext] Logging out...");
    setUser(null);
    hasCheckedAuth.current = false;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("[AuthContext] Logout API error:", error);
    }

    // Navigate to login
    router.push("/login");
    toast.success("Đăng xuất thành công");
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
