"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { notFound } from "next/navigation";

interface Blog {
  _id: string;
  name: string;
  img: string;
  slug: string;
  description: string;
  content: string;
}

interface BlogData {
  success: boolean;
  data: Blog;
}

export default function BlogDetailPage() {
  const params = useParams(); // ✅ Lấy slug đúng cách trong Client Component
  const slug = params.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/client/blogs/${slug}`);
        if (!res.ok) throw new Error("Lỗi khi fetch blog");

        const result: BlogData = await res.json();
        if (result.success) setBlog(result.data);
        else setError(result.message || "Lỗi không xác định");
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) return <div className="text-center py-8">Đang tải bài viết...</div>;
  if (error || !blog) return notFound(); // ✅ trả về 404 đúng chuẩn Next

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <img src={blog.img} alt={blog.name} className="w-full h-64 object-cover rounded-lg mb-6" />
      <h1 className="text-3xl font-bold mb-4">{blog.name}</h1>
      <p className="text-gray-600 mb-8">{blog.description}</p>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
    </div>
  );
}
