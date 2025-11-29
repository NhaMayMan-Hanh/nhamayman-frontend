// src/lib/protected-route.ts
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { useAuth } from "@contexts/AuthContext";

const JWT_SECRET = process.env.JWT_SECRET!;

interface JwtPayload {
   id?: string | number;
   _id?: string | number;
   name?: string;
   username?: string;
   email?: string;
   role?: string;
   avatar?: string;
   iat?: number;
   exp?: number;
}

export async function requireAuth(
   options: { role?: "admin" | "user" | "any" } = {}
) {
   const cookieStore = await cookies();
   const token = cookieStore.get("token")?.value;

   console.log("🔍 [requireAuth] Token:", token ? "CÓ" : "KHÔNG");
   console.log("🔍 [requireAuth] All cookies:", cookieStore.getAll());

   if (!token) {
      console.log("❌ [requireAuth] Không tìm thấy token, redirect to login");
      redirect("/login");
   }
   try {
      const { payload } = await jwtVerify(
         token,
         new TextEncoder().encode(JWT_SECRET)
      );

      const rawPayload = payload as JwtPayload;

      const userId = String(rawPayload.id || rawPayload._id || "");

      const user = {
         id: userId,
         name: (rawPayload.name || "Unknown") as string,
         username: (rawPayload.username || "user") as string,
         email: (rawPayload.email || "") as string,
         role: (rawPayload.role || "user") as string,
         avatar: (rawPayload.avatar || "") as string,
      };

      console.log(
         "✅ [requireAuth] User authenticated:",
         user.username,
         "role:",
         user.role
      );

      if (options.role === "admin" && user.role !== "admin") {
         console.log(
            "❌ [requireAuth] User không phải admin, redirect to home"
         );
         redirect("/");
      }

      return user;
   } catch (error) {
      console.log("❌ [requireAuth] Token không hợp lệ:", error);
      redirect("/login");
   }
}
