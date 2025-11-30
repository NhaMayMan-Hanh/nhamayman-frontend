"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Search, ShoppingCart, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import { useCart } from "@contexts/CartContext";
import SearchBarWithSuggestions from "@components/client/search/SearchBarWithSuggestions";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
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
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const truncatedName =
    user?.name && user.name.length > 12 ? user.name.slice(0, 12) + "..." : user?.name;

  return (
    <header className="w-full border-b border-gray-200 header-client shadow-sm sticky top-0 z-50 bg-white">
      {/* Fixed height container to prevent layout shift */}
      <div className="max-w-6xl mx-auto h-[90px] flex items-center justify-between py-4 px-4 md:px-2">
        {/* Logo - Fixed dimensions */}
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

        {/* Desktop Navigation - Fixed height and minimum width */}
        <nav className="hidden md:flex items-center gap-3 text-sm font-medium h-14 shrink-0">
          {/* Search Input - Fixed width with icon inside */}
          {/* <form onSubmit={handleSearch} className="relative shrink-0">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-72 h-10"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-amber-500 transition-colors h-8 w-8 flex items-center justify-center"
            >
              <Search size={20} />
            </button>
          </form> */}
          <SearchBarWithSuggestions />

          {/* Navigation Links - Fixed spacing */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/blog"
              className="text-gray-700 hover:text-amber-500 transition-colors px-2 py-1 whitespace-nowrap"
            >
              Tin tức
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-amber-500 transition-colors px-2 py-1 whitespace-nowrap"
            >
              Giới thiệu
            </Link>
            <Link
              href="/productsAll"
              className="text-gray-700 hover:text-amber-500 transition-colors px-2 py-1 whitespace-nowrap"
              onClick={toggleMenu}
            >
              Sản phẩm
            </Link>
          </div>

          {/* Cart with Badge - Fixed dimensions */}
          <Link
            href="/cart"
            className="relative text-gray-700 hover:text-amber-500 transition-colors flex items-center gap-2 px-2 py-1 shrink-0 whitespace-nowrap"
          >
            <ShoppingCart size={20} />
            <span>Giỏ hàng</span>
            {/* Reserve space for badge to prevent shift */}
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center">
              {cartCount > 0 && (
                <span className="bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </span>
          </Link>

          {/* User Profile or Login - Fixed minimum width */}
          {user ? (
            <div className="relative shrink-0" ref={profileRef}>
              <button
                onClick={toggleProfile}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors h-10 min-w-[120px]"
              >
                <Image
                  src={user.avatar || "/img/default-avatar.jpg"}
                  alt={user.name || "User avatar"}
                  width={32}
                  height={32}
                  className="rounded-full ring-2 ring-amber-500 shrink-0"
                  priority
                />
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-20">
                  {truncatedName}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform w-4 h-4 shrink-0 ${
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
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors h-10 shrink-0 whitespace-nowrap"
            >
              <User size={18} />
              <span>Đăng nhập</span>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button - Fixed size */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-700 hover:text-amber-500 transition-colors p-2 w-10 h-10 flex items-center justify-center shrink-0"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-lg md:hidden z-40">
            <nav className="flex flex-col items-start gap-2 py-4 px-4 text-sm font-medium">
              {/* <form onSubmit={handleSearch} className="w-full relative mb-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 text-gray-500 hover:text-amber-500"
                >
                  <Search size={20} />
                </button>
              </form> */}
              <SearchBarWithSuggestions />
              <Link
                href="/productsAll"
                className="text-gray-700 hover:text-amber-500 transition-colors w-full py-2 px-2 rounded hover:bg-gray-50"
                onClick={toggleMenu}
              >
                Sản phẩm
              </Link>

              <Link
                href="/blog"
                className="text-gray-700 hover:text-amber-500 transition-colors w-full py-2 px-2 rounded hover:bg-gray-50"
                onClick={toggleMenu}
              >
                Tin tức
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-amber-500 transition-colors w-full py-2 px-2 rounded hover:bg-gray-50"
                onClick={toggleMenu}
              >
                Giới thiệu
              </Link>
              <Link
                href="/cart"
                className="text-gray-700 hover:text-amber-500 transition-colors flex items-center gap-2 w-full py-2 px-2 rounded hover:bg-gray-50 relative"
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
                <div className="w-full border-t pt-4 mt-2">
                  <div className="flex items-center gap-3 mb-3 px-2">
                    <Image
                      src={user.avatar || "/img/default-avatar.jpg"}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-full ring-2 ring-amber-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 w-full py-2 px-2 rounded hover:bg-gray-50 text-gray-700 hover:text-amber-500 transition-colors"
                    onClick={toggleMenu}
                  >
                    <User size={18} />
                    <span>Trang cá nhân</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full py-2 px-2 rounded hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 w-full py-2 px-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors justify-center mt-2"
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
