"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";

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
  const params = useParams();
  const slug = params.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/blogs/${slug}`);
        if (!res.ok) throw new Error("Lỗi khi fetch blog");

        const result: BlogData = await res.json();
        if (result.success) setBlog(result.data);
        else setError("Lỗi không xác định");
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) return <div className="text-center py-8">Đang tải bài viết...</div>;
  if (error || !blog) return notFound();

  return (
    <div className="max-w-6xl flex flex-col items-center mx-auto py-12 px-4 ">
      {/* <Image
        width={500}
        height={300}
        src={blog.img}
        alt={blog.name}
        className="object-cover rounded-lg mb-6"
      /> */}
      <h1 className="text-3xl font-bold mb-4">{blog.name}</h1>
      <p className="text-gray-600 mb-2">{blog.description}</p>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
    </div>
  );
}
