"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface About {
  _id: string;
  name: string;
  img: string;
  slug: string;
  description: string;
  content: string;
}

interface AboutData {
  success: boolean;
  data: About;
}

export default function AboutPage() {
  const [about, setAbout] = useState<About | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/client/about");
        if (!res.ok) {
          throw new Error("Lỗi khi fetch about");
        }
        const result: AboutData = await res.json();
        if (result.success) {
          setAbout(result.data);
        } else {
          setError(result.message || "Lỗi không xác định");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (error || !about) {
    return (
      <div className="text-center py-8 text-red-500">
        Lỗi: {error || "Không tìm thấy thông tin"}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Image
        width={0}
        height={0}
        src={about.img}
        alt={about.name}
        className="w-full h-64 object-cover rounded-lg mb-6"
      />
      <h1 className="text-3xl font-bold mb-4">{about.name}</h1>
      <p className="text-gray-600 mb-8">{about.description}</p>
      <div
        className="prose max-w-none" // Tailwind Typography cho HTML content đẹp
        dangerouslySetInnerHTML={{ __html: about.content }}
      />
    </div>
  );
}
