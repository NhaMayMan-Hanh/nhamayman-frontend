"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
   Menu,
   X,
   Search,
   ShoppingCart,
   User,
   LogOut,
   ChevronDown,
} from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import { useCart } from "@contexts/CartContext";
import { useNotifications } from "@contexts/NotificationContext";
import SearchBarWithSuggestions from "@components/client/search/SearchBarWithSuggestions";

export default function Header() {
   const [isMenuOpen, setIsMenuOpen] = useState(false);
   const [isProfileOpen, setIsProfileOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");
   const { user, logout } = useAuth();
   const { cart } = useCart();
   const { hasUnreadNotification } = useNotifications();
   const profileRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            profileRef.current &&
            !profileRef.current.contains(event.target as Node)
         ) {
            setIsProfileOpen(false);
         }
      };

      if (isProfileOpen) {
         document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, [isProfileOpen]);

   const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
   const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

   const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
         window.location.href = `/products?search=${encodeURIComponent(
            searchQuery
         )}`;
      }
   };

   const handleLogout = () => {
      logout();
      setIsProfileOpen(false);
      setIsMenuOpen(false);
   };

   const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

   const truncatedName =
      user?.name && user.name.length > 12
         ? user.name.slice(0, 12) + "..."
         : user?.name;

   return (
      <header className="w-full border-b border-gray-200 header-client shadow-sm sticky top-0 z-50 bg-white">
         <div className="max-w-6xl mx-auto px-4 md:px-2 py-4">
            {/* Desktop Navigation - từ md (768px) trở lên */}
            <div className="hidden md:block">
               {/* Wrapper cho toàn bộ nav - cho phép wrap xuống 2 hàng */}
               <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  {/* Logo */}
                  <Link
                     href="/"
                     className="text-2xl font-bold text-amber-500 hover:text-amber-600 transition-colors shrink-0"
                  >
                     <Image
                        src="/img/logo-hanh.jpg"
                        alt="Logo"
                        width={70}
                        height={70}
                        className="w-[70px] h-[70px] object-cover"
                        priority
                     />
                  </Link>

                  {/* Search Bar */}
                  <div className="shrink-0 w-100">
                     <SearchBarWithSuggestions />
                  </div>

                  {/* Navigation Links + Cart + User - wrap thành 1 nhóm */}
                  <div className="flex items-center gap-2 ml-auto flex-wrap">
                     {/* Navigation Links */}
                     <Link
                        href="/productsAll"
                        className="text-gray-700 hover:text-amber-500 transition-colors px-3 py-2 whitespace-nowrap rounded-lg hover:bg-gray-50 text-sm font-medium"
                     >
                        Sản phẩm
                     </Link>
                     <Link
                        href="/blog"
                        className="text-gray-700 hover:text-amber-500 transition-colors px-3 py-2 whitespace-nowrap rounded-lg hover:bg-gray-50 text-sm font-medium"
                     >
                        Tin tức
                     </Link>
                     <Link
                        href="/about"
                        className="text-gray-700 hover:text-amber-500 transition-colors px-3 py-2 whitespace-nowrap rounded-lg hover:bg-gray-50 text-sm font-medium"
                     >
                        Giới thiệu
                     </Link>

                     {/* Cart with Badge */}
                     <Link
                        href="/cart"
                        className="relative text-gray-700 hover:text-amber-500 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 whitespace-nowrap text-sm font-medium"
                     >
                        <ShoppingCart size={20} />
                        <span>Giỏ hàng</span>
                        {cartCount > 0 && (
                           <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                              {cartCount > 99 ? "99+" : cartCount}
                           </span>
                        )}
                     </Link>

                     {/* User Profile or Login */}
                     {user ? (
                        <div className="relative" ref={profileRef}>
                           <button
                              onClick={toggleProfile}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                           >
                              <div className="relative">
                                 <Image
                                    src={
                                       user.avatar || "/img/default-avatar.jpg"
                                    }
                                    alt={user.name || "User avatar"}
                                    width={32}
                                    height={32}
                                    className="rounded-full ring-2 ring-amber-500 shrink-0"
                                    priority
                                 />
                                 {hasUnreadNotification && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                       <span className="relative flex h-3 w-3">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                       </span>
                                    </div>
                                 )}
                              </div>
                              <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-24">
                                 {truncatedName}
                              </span>
                              <ChevronDown
                                 size={16}
                                 className={`transition-transform shrink-0 ${
                                    isProfileOpen ? "rotate-180" : ""
                                 }`}
                              />
                           </button>

                           {isProfileOpen && (
                              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                                 <Link
                                    href="/profile"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                                 >
                                    <User size={18} />
                                    <span>Trang cá nhân</span>
                                    {hasUnreadNotification && (
                                       <div className="absolute top-5 right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                          <span className="relative flex h-3 w-3">
                                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                             <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                          </span>
                                       </div>
                                    )}
                                 </Link>
                                 <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
                                 >
                                    <LogOut size={18} />
                                    <span>Đăng xuất</span>
                                 </button>
                              </div>
                           )}
                        </div>
                     ) : (
                        <Link
                           href="/login"
                           className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors whitespace-nowrap text-sm font-medium"
                        >
                           <User size={18} />
                           <span>Đăng nhập</span>
                        </Link>
                     )}
                  </div>
               </div>
            </div>

            {/* Mobile/Tablet Header - hiển thị từ 0-767px */}
            <div className="md:hidden flex items-center justify-between">
               <Link
                  href="/"
                  className="text-2xl font-bold text-amber-500 hover:text-amber-600 transition-colors"
               >
                  <Image
                     src="/img/logo-hanh.jpg"
                     alt="Logo"
                     width={50}
                     height={50}
                     className="w-[50px] h-[50px] object-cover"
                     priority
                  />
               </Link>

               <button
                  onClick={toggleMenu}
                  className="text-gray-700 hover:text-amber-500 transition-colors p-2"
               >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
               </button>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
               <div className="md:hidden mt-4 pb-4 border-t pt-4">
                  <nav className="flex flex-col gap-2 text-sm font-medium">
                     <div className="mb-4">
                        <SearchBarWithSuggestions />
                     </div>

                     <Link
                        href="/productsAll"
                        className="text-gray-700 hover:text-amber-500 transition-colors py-2 px-3 rounded-lg hover:bg-gray-50"
                        onClick={toggleMenu}
                     >
                        Sản phẩm
                     </Link>

                     <Link
                        href="/blog"
                        className="text-gray-700 hover:text-amber-500 transition-colors py-2 px-3 rounded-lg hover:bg-gray-50"
                        onClick={toggleMenu}
                     >
                        Tin tức
                     </Link>

                     <Link
                        href="/about"
                        className="text-gray-700 hover:text-amber-500 transition-colors py-2 px-3 rounded-lg hover:bg-gray-50"
                        onClick={toggleMenu}
                     >
                        Giới thiệu
                     </Link>

                     <Link
                        href="/cart"
                        className="text-gray-700 hover:text-amber-500 transition-colors flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 relative"
                        onClick={toggleMenu}
                     >
                        <ShoppingCart size={20} />
                        <span>Giỏ hàng</span>
                        {cartCount > 0 && (
                           <span className="ml-auto bg-amber-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold">
                              {cartCount > 99 ? "99+" : cartCount}
                           </span>
                        )}
                     </Link>

                     {user ? (
                        <div className="border-t pt-4 mt-2">
                           <div className="flex items-center gap-3 mb-3 px-3">
                              <div className="relative">
                                 <Image
                                    src={
                                       user.avatar || "/img/default-avatar.jpg"
                                    }
                                    alt={user.name}
                                    width={40}
                                    height={40}
                                    className="rounded-full ring-2 ring-amber-500"
                                 />
                                 {hasUnreadNotification && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                       <span className="relative flex h-3 w-3">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                       </span>
                                    </div>
                                 )}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="font-semibold text-gray-800 truncate">
                                    {user.name}
                                 </p>
                                 <p className="text-xs text-gray-500 truncate">
                                    {user.email}
                                 </p>
                              </div>
                           </div>
                           <Link
                              href="/profile"
                              className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-amber-500 transition-colors"
                              onClick={toggleMenu}
                           >
                              <User size={18} />
                              <span>Trang cá nhân</span>
                           </Link>
                           <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                           >
                              <LogOut size={18} />
                              <span>Đăng xuất</span>
                           </button>
                        </div>
                     ) : (
                        <Link
                           href="/login"
                           className="flex items-center gap-2 py-2 px-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors justify-center mt-2"
                           onClick={toggleMenu}
                        >
                           <User size={18} />
                           <span>Đăng nhập</span>
                        </Link>
                     )}
                  </nav>
               </div>
            )}
         </div>
      </header>
   );
}
