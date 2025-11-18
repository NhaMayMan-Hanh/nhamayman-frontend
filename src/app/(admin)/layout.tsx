import type { ReactNode } from "react";
import AdminHeader from "@components/admin/layout/AdminHeader";
import AdminSidebar from "@components/admin/layout/AdminSidebar";
import { AuthProvider } from "../../contexts/AuthContext";

export default function AdminLayout({ children }: { children: ReactNode }) {
   return (
      <AuthProvider>
         <div className="flex flex-col min-h-screen">
            <AdminHeader />
            <div className="flex flex-1">
               <AdminSidebar />
               <main className="flex-1 bg-gray-50 p-6 overflow-auto">
                  {children}
               </main>
            </div>
         </div>
      </AuthProvider>
   );
}
