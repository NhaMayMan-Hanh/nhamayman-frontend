"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  img: string;
  slug: string;
  description?: string;
}

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  // Hàm scroll qua trái/phải khi click arrow
  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const cardWidth = 250; // Chiều rộng mỗi category box trên desktop
    const gap = 24; // gap-6 = 24px
    const scrollAmount = cardWidth * 4 + gap * 3; // Scroll đúng 4 items (1072px)
    const delta = direction === "left" ? -scrollAmount : scrollAmount;
    sliderRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="mb-12 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Danh mục sản phẩm</h2>
        {/* Có thể thêm link "Xem tất cả" nếu cần, nhưng hiện tại không có */}
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

      {/* Category Slider Container - Giới hạn width để hiển thị đúng 4 items trên desktop */}
      <div className="w-full max-w-[1072px] mx-auto relative">
        <div
          ref={sliderRef}
          className="flex justify-center gap-4 md:gap-6 overflow-x-auto scroll-smooth scrollbar-hide cursor-grab active:cursor-grabbing md:[&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category._id} className="w-[120px] md:w-[180px] flex shrink-0">
                <Link
                  href={`/products?category=${category.slug}`}
                  className="flex flex-col items-center p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow w-full"
                >
                  <Image
                    width={150}
                    height={150}
                    src={category.img}
                    alt={category.name}
                    className="w-full h-32 md:h-40 object-cover mb-3 rounded-lg"
                  />
                  <h3 className="font-bold text-sm md:text-base mb-1">{category.name}</h3>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 w-full">Chưa có danh mục</p>
          )}
        </div>
      </div>

      {/* Custom scrollbar ẩn */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
