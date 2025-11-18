"use client";

import { useAuth } from "../../../contexts/AuthContext";
import { useState, useRef, useEffect } from "react";

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
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/50 px-6 py-2 flex items-center justify-between shadow-xl">
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
               <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
               </svg>
               <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-700 transition-all"
               />
            </div>
         </div>
         <div className="flex items-center gap-3 ml-6">
            <button className="relative p-2.5 text-slate-300 hover:bg-slate-700/50 rounded-xl transition-all hover:text-white">
               <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
               </svg>
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-800"></span>
            </button>

            <button className="relative p-2.5 text-slate-300 hover:bg-slate-700/50 rounded-xl transition-all hover:text-white">
               <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
               </svg>
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
                     <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-900/30">
                        {getInitial()}
                     </div>
                  )}
                  <svg
                     className={`w-4 h-4 text-slate-400 group-hover:text-white transition-all ${
                        showDropdown ? "rotate-180" : ""
                     }`}
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                     />
                  </svg>
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
                           <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                           >
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth={2}
                                 d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                           </svg>
                           Hồ sơ
                        </button>
                        <button className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors flex items-center gap-3">
                           <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                           >
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth={2}
                                 d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth={2}
                                 d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                           </svg>
                           Cài đặt
                        </button>
                     </div>
                     <div className="p-2 border-t border-slate-700">
                        <button
                           onClick={logout}
                           className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-3"
                        >
                           <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                           >
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth={2}
                                 d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                           </svg>
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
