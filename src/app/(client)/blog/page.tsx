// app/(client)/blog/page.tsx (Danh sách blogs - fetch /api/client/blogs)
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Blog {
  _id: string;
  name: string;
  img: string;
  slug: string;
  description: string;
}

interface BlogsData {
  success: boolean;
  data: Blog[];
}

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/client/blogs");
        if (!res.ok) {
          throw new Error("Lỗi khi fetch blogs");
        }
        const result: BlogsData = await res.json();
        if (result.success) {
          setBlogs(result.data);
        } else {
          setError("Lỗi không xác định");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Đang tải blogs...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Lỗi: {error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Tin tức - NhaMayMan-Hanh</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
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
    </div>
  );
}
