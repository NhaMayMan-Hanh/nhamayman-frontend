"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import { useCart } from "@contexts/CartContext";
import { useNotifications } from "@contexts/NotificationContext";
import SearchBarWithSuggestions from "@components/client/search/SearchBarWithSuggestions";
import NavLink from "@components/client/nav/NavLink";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { hasUnreadNotification } = useNotifications();
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Click outside để đóng profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isProfileOpen]);

  // Đóng mobile menu khi route thay đổi
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMenuOpen(false);
      setIsProfileOpen(false);
    };

    handleRouteChange();

    return () => {
      handleRouteChange();
    };
  }, [pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const truncatedName =
    user?.name && user.name.length > 12 ? user.name.slice(0, 12) + "..." : user?.name;

  // Helper function để check active link
  const isActiveLink = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="w-full border-b border-gray-200 header-client shadow-sm sticky top-0 z-50 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-2 py-4">
        {/* Desktop Navigation - từ md (768px) trở lên */}
        <div className="hidden md:block">
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
                className="w-[70px] h-[70px] object-cover rounded-lg"
                priority
              />
            </Link>

            {/* Search Bar */}
            <div className="shrink-0 w-100">
              <SearchBarWithSuggestions />
            </div>

            {/* Navigation Links + Cart + User */}
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {/* Navigation Links */}
              <NavLink href="/productsAll">Sản phẩm</NavLink>
              <NavLink href="/blog">Tin tức</NavLink>
              <NavLink href="/about">Giới thiệu</NavLink>

              {/* Cart with Badge */}
              <Link
                href="/cart"
                className={`
                  relative text-gray-700 hover:text-amber-500 transition-all duration-200
                  flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium
                  ${
                    isActiveLink("/cart")
                      ? "bg-amber-50 text-amber-600 font-semibold shadow-sm"
                      : "hover:bg-gray-50"
                  }
                `}
              >
                <ShoppingCart size={20} />
                <span>Giỏ hàng</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-md">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* User Profile or Login */}
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={toggleProfile}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                      ${
                        isProfileOpen || isActiveLink("/profile")
                          ? "bg-amber-50 ring-2 ring-amber-200"
                          : "hover:bg-gray-100"
                      }
                    `}
                  >
                    <div className="relative">
                      <Image
                        src={user.avatar || "/img/default-avatar.jpg"}
                        alt={user.name || "User avatar"}
                        width={32}
                        height={32}
                        className="rounded-full ring-2 ring-amber-500 shrink-0"
                        priority
                      />
                      {hasUnreadNotification && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full">
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
                      className={`transition-transform duration-200 shrink-0 ${
                        isProfileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg pb-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-2.5 transition-colors relative
                          ${
                            isActiveLink("/profile")
                              ? "bg-amber-50 text-amber-600 font-semibold"
                              : "text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                          }
                        `}
                      >
                        <User size={18} />
                        <span>Trang cá nhân</span>
                        {hasUnreadNotification && (
                          <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
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
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                    whitespace-nowrap text-sm font-medium shadow-sm
                    ${
                      isActiveLink("/login")
                        ? "bg-amber-600 text-white ring-2 ring-amber-300"
                        : "bg-amber-500 text-white hover:bg-amber-600 hover:shadow-md"
                    }
                  `}
                >
                  <User size={18} />
                  <span>Đăng nhập</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Header */}
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
              className="w-[50px] h-[50px] object-cover rounded-lg"
              priority
            />
          </Link>

          <button
            onClick={toggleMenu}
            className="text-gray-700 hover:text-amber-500 transition-colors p-2 rounded-lg hover:bg-gray-50"
            aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-2 text-sm font-medium">
              <div className="mb-4">
                <SearchBarWithSuggestions />
              </div>

              <NavLink href="/productsAll" onClick={toggleMenu} className="w-full text-left">
                Sản phẩm
              </NavLink>

              <NavLink href="/blog" onClick={toggleMenu} className="w-full text-left">
                Tin tức
              </NavLink>

              <NavLink href="/about" onClick={toggleMenu} className="w-full text-left">
                Giới thiệu
              </NavLink>

              <Link
                href="/cart"
                onClick={toggleMenu}
                className={`
                  flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 relative
                  ${
                    isActiveLink("/cart")
                      ? "bg-amber-50 text-amber-600 font-semibold shadow-sm"
                      : "text-gray-700 hover:text-amber-500 hover:bg-gray-50"
                  }
                `}
              >
                <ShoppingCart size={20} />
                <span>Giỏ hàng</span>
                {cartCount > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold shadow-md">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="border-t pt-4 mt-2">
                  <div className="flex items-center gap-3 mb-3 px-3 py-2 rounded-lg bg-gray-50">
                    <div className="relative">
                      <Image
                        src={user.avatar || "/img/default-avatar.jpg"}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="rounded-full ring-2 ring-amber-500"
                      />
                      {hasUnreadNotification && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={toggleMenu}
                    className={`
                      flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-200
                      ${
                        isActiveLink("/profile")
                          ? "bg-amber-50 text-amber-600 font-semibold shadow-sm"
                          : "text-gray-700 hover:text-amber-500 hover:bg-gray-50"
                      }
                    `}
                  >
                    <User size={18} />
                    <span>Trang cá nhân</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors mt-1"
                  >
                    <LogOut size={18} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={toggleMenu}
                  className={`
                    flex items-center gap-2 py-2 px-4 rounded-lg transition-all duration-200
                    justify-center mt-2 shadow-sm
                    ${
                      isActiveLink("/login")
                        ? "bg-amber-600 text-white ring-2 ring-amber-300"
                        : "bg-amber-500 text-white hover:bg-amber-600"
                    }
                  `}
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
