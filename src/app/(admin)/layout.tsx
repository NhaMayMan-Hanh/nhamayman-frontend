import type { ReactNode } from "react";
import { requireAuth } from "@lib/protected-route";
import AdminHeader from "@components/admin/layout/AdminHeader";
import AdminSidebar from "@components/admin/layout/AdminSidebar";
import { AuthProvider } from "@contexts/AuthContext";
import { cookies } from "next/headers";
import { ToastProvider } from "@contexts/ToastContext";

export default async function AdminLayout({
   children,
}: {
   children: ReactNode;
}) {
   const cookieStore = await cookies();
   const token = cookieStore.get("token")?.value;

   console.log("🍪 [AdminLayout] Token từ cookies:", token ? "CÓ" : "KHÔNG");
   console.log("🍪 [AdminLayout] All cookies:", cookieStore.getAll());
   const user = await requireAuth({ role: "admin" });
   return (
      <AuthProvider initialUser={user}>
         <ToastProvider>
            <div className="flex flex-col min-h-screen">
               <AdminHeader />
               <div className="flex flex-1">
                  <AdminSidebar />
                  <main className="flex-1 bg-gray-50 p-6 overflow-auto">
                     {children}
                  </main>
               </div>
            </div>
         </ToastProvider>
      </AuthProvider>
   );
}
