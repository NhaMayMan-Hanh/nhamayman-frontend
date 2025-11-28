import type { ReactNode } from "react";
import { requireAuth } from "@lib/protected-route";
import AdminHeader from "@components/admin/layout/AdminHeader";
import AdminSidebar from "@components/admin/layout/AdminSidebar";
import { AuthProvider } from "@contexts/AuthContext";
import { ToastContainer } from "@components/admin/ui/Toast";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAuth({ role: "admin" });
  return (
    <AuthProvider initialUser={user} skipFetch={true}>
      <div className="flex flex-col min-h-screen">
        <AdminHeader />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 bg-gray-50 p-6 overflow-auto">{children}</main>
        </div>
        <ToastContainer />
      </div>
    </AuthProvider>
  );
}
