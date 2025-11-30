"use client";

import { useRef, useState } from "react";
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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.offsetWidth * 0.8;
    const delta = direction === "left" ? -scrollAmount : scrollAmount;
    sliderRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Ngăn click khi đang kéo
  const handleClick = (e: React.MouseEvent, slug: string) => {
    if (isDragging) {
      e.preventDefault();
      return;
    }
  };

  // Kiểm tra nếu ít hơn hoặc bằng 4 items thì căn giữa, từ 5 trở lên cho scroll
  const shouldCenter = categories.length <= 4;

  return (
    <section className="mb-8 md:mb-12 relative">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h2 className="text-xl md:text-3xl font-semibold">Danh mục sản phẩm</h2>
      </div>

      {/* Arrow buttons - Chỉ hiện khi có nhiều hơn 4 items trên desktop */}
      {!shouldCenter && (
        <>
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
        </>
      )}

      {/* Category Slider Container */}
      <div className={`w-full relative ${shouldCenter ? "" : "px-0 lg:px-12"}`}>
        <div
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`flex gap-3 md:gap-4 lg:gap-6 select-none ${
            shouldCenter
              ? "justify-center flex-wrap"
              : "overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory"
          }`}
          style={{ cursor: shouldCenter ? "default" : "grab" }}
        >
          {categories.length > 0 ? (
            categories.map((category) => (
              <div
                key={category._id}
                className={`shrink-0 snap-start ${
                  shouldCenter
                    ? "w-[150px] sm:w-[180px] md:w-[200px] lg:w-[220px]"
                    : "w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)] md:w-[calc(25%-0.75rem)] lg:w-[220px]"
                }`}
              >
                <Link
                  href={`/products?category=${category.slug}`}
                  className="flex flex-col items-center p-3 md:p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 h-full"
                  onClick={(e) => handleClick(e, category.slug)}
                >
                  <div className="w-full aspect-square mb-2 md:mb-3 overflow-hidden rounded-lg">
                    <Image
                      width={220}
                      height={220}
                      src={category.img}
                      alt={category.name}
                      unoptimized
                      draggable={false}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 pointer-events-none"
                    />
                  </div>
                  <h3 className="font-light text-sm md:text-base text-center line-clamp-2">
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
