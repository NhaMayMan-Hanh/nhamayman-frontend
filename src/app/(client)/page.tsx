// export const dynamic = "force-dynamic";

import { Loading } from "@components/common/Loading";
import HeroSlider from "@components/client/home/HeroSlider";
import FeedbackForm from "@components/client/home/FeedbackForm";
import CategoryGrid from "@components/client/category/CategoryGrid";
import CategorySection from "@components/client/category/CategorySection";
import PhotoGalleryBanner from "@components/client/home/PhotoGalleryBanner";
import { galleryBanners } from "@data/galleryData";
import BlogSection from "@components/client/blog/BlogSection";
import apiRequest from "@lib/api/index";
import getErrorMessage from "@utils/getErrorMessage";
import type { ApiResponse, Category, Product, Blog } from "./types";

export const metadata = {
  title: "Trang chủ",
  description:
    "Bánh handmade tươi ngon mỗi ngày – chọn lọc nguyên liệu sạch. của Nha May Man - Hanh",
};

interface HomeData {
  categories: Category[];
  productsByCategory: { [key: string]: Product[] };
  homeBlogs: Blog[];
}

export default async function HomePage() {
  let data: HomeData | null = null;
  let error: string | null = null;

  console.log("HOME RUN ON SERVER");

  try {
    const result = await apiRequest.get<ApiResponse<HomeData>>("/client/home", {
      noAuth: true,
    });
    if (result.success) data = result.data;
    else error = result.message || "Lỗi tải dữ liệu";
  } catch (err) {
    error = getErrorMessage(err);
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600 text-xl">Lỗi: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Đang tải dữ liệu..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeroSlider />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <CategoryGrid categories={data.categories} />

        <div className="space-y-16 mt-16">
          {data.categories.map((category, index) => (
            <div key={category._id}>
              <CategorySection
                category={category}
                products={data.productsByCategory[category.name] || []}
              />

              {/* Gallery Banner sau mỗi 2 danh mục */}
              {(index + 1) % 2 === 0 && galleryBanners[Math.floor(index / 2)] && (
                <div className="my-12">
                  <PhotoGalleryBanner
                    images={galleryBanners[Math.floor(index / 2)]}
                    title={`Khoảnh khắc ${Math.floor(index / 2) + 1}`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <BlogSection blogs={data.homeBlogs} />
        <FeedbackForm />
      </div>
    </div>
  );
}
