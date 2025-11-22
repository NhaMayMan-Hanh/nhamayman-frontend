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
        const res = await fetch("http://localhost:5000/api/client/users/profile", {
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
    console.log("🔐 Login called with user:", userData);
    setUser(userData);

    // Check if there's a local cart to merge
    const localCartStr = localStorage.getItem("cart");
    let hasLocalCart = false;

    if (localCartStr) {
      try {
        const localCart = JSON.parse(localCartStr);
        hasLocalCart = localCart && localCart.length > 0;
        console.log("🛒 Local cart found:", localCart.length, "items");
      } catch (e) {
        // Invalid cart data
        hasLocalCart = false;
        console.log("❌ Invalid local cart data");
      }
    } else {
      console.log("📭 No local cart found");
    }

    if (hasLocalCart) {
      console.log("⏳ Waiting for cart merge...");
      // Wait for cart merge to complete
      const mergeSuccess = await new Promise((resolve) => {
        const handleMerge = () => {
          console.log("✅ Cart merge completed!");
          window.removeEventListener("cart-merged", handleMerge);
          resolve(true);
        };
        window.addEventListener("cart-merged", handleMerge);

        // Timeout after 5 seconds in case merge fails
        setTimeout(() => {
          console.log("⏰ Cart merge timeout (5s)");
          window.removeEventListener("cart-merged", handleMerge);
          resolve(false);
        }, 5000);
      });
      console.log("Cart merge result:", mergeSuccess);
    } else {
      // No local cart, just wait a bit for server cart to load
      console.log("⏳ Waiting 300ms for server cart to load...");
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log("✅ Server cart load wait completed");
    }

    // Navigate based on role
    console.log("🚀 Navigating to:", userData.role === "admin" ? "/admin/dashboard" : "/");
    if (userData.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/");
    }
  };

  const logout = async () => {
    setUser(null);
    hasCheckedAuth.current = false;

    try {
      await fetch("http://localhost:5000/api/client/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API error:", error);
    }

    // Fallback clear cookie
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // DON'T clear localStorage cart here - let CartContext handle it
    // localStorage.removeItem("cart"); // ← Remove this line

    router.push("/auth/login");
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
