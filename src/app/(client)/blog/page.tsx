"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import apiRequest from "@lib/api/index";
import getErrorMessage from "@utils/getErrorMessage";
import { Loading } from "@components/common/Loading";
import type { Blog } from "./type";
import type { ApiResponse } from "@app/(client)/types";

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const result = await apiRequest.get<ApiResponse<Blog[]>>("/client/blogs", {
          noAuth: true,
        });

        if (result.success) {
          setBlogs(result.data);
        } else {
          setError(result.message || "Lỗi không xác định");
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="max-w-6xl min-h-screen mx-auto py-12 px-4">
      {loading && (
        <div className="py-12">
          <Loading message="Chờ chút xíu..." size="md" />
        </div>
      )}

      {!loading && error && <div className="text-center py-8 text-red-500">Lỗi: {error}</div>}

      {!loading && blogs && (
        <>
          <h1 className="text-3xl font-bold text-center mb-8">Tin tức - NhaMayMan-Hanh</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog: Blog) => (
              <Link
                key={blog._id}
                href={`/blog/${blog.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Image
                  width={300}
                  height={300}
                  src={blog.img}
                  alt={blog.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="font-semibold text-gray-900 mb-2">{blog.name}</h2>
                  <p className="text-gray-600 mb-4">{blog.description}</p>
                  <span className="text-amber-500 font-medium">Đọc thêm →</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
