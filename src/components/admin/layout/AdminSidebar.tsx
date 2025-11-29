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
  ChevronLeft,
  ChevronRight,
  Package,
  BookOpen,
} from "lucide-react";

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <aside
      className={`${
        isOpen ? "w-58" : "w-20"
      } bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white h-screen transition-all duration-300 shadow-2xl border-r border-gray-700 sticky top-0`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-4 top-8 p-2.5 bg-linear-to-br from-blue-600 to-blue-500 rounded-lg shadow-lg hover:scale-110 z-50 transition-all"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-3 mt-4 overflow-y-auto">
        <div className="space-y-2">
          <SidebarItem
            isOpen={isOpen}
            href="/admin/dashboard"
            title="Tổng quan"
            icon={<Home className="w-6 h-6" />}
            isActive={pathname === "/admin/dashboard"}
          />
          <SidebarItem
            isOpen={isOpen}
            href="/admin/categories"
            title="Danh mục"
            icon={<Box className="w-6 h-6" />}
            isActive={pathname === "/admin/categories"}
          />
          <SidebarItem
            isOpen={isOpen}
            href="/admin/products"
            title="Sản phẩm"
            icon={<ShoppingCart className="w-6 h-6" />}
            isActive={pathname === "/admin/products"}
          />
          <SidebarItem
            isOpen={isOpen}
            href="/admin/orders"
            title="Đơn hàng"
            icon={<Package className="w-6 h-6" />}
            isActive={pathname === "/admin/orders"}
          />

          <SidebarItem
            isOpen={isOpen}
            href="/admin/blogs"
            title="Bài viết"
            icon={<BookOpen className="w-6 h-6" />}
            isActive={pathname === "/admin/blogs"}
          />
          <SidebarItem
            isOpen={isOpen}
            href="/admin/users"
            title="Người dùng"
            icon={<Users className="w-6 h-6" />}
            isActive={pathname === "/admin/users"}
          />
          <SidebarItem
            isOpen={isOpen}
            href="/admin/settings"
            title="Cài đặt"
            icon={<Settings className="w-6 h-6" />}
            isActive={pathname === "/admin/settings"}
          />
        </div>
      </nav>
    </aside>
  );
}
