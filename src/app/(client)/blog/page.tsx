export const dynamic = "force-dynamic";

import BlogBox from "@components/client/blog/BlogBox";
import apiRequest from "@lib/api/index";
import getErrorMessage from "@utils/getErrorMessage";
import type { Blog } from "./type";
import type { ApiResponse } from "@app/(client)/types";

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
