"use client";

import { useAuth } from "../../../contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import {
   Search,
   Bell,
   Mail,
   ChevronDown,
   User,
   Settings,
   LogOut,
   Home,
} from "lucide-react";
import Link from "next/link";

export default function AdminHeader() {
   const { user, logout } = useAuth();
   const [showDropdown, setShowDropdown] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
         ) {
            setShowDropdown(false);
         }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, []);
   // Get first letter of name for avatar
   const getInitial = () => {
      if (!user?.name) return "A";
      return user.name.charAt(0).toUpperCase();
   };

   return (
      <header className="bg-linear-to-r from-slate-900 to-slate-800 border-b border-slate-700/50 px-6 py-2 flex items-center justify-between shadow-xl">
         <div className="flex items-center mr-6">
            <div className="p-2 rounded-xl shadow-lg">
               <img
                  src="/img/logo-hanh.jpg"
                  alt="Logo"
                  className="h-16 w-auto object-contain"
               />
            </div>
         </div>

         <div className="flex items-center flex-1 max-w-2xl">
            <div className="relative w-full">
               <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
               <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-700 transition-all"
               />
            </div>
         </div>

         <div className="flex items-center gap-3 ml-6">
            <Link
               href="/"
               className="relative p-2.5 text-slate-300 hover:bg-slate-700/50 rounded-xl transition-all hover:text-white"
               title="Về trang chủ"
            >
               <Home className="w-6 h-6" />
            </Link>

            <button className="relative p-2.5 text-slate-300 hover:bg-slate-700/50 rounded-xl transition-all hover:text-white">
               <Bell className="w-6 h-6" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-800"></span>
            </button>

            <button className="relative p-2.5 text-slate-300 hover:bg-slate-700/50 rounded-xl transition-all hover:text-white">
               <Mail className="w-6 h-6" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-slate-800"></span>
            </button>

            <div
               className="flex items-center gap-3 pl-4 ml-2 border-l border-slate-700 relative"
               ref={dropdownRef}
            >
               <div className="text-right">
                  <p className="text-sm font-medium text-white">
                     {user?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-slate-400">
                     {user?.role === "admin" ? "Quản trị viên" : "Người dùng"}
                  </p>
               </div>
               <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 hover:bg-slate-700/50 rounded-xl p-2 transition-all group"
               >
                  {user?.avatar && user.avatar !== "/img/default-avatar.jpg" ? (
                     <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover shadow-lg"
                     />
                  ) : (
                     <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-900/30">
                        {getInitial()}
                     </div>
                  )}
                  <ChevronDown
                     className={`w-4 h-4 text-slate-400 group-hover:text-white transition-all ${
                        showDropdown ? "rotate-180" : ""
                     }`}
                  />
               </button>
               {/* Dropdown Menu */}
               {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                     <div className="p-4 border-b border-slate-700">
                        <p className="text-sm font-medium text-white">
                           {user?.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                           {user?.email}
                        </p>
                     </div>
                     <div className="p-2">
                        <button className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors flex items-center gap-3">
                           <User className="w-5 h-5" />
                           Hồ sơ
                        </button>
                        <button className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors flex items-center gap-3">
                           <Settings className="w-5 h-5" />
                           Cài đặt
                        </button>
                     </div>
                     <div className="p-2 border-t border-slate-700">
                        <button
                           onClick={logout}
                           className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-3"
                        >
                           <LogOut className="w-5 h-5" />
                           Đăng xuất
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </header>
   );
}
