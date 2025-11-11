"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import CategoryGrid from "../../components/client/category/CategoryGrid";
import CategorySection from "../../components/client/category/CategorySection";

interface Category {
  _id: string;
  name: string;
  img: string;
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

interface HomeData {
  categories: Category[];
  productsByCategory: { [key: string]: Product[] };
}

export default function Home() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image: "/img/slider-1.jpg",
      title: "Khám phá Sản phẩm May Tinh Xảo",
      subtitle: "Handmade từ trái tim 💛",
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/client/home");
        if (!res.ok) {
          throw new Error("Lỗi khi fetch data");
        }
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || "Lỗi không xác định");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Lỗi: {error}</div>;
  }

  if (!data) {
    return <div className="text-center py-8">Không có data</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-12">Trang chính - NhaMayMan-Hanh 💛</h1>

      {/* Slider */}
      <section className="relative mb-12 overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full flex-shrink-0 relative">
              <Image
                width={1200}
                height={400}
                src={slide.image}
                alt={slide.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h2 className="text-2xl md:text-4xl font-bold mb-2">{slide.title}</h2>
                  <p className="text-lg md:text-xl mb-4">{slide.subtitle}</p>
                  <Link
                    href={slide.link}
                    className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    Khám phá ngay
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentSlide === index ? "bg-white" : "bg-white bg-opacity-50"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => goToSlide((currentSlide - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
        >
          ‹
        </button>
        <button
          onClick={() => goToSlide((currentSlide + 1) % slides.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
        >
          ›
        </button>
      </section>

      {/* Category Grid */}
      <CategoryGrid categories={data.categories} />

      {/* Category Sections */}
      <section className="space-y-12">
        {data.categories.map((category) => (
          <CategorySection
            key={category._id}
            category={category}
            products={data.productsByCategory[category.name] || []}
          />
        ))}
      </section>
    </div>
  );
}
