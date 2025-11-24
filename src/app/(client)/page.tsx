"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import CategoryGrid from "@components/client/category/CategoryGrid";
import CategorySection from "@components/client/category/CategorySection";
import AdImage from "@components/common/AdImage";
import BlogSection from "@components/client/blog/BlogSection";

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

  const adImages = ["/img/ad1.jpg", "/img/ad2.jpg", "/img/ad1.jpg"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

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
    <div>
      {/* Slider */}
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
          className="absolute left-10 top-1/2 transform -translate-y-1/2 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
        >
          ‹
        </button>
        <button
          onClick={() => goToSlide((currentSlide + 1) % slides.length)}
          className="absolute right-10 top-1/2 transform -translate-y-1/2 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
        >
          ›
        </button>
      </section>
      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* Category Grid */}
        <CategoryGrid categories={data.categories} />

        {/* Category Sections */}
        <section className="space-y-12">
          {data.categories.map((category: any, index: number) => (
            <div key={category._id}>
              <CategorySection
                category={category}
                products={data.productsByCategory[category.name] || []}
              />

              {/* Hiển thị ảnh sau mỗi 2 category */}
              {(index + 1) % 2 === 0 && adImages[(index / 2) | 0] && (
                <AdImage src={adImages[(index / 2) | 0]} />
              )}
            </div>
          ))}
        </section>

        {/* Blog Section - Thêm trước phần liên hệ */}
        <BlogSection />

        {/* Form thu thập ý kiến - Đặt ở cuối trang */}
        <section className="mt-16 bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Gửi ý kiến đóng góp của bạn</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Xử lý submit: Có thể gửi API, email, hoặc console.log tạm thời
              const formData = new FormData(e.currentTarget);
              console.log("Ý kiến:", {
                email: formData.get("email"),
                message: formData.get("message"),
              });
              alert("Cảm ơn bạn đã gửi ý kiến! Chúng tôi sẽ phản hồi sớm.");
              e.currentTarget.reset(); // Reset form sau submit
            }}
            className="max-w-md mx-auto space-y-4"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email (tùy chọn)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Nhập email của bạn"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Ý kiến của bạn
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                placeholder="Hãy chia sẻ suy nghĩ của bạn về sản phẩm hoặc trang web..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-amber-500 text-white py-2 px-4 rounded-md hover:bg-amber-600 transition-colors font-medium"
            >
              Gửi ý kiến
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Ý kiến của bạn giúp chúng tôi cải thiện tốt hơn!
          </p>
        </section>
      </div>
    </div>
  );
}
