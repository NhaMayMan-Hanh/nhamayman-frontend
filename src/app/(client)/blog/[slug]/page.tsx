"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import apiRequest from "@lib/api/index";
import getErrorMessage from "@utils/getErrorMessage";
import { Loading } from "@components/common/Loading";
import type { Blog } from "../type";
import type { ApiResponse } from "@app/(client)/types";

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const result = await apiRequest.get<ApiResponse<Blog>>(`/client/blogs/${slug}`, {
          noAuth: true,
        });

        if (result.success) {
          setBlog(result.data);
        } else {
          setError(result.message || "Lỗi không xác định");
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  return (
    <div className="max-w-6xl flex flex-col items-center mx-auto py-12">
      {loading && (
        <div className="py-12">
          <Loading message="Chờ chút xíu..." size="md" />
        </div>
      )}

      {!loading && error && <div className="text-center py-8 text-red-500">Lỗi: {error}</div>}

      {!loading && blog && (
        <>
          <h1 className="text-3xl font-bold mb-4">{blog.name}</h1>
          <p className="text-gray-600 mb-2">{blog.description}</p>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content || "" }}
          />
        </>
      )}
    </div>
  );
}
