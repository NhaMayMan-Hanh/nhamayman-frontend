"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="w-full border-b border-gray-200 bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-4 lg:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-amber-500 hover:text-amber-600 transition-colors"
        >
          NhaMayMan-Hanh
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
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
            {/* Badge cho số lượng sản phẩm (có thể kết nối với state thực tế sau) */}
            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-center">
              0
            </span>
          </Link>
          <Link
            href="/login"
            className="text-gray-700 hover:text-amber-500 transition-colors px-2 py-1"
          >
            Đăng nhập
          </Link>
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
              <Link
                href="/login"
                className="text-gray-700 hover:text-amber-500 transition-colors w-full py-2"
                onClick={toggleMenu}
              >
                Đăng nhập
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
