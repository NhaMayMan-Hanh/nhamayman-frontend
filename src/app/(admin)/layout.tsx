import type { ReactNode } from "react";
import AdminHeader from "@components/admin/layout/AdminHeader";
import AdminFooter from "@components/admin/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      <main className="flex grow container mx-auto p-6">{children}</main>
      <AdminFooter />
    </div>
  );
}
