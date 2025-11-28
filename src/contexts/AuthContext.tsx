"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ApiResponse, Me } from "@app/(client)/types";
import apiRequest from "@lib/api/index";
import getErrorMessage from "@utils/getErrorMessage";

interface AuthContextType {
  user: Me | null;
  login: (userData: Me) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser,
  skipFetch,
}: {
  children: ReactNode;
  initialUser?: Me | null;
  skipFetch?: boolean;
}) {
  const [user, setUser] = useState<Me | null>(initialUser || null);
  const [loading, setLoading] = useState(!skipFetch);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasCheckedAuth.current || skipFetch) return;

    const fetchUser = async () => {
      try {
        const result = await apiRequest.get<ApiResponse<Me>>("/client/users/me", {
          noRedirectOn401: true,
        });
        if (result.success) {
          setUser(result.data);
        } else {
          setUser(null);
        }
      } catch (err: unknown) {
        setUser(null);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        hasCheckedAuth.current = true;
      }
    };

    fetchUser();
  }, [skipFetch]);

  const login = async (userData: Me) => {
    setUser(userData);

    // Check if there's a local cart to merge
    const localCartStr = localStorage.getItem("cart");
    let hasLocalCart = false;

    if (localCartStr) {
      try {
        const localCart = JSON.parse(localCartStr);
        hasLocalCart = localCart && localCart.length > 0;
      } catch (e) {
        hasLocalCart = false;
      }
    } else {
      console.log("📭 [AuthContext] No local cart found");
    }

    if (hasLocalCart) {
      const mergeSuccess = await new Promise((resolve) => {
        const handleMerge = () => {
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
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    const redirectPath = userData.role === "admin" ? "/admin/dashboard" : "/";

    router.push(redirectPath);
  };

  const logout = async () => {
    setUser(null);
    hasCheckedAuth.current = false;

    try {
      await apiRequest.post("/client/auth/logout");
    } catch (error) {
      console.error("[AuthContext] Logout API error:", error);
    }

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
