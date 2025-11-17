"use client";

import { useState, useEffect } from "react";
import BlogBox from "./BlogBox";

interface Blog {
  _id: string;
  name: string;
  img: string;
  slug: string;
  description: string;
}

interface BlogData {
  success: boolean;
  data: Blog[];
}

export default function BlogSection() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/client/blogs");
        if (!res.ok) throw new Error("Lỗi khi fetch blogs");

        const result: BlogData = await res.json();
        if (result.success) {
          // Lấy 4 blog đầu tiên
          setBlogs(result.data.slice(0, 4));
        } else {
          setError("Không thể tải blogs");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) return <div className="text-center py-8">Đang tải blogs...</div>;
  if (error || blogs.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-semibold mb-8 text-center">Tin tức & Câu chuyện</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {blogs.map((blog) => (
          <BlogBox key={blog._id} blog={blog} />
        ))}
      </div>
    </section>
  );
}
