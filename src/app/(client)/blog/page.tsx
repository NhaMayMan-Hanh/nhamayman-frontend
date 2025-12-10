// export const dynamic = "force-dynamic";

import BlogBox from "@components/client/blog/BlogBox";
import apiRequest from "@lib/api/index";
import getErrorMessage from "@utils/getErrorMessage";
import type { Blog } from "./type";
import type { ApiResponse } from "@app/(client)/types";

// Metadata SEO cho trang Blog
export const metadata = {
  title: "Tin tức & Bài viết | NhaMayMan - Bánh & đồ handmade",
  description:
    "Tổng hợp tin tức, chia sẻ kinh nghiệm làm bánh handmade, thú bông, đồ trang trí và sản phẩm thủ công chất lượng từ NhaMayMan - Hanh.",
  keywords: [
    "bài viết handmade",
    "tin tức handmade",
    "bánh handmade",
    "đồ thủ công",
    "NhaMayMan Hanh",
    "chia sẻ kinh nghiệm làm bánh",
    "sản phẩm thủ công",
  ],
  openGraph: {
    title: "Tin tức & Bài viết | NhaMayMan",
    description:
      "Đọc các bài viết mới nhất về bánh handmade, đồ thủ công, mẹo vặt và câu chuyện ý nghĩa từ NhaMayMan - Hanh.",
    url: "https://nhamayman-hanh.io.vn/blog",
    siteName: "NhaMayMan - Hanh",
    type: "website",
    images: [
      {
        url: "https://nhamayman-hanh.io.vn/og/image-15.jpg",
        width: 1200,
        height: 630,
        alt: "Tin tức & bài viết handmade - NhaMayMan - Hanh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tin tức & Bài viết | NhaMayMan",
    description:
      "Tổng hợp tin tức, chia sẻ kinh nghiệm và các bài viết hữu ích về bánh handmade và sản phẩm thủ công.",
    images: ["https://nhamayman-hanh.io.vn/og/image-15.jpg"],
  },
  alternates: {
    canonical: "https://nhamayman-hanh.io.vn/blog",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function BlogListPage() {
  let blogs: Blog[] | null = null;
  let error: string | null = null;

  try {
    const result = await apiRequest.get<ApiResponse<Blog[]>>("/client/blogs", {
      noAuth: true,
    });

    if (result.success) {
      blogs = result.data;
    } else {
      error = result.message || "Lỗi không xác định";
    }
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <div className="max-w-6xl min-h-screen mx-auto py-12 px-4">
      {error && <div className="text-center py-8 text-red-500 text-lg">Lỗi: {error}</div>}

      {!error && blogs && (
        <>
          <h1 className="text-3xl font-bold text-center mb-8">Tin tức - NhaMayMan-Hanh</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog: Blog) => (
              <BlogBox key={blog._id} blog={blog} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
