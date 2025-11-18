"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import SidebarItem from "./AdminSideItems";
import {
   Home,
   Box,
   ShoppingCart,
   FileText,
   Users,
   Settings,
} from "lucide-react";

export default function AdminSidebar() {
   const [isOpen, setIsOpen] = useState(true);
   const pathname = usePathname();

   return (
      <aside
         className={`${
            isOpen ? "w-58" : "w-20"
         } bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col shadow-2xl transition-all duration-300 relative`}
      >
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="absolute -right-4 top-8 p-2.5 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg shadow-lg hover:scale-110 z-50 transition-all"
         >
            <svg
               className={`w-4 h-4 transition-transform duration-300 ${
                  isOpen ? "rotate-0" : "rotate-180"
               }`}
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24"
            >
               <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
               />
            </svg>
         </button>

         {/* Navigation */}
         <nav className="flex-1 p-3 mt-4 overflow-y-auto">
            <div className="space-y-2">
               <SidebarItem
                  isOpen={isOpen}
                  href="/admin/dashboard"
                  title="Tổng quan"
                  icon={<Home />}
                  isActive={pathname === "/admin/dashboard"}
               />
               <SidebarItem
                  isOpen={isOpen}
                  href="/admin/categories"
                  title="Danh mục"
                  icon={<Box />}
                  isActive={pathname === "/admin/categories"}
               />
               <SidebarItem
                  isOpen={isOpen}
                  href="/admin/products"
                  title="Sản phẩm"
                  icon={<ShoppingCart />}
                  isActive={pathname === "/admin/products"}
               />
               <SidebarItem
                  isOpen={isOpen}
                  href="/admin/orders"
                  title="Đơn hàng"
                  icon={<FileText />}
                  isActive={pathname === "/admin/orders"}
               />
               <SidebarItem
                  isOpen={isOpen}
                  href="/admin/users"
                  title="Người dùng"
                  icon={<Users />}
                  isActive={pathname === "/admin/users"}
               />
               <SidebarItem
                  isOpen={isOpen}
                  href="/admin/settings"
                  title="Cài đặt"
                  icon={<Settings />}
                  isActive={pathname === "/admin/settings"}
               />
               <SidebarItem
                  isOpen={isOpen}
                  href="/admin/blogs"
                  title="Bài viết"
                  icon={<FileText />}
                  isActive={pathname === "/admin/blogs"}
               />
            </div>
         </nav>
      </aside>
   );
}
