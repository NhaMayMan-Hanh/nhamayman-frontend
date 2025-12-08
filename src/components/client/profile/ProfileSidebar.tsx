"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, ShoppingCart, Settings, LogOut, Bell } from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import { useNotifications } from "@contexts/NotificationContext";

interface ProfileSidebarProps {
  activePath?: string;
}

export default function ProfileSidebar({ activePath = "" }: ProfileSidebarProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const { hasUnreadNotification } = useNotifications();
  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Menu</h2>
      <nav className="space-y-2">
        <Link
          href="/profile"
          className={`flex items-center gap-3 px-3 py-2 text-gray-700 rounded hover:bg-amber-50 hover:text-amber-600 transition-colors ${
            activePath === "/profile" ? "bg-amber-50 text-amber-600" : ""
          }`}
        >
          <User size={18} />
          <span>Thông tin cá nhân</span>
        </Link>
        <Link
          href="/orders"
          className={`flex items-center gap-3 px-3 py-2 text-gray-700 rounded hover:bg-amber-50 hover:text-amber-600 transition-colors ${
            activePath === "/orders" ? "bg-amber-50 text-amber-600" : ""
          }`}
        >
          <ShoppingCart size={18} />
          <span>Đơn hàng của tôi</span>
        </Link>
        <Link
          href="/notification"
          className={`flex items-center gap-3 px-3 py-2 text-gray-700 rounded hover:bg-amber-50 hover:text-amber-600 transition-colors relative ${
            activePath === "/notification" ? "bg-amber-50 text-amber-600" : ""
          }`}
        >
          <Bell size={18} />
          <span>Thông báo của tôi</span>
          {hasUnreadNotification && (
            <div className="absolute top-0 right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-400"></span>
              </span>
            </div>
          )}
        </Link>
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 text-gray-700 rounded hover:bg-amber-50 hover:text-amber-600 transition-colors ${
            activePath === "/settings" ? "bg-amber-50 text-amber-600" : ""
          }`}
        >
          <Settings size={18} />
          <span>Cài Đặt</span>
        </Link>
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 w-full py-2 px-3 mt-4 text-red-600 rounded hover:bg-red-50 transition-colors"
      >
        <LogOut size={18} />
        <span>Đăng xuất</span>
      </button>
    </div>
  );
}
