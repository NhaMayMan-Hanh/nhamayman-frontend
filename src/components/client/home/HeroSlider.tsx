"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

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
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Đo chiều rộng container
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
        setCurrentSlide((prev) => {
          // Khi đến slide cuối, quay về đầu
          if (prev === slides.length - 1) {
            return 0;
          }
          return prev + 1;
        });
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
      if (dragOffset > 0 && currentSlide > 0) {
        // Vuốt sang phải - về slide trước (chỉ khi không ở đầu)
        setCurrentSlide((prev) => prev - 1);
      } else if (dragOffset < 0 && currentSlide < slides.length - 1) {
        // Vuốt sang trái - sang slide sau (chỉ khi không ở cuối)
        setCurrentSlide((prev) => prev + 1);
      }
    }
    setDragOffset(0);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return; // Tắt mouse events trên mobile
    setIsDragging(true);
    setStartX(e.pageX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isMobile) return;
    e.preventDefault();
    const diff = e.pageX - startX;

    // Giới hạn drag offset để không kéo quá biên
    const maxDrag = containerWidth * 0.3;
    if ((currentSlide === 0 && diff > 0) || (currentSlide === slides.length - 1 && diff < 0)) {
      setDragOffset(Math.max(-maxDrag, Math.min(maxDrag, diff * 0.3)));
    } else {
      setDragOffset(diff);
    }
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging && !isMobile) handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].pageX - startX;

    // Giới hạn drag offset ở biên
    const maxDrag = containerWidth * 0.3;
    if ((currentSlide === 0 && diff > 0) || (currentSlide === slides.length - 1 && diff < 0)) {
      setDragOffset(Math.max(-maxDrag, Math.min(maxDrag, diff * 0.3)));
    } else {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) handleDragEnd();
  };

  // Tính transform
  const getTransform = () => {
    const baseTranslate = -currentSlide * 100;
    const dragPercent = containerWidth ? (dragOffset / containerWidth) * 100 : 0;
    return `translateX(${baseTranslate + dragPercent}%)`;
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
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
        className="flex transition-transform ease-out cursor-grab active:cursor-grabbing"
        style={{
          transform: getTransform(),
          transitionDuration: isDragging ? "0ms" : "600ms",
        }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full shrink-0 relative">
            <Image
              width={1200}
              height={600}
              src={slide.image}
              alt={slide.title}
              className="w-full h-64 md:h-96 object-cover pointer-events-none"
              draggable={false}
            />

            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-transparent flex items-center justify-center">
              <div className="px-6 max-w-2xl text-center">
                <h2 className="text-white font-bold text-2xl md:text-4xl mb-3 drop-shadow-lg">
                  {slide.title}
                </h2>
                <p className="text-white/95 font-semibold text-lg md:text-2xl mb-6 drop-shadow-md">
                  {slide.subtitle}
                </p>
                <a
                  href={slide.link}
                  className="inline-block bg-amber-500 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-amber-600 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  onClick={(e) => isDragging && e.preventDefault()}
                >
                  Khám phá ngay
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots - cải thiện UX */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`transition-all duration-300 rounded-full ${
              currentSlide === i ? "bg-white w-8 h-3" : "bg-white/60 hover:bg-white/80 w-3 h-3"
            }`}
            aria-label={`Chuyển đến slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Arrows - chỉ hiện trên desktop */}
      {!isMobile && (
        <>
          <button
            onClick={handlePrevious}
            disabled={currentSlide === 0}
            className={`absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white w-12 h-12 rounded-full text-3xl flex items-center justify-center transition-all duration-300 z-10 ${
              currentSlide === 0 ? "opacity-0 pointer-events-none" : "opacity-100 hover:scale-110"
            }`}
            aria-label="Slide trước"
          >
            ‹
          </button>
          <button
            onClick={handleNext}
            disabled={currentSlide === slides.length - 1}
            className={`absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white w-12 h-12 rounded-full text-3xl flex items-center justify-center transition-all duration-300 z-10 ${
              currentSlide === slides.length - 1
                ? "opacity-0 pointer-events-none"
                : "opacity-100 hover:scale-110"
            }`}
            aria-label="Slide tiếp theo"
          >
            ›
          </button>
        </>
      )}
    </section>
  );
}
