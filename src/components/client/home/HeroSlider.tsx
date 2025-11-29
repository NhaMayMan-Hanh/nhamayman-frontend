"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    image: "/img/slider-1.jpg",
    title: "Khám phá Sản phẩm May Tinh Xảo",
    subtitle: "Handmade từ trái tim",
    link: "/products?category=san-pham-may",
  },
  {
    image: "/img/slider-2.jpg",
    title: "Tranh Sơn Dầu Độc Đáo",
    subtitle: "Nghệ thuật lan tỏa yêu thương",
    link: "/products?category=tranh-son-dau",
  },
  {
    image: "/img/slider-3.jpg",
    title: "Bánh Handmade Ngọt Ngào",
    subtitle: "Quà tặng ý nghĩa cho mọi dịp",
    link: "/products?category=san-pham-banh",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);

  return (
    <section className="relative mb-12 overflow-hidden rounded-lg">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full shrink-0 relative">
            <Image
              width={1200}
              height={400}
              src={slide.image}
              alt={slide.title}
              className="w-full h-64 md:h-96 object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white px-6 max-w-2xl">
                <h2 className="text-2xl md:text-4xl font-bold mb-3">{slide.title}</h2>
                <p className="text-lg md:text-2xl mb-6">{slide.subtitle}</p>
                <Link
                  href={slide.link}
                  className="inline-block bg-amber-500 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-amber-600 transition"
                >
                  Khám phá ngay
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3">
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
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-12 h-12 rounded-full text-3xl flex items-center justify-center backdrop-blur-sm transition"
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        onClick={() => goToSlide((currentSlide + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-12 h-12 rounded-full text-3xl flex items-center justify-center backdrop-blur-sm transition"
        aria-label="Next slide"
      >
        ›
      </button>
    </section>
  );
}
