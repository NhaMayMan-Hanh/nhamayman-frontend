// export const dynamic = "force-dynamic";

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
import { LoadingPage } from "@components/ui/Loading";

export const metadata = {
  title: "Trang chủ | Bánh Handmade – Thú Bông, Tranh & Đồ Thủ Công | NhaMayMan - Hanh",
  description:
    "Chuyên bánh handmade tươi ngon, thú bông thủ công, tranh trang trí và sản phẩm đá độc đáo. Tất cả đều làm bằng tay tỉ mỉ, mang sự ấm áp và yêu thương đến mọi nhà – NhaMayMan - Hanh.",
  keywords: [
    "bánh handmade",
    "quà handmade",
    "đồ handmade",
    "thú bông handmade",
    "tranh handmade",
    "đá handmade",
    "bánh tươi mỗi ngày",
    "quà tặng thủ công",
  ],
  openGraph: {
    title: "Bánh Handmade – Thú Bông, Tranh & Đồ Thủ Công | NhaMayMan - Hanh",
    description:
      "Bánh handmade tươi ngon, thú bông, tranh trang trí và sản phẩm đá nhỏ – tất cả được làm thủ công tỉ mỉ. Sự ấm áp từ những món quà handmade độc nhất.",
    url: "https://nhamayman-hanh.io.vn",
    siteName: "NhaMayMan - Hanh",
    images: [
      {
        url: "https://nhamayman-hanh.io.vn/og/may-8.jpg",
        width: 1200,
        height: 630,
        alt: "Bánh handmade & sản phẩm thủ công – NhaMayMan - Hanh",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  alternates: {
    canonical: "https://nhamayman-hanh.io.vn",
  },
};

interface HomeData {
  categories: Category[];
  productsByCategory: { [key: string]: Product[] };
  homeBlogs: Blog[];
}

export default async function HomePage() {
  let data: HomeData | null = null;
  let error: string | null = null;

  // console.log("HOME RUN ON SERVER");

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
        <LoadingPage message="Đang tải trang..." />
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
                    title={`Dự Án Truyền Thông Gõ Cửa`}
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
