"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import apiRequest from "@lib/api/index";
import { ApiResponse } from "@app/(client)/types";

interface ProductSuggestion {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export default function SearchBarWithSuggestions() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Tìm kiếm gợi ý khi gõ
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiRequest.get<ApiResponse<any[]>>(
          `/client/products?search=${encodeURIComponent(query)}`,
          { noAuth: true }
        );
        if (res.success && Array.isArray(res.data)) {
          setSuggestions(res.data.slice(0, 6));
          setShowSuggestions(true);
        } else if (Array.isArray(res)) {
          // Trường hợp API trả về array trực tiếp
          setSuggestions(res.slice(0, 6));
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        console.error("Search error:", err);
        // Không hiển thị lỗi cho user khi tìm kiếm suggestions
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // Đóng khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      window.location.href = `/productsAll?search=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="relative"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Tìm kiếm sản phẩm"
          className="w-full pl-12 pr-40 py-3 text-sm rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
        />

        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            className="absolute right-36 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <button
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-full font-medium transition"
        >
          Tìm kiếm
        </button>
      </form>

      {/* Gợi ý */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
            </div>
          ) : suggestions.length === 0 ? (
            <p className="p-6 text-center text-gray-500">Không tìm thấy sản phẩm</p>
          ) : (
            <>
              {suggestions.map((product) => (
                <Link
                  key={product._id}
                  href={`/products/${product._id}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition border-b border-gray-200 last:border-0"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = "/img/no-image.jpg";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-amber-600 font-bold">
                        {product.price.toLocaleString()}₫
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              <div className="p-4 bg-gray-50 text-center border-t">
                <Link
                  href={`/productsAll?search=${encodeURIComponent(query)}`}
                  onClick={() => setShowSuggestions(false)}
                  className="text-amber-600 font-medium hover:underline"
                >
                  Xem tất cả kết quả cho &quot;{query}&quot;
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
