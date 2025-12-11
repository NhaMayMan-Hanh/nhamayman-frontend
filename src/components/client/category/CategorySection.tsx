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
  slug: string;
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

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.offsetWidth * 0.8;
    const delta = direction === "left" ? -scrollAmount : scrollAmount;
    sliderRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="bg-white rounded-lg p-4 md:p-6 relative mb-8 md:mb-12">
      {/* Header */}
      <div className="flex flex-col border-b pb-2 border-gray-300 sm:flex-row justify-between items-start sm:items-center gap-3 mb-2 md:mb-6">
        <div className="flex-1">
          <h2 className="text-xl md:text-3xl font-semibold mb-1">{category.name}</h2>
          {category.description && (
            <p className="text-sm md:text-base  text-gray-600 line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
        <Link
          href={`/products?category=${category.slug}`}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors text-sm md:text-base whitespace-nowrap flex-shrink-0"
        >
          Xem tất cả ({products.length})
        </Link>
      </div>

      {/* Arrow buttons - Chỉ hiện trên desktop */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 z-10 hidden lg:block"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6 text-gray-600" />
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 z-10 hidden lg:block"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6 text-gray-600" />
      </button>

      {/* Product Slider Container */}
      <div className="w-full relative">
        <div
          ref={sliderRef}
          className="flex gap-3 md:gap-4 lg:gap-6 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory pb-2"
        >
          {products.length > 0 ? (
            products.slice(0, 8).map((product) => (
              <div
                key={product._id}
                className="shrink-0 w-full min-[425px]:w-[calc(50%-0.375rem)] md:w-[calc(33.333%-0.5rem)] lg:w-[250px] snap-start"
              >
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 w-full py-8">Chưa có sản phẩm</p>
          )}
        </div>
      </div>

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
