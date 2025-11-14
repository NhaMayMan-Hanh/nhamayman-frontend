"use client";

import { useRef } from "react";
import ProductCard from "../product/ProductCard";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

interface CategorySectionProps {
  category: Category;
  products: Product[];
}

export default function CategorySection({ category, products }: CategorySectionProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  // Hàm scroll qua trái/phải khi click arrow
  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const cardWidth = 250; // Chiều rộng mỗi card
    const gap = 24; // gap-6 = 24px
    const scrollAmount = cardWidth * 4 + gap * 3; // Scroll đúng 4 sản phẩm (1072px)
    const delta = direction === "left" ? -scrollAmount : scrollAmount;
    sliderRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">{category.name}</h2>
          <p className="text-gray-600">{category.description}</p>
        </div>
        <Link
          href={`/products?category=${category.slug}`}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
        >
          Xem tất cả ({products.length})
        </Link>
      </div>

      {/* Arrow buttons - Chỉ hiện trên desktop */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 z-10 hidden md:block"
      >
        <ChevronLeft className="w-6 h-6 text-gray-600" />
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 z-10 hidden md:block"
      >
        <ChevronRight className="w-6 h-6 text-gray-600" />
      </button>

      {/* Product Slider Container - Giới hạn width để hiển thị đúng 4 sản phẩm trên desktop, responsive trên mobile */}
      <div className="w-full max-w-[1072px] mx-auto relative">
        <div
          ref={sliderRef}
          className="flex gap-4  md:gap-6 overflow-x-auto scroll-smooth scrollbar-hide cursor-grab active:cursor-grabbing md:[&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.length > 0 ? (
            products.slice(0, 8).map((product) => (
              <div key={product._id} className="w-[220px] md:w-[250px] flex shrink-0">
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 w-full">Chưa có sản phẩm</p>
          )}
        </div>
      </div>

      {/* Custom scrollbar ẩn - Tăng cường cho Webkit */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
