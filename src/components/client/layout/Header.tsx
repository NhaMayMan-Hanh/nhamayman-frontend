"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Search } from "lucide-react";
import { useAuth } from "@contexts/AuthContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect với search query
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const truncatedName = user?.name.length > 12 ? user.name.slice(0, 12) + "..." : user?.name;

  return (
    <header className="w-full border-b border-gray-200 bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-4 lg:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-amber-500 hover:text-amber-600 transition-colors"
        >
          <Image src="/img/logo-hanh.jpg" alt="Logo" width={70} height={70} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative flex items-center gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-48"
            />
            <button
              type="submit"
              className="p-2 text-gray-500 hover:text-amber-500 transition-colors"
            >
              <Search size={20} />
            </button>
          </form>

          <Link
            href="/blog"
            className="text-gray-700 hover:text-amber-500 transition-colors px-2 py-1"
          >
            Blog
          </Link>
          <Link
            href="/about"
            className="text-gray-700 hover:text-amber-500 transition-colors px-2 py-1"
          >
            Giới thiệu
          </Link>
          <Link
            href="/cart"
            className="relative text-gray-700 hover:text-amber-500 transition-colors flex items-center gap-1"
          >
            🛒 Giỏ hàng
            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              0 {/* TODO: Kết nối cart count */}
            </span>
          </Link>

          {/* Conditional Login/User */}
          {user ? (
            <div className="flex items-center gap-2">
              <Image
                src={user.avatar || "/img/default-avatar.jpg"}
                alt={user.name}
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-sm">{truncatedName}</span>
              <button
                onClick={logout}
                className="text-gray-700 hover:text-amber-500 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="text-gray-700 hover:text-amber-500 transition-colors px-2 py-1"
            >
              Đăng nhập
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-700 hover:text-amber-500 transition-colors p-2"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-lg md:hidden">
            <nav className="flex flex-col items-start gap-4 py-4 px-4 text-sm font-medium">
              <form onSubmit={handleSearch} className="w-full relative mb-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button type="submit" className="absolute right-2 top-2">
                  <Search size={20} />
                </button>
              </form>
              <Link
                href="/products"
                className="text-gray-700 hover:text-amber-500 transition-colors w-full py-2"
                onClick={toggleMenu}
              >
                Sản phẩm
              </Link>
              <Link
                href="/blog"
                className="text-gray-700 hover:text-amber-500 transition-colors w-full py-2"
                onClick={toggleMenu}
              >
                Blog
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-amber-500 transition-colors w-full py-2"
                onClick={toggleMenu}
              >
                Giới thiệu
              </Link>
              <Link
                href="/cart"
                className="text-gray-700 hover:text-amber-500 transition-colors flex items-center gap-2 w-full py-2"
                onClick={toggleMenu}
              >
                🛒 Giỏ hàng
              </Link>
              {user ? (
                <div className="flex items-center gap-2 w-full py-2 border-t pt-2">
                  <Image
                    src={user.avatar || "/img/default-avatar.jpg"}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="text-sm">{truncatedName}</span>
                  <button onClick={logout} className="text-red-500 ml-auto">
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-amber-500 transition-colors w-full py-2 border-t pt-2"
                  onClick={toggleMenu}
                >
                  Đăng nhập
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
