"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    image: "/img/slider-1.jpg",
    title: "Sản phẩm điêu khắc tinh xảo",
    subtitle: "Handmade từ trái tim",
    link: "/products?category=san-pham-da",
  },
  {
    image: "/img/slider-3.jpg",
    title: "Tranh Sơn Dầu Độc Đáo",
    subtitle: "Nghệ thuật lan tỏa yêu thương",
    link: "/products?category=tranh-son-dau",
  },
  {
    image: "/img/slider-2.jpg",
    title: "Bánh Handmade Ngọt Ngào",
    subtitle: "Quà tặng ý nghĩa cho mọi dịp",
    link: "/products?category=san-pham-banh",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0); // Thêm state này

  const sliderRef = useRef<HTMLDivElement>(null);

  // Đo chiều rộng container khi mount và khi resize
  useEffect(() => {
    const element = sliderRef.current;
    if (!element) return;

    const updateWidth = () => {
      setContainerWidth(element.offsetWidth);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, []);

  // Auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isDragging]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setDragOffset(0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);

    if (Math.abs(dragOffset) > 50) {
      if (dragOffset > 0) {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      } else {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    }
    setDragOffset(0);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const diff = e.pageX - startX;
    setDragOffset(diff);
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging) handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].pageX - startX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (isDragging) handleDragEnd();
  };

  // Tính transform - giờ đã an toàn vì không đọc ref trong render
  const getTransform = () => {
    const baseTranslate = -currentSlide * 100;
    const dragPercent = containerWidth ? (dragOffset / containerWidth) * 100 : 0;
    return `translateX(${baseTranslate + dragPercent}%)`;
  };

  return (
    <section className="relative mb-12 overflow-hidden rounded-lg select-none">
      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex transition-transform ease-in-out cursor-grab active:cursor-grabbing"
        style={{
          transform: getTransform(),
          transitionDuration: isDragging ? "0ms" : "500ms",
        }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full shrink-0 relative">
            <Image
              width={1200}
              height={400}
              src={slide.image}
              alt={slide.title}
              className="w-full h-64 md:h-96 object-cover pointer-events-none"
              priority={index === 0}
              draggable={false}
            />

            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="px-6 max-w-2xl text-center">
                <h2 className="text-white font-bold text-2xl md:text-4xl mb-3">{slide.title}</h2>
                <p className="text-white font-bold text-lg md:text-2xl mb-6">{slide.subtitle}</p>
                <Link
                  href={slide.link}
                  className="inline-block bg-amber-500 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-amber-600 transition"
                  onClick={(e) => isDragging && e.preventDefault()}
                >
                  Khám phá ngay
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`w-3 h-3 rounded-full transition ${
              currentSlide === i ? "bg-white" : "bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => goToSlide((currentSlide - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-12 h-12 rounded-full text-3xl flex items-center justify-center backdrop-blur-sm transition z-10"
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        onClick={() => goToSlide((currentSlide + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-12 h-12 rounded-full text-3xl flex items-center justify-center backdrop-blur-sm transition z-10"
        aria-label="Next slide"
      >
        ›
      </button>
    </section>
  );
}
