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

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.offsetWidth * 0.8;
    const delta = direction === "left" ? -scrollAmount : scrollAmount;
    sliderRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="mb-8 md:mb-12 relative">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-semibold">Danh mục sản phẩm</h2>
      </div>

      {/* Arrow buttons - Chỉ hiện trên desktop */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 z-10 hidden lg:block"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6 text-gray-600" />
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 z-10 hidden lg:block"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6 text-gray-600" />
      </button>

      {/* Category Slider Container */}
      <div className="w-full relative px-0 lg:px-12">
        <div
          ref={sliderRef}
          className="flex gap-3 md:gap-4 lg:gap-6 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory"
        >
          {categories.length > 0 ? (
            categories.map((category) => (
              <div
                key={category._id}
                className="flex-shrink-0 w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)] md:w-[calc(25%-0.75rem)] lg:w-[250px] snap-start"
              >
                <Link
                  href={`/products?category=${category.slug}`}
                  className="flex flex-col items-center p-3 md:p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 h-full"
                >
                  <div className="w-full aspect-square mb-2 md:mb-3 overflow-hidden rounded-lg">
                    <Image
                      width={250}
                      height={250}
                      src={category.img}
                      alt={category.name}
                      unoptimized
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base text-center line-clamp-2">
                    {category.name}
                  </h3>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 w-full py-8">Chưa có danh mục</p>
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
    </section>
  );
}
