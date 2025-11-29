"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Section {
  title: string;
  image: string;
  imagePosition: "left" | "right";
  content: string;
}

interface About {
  _id: string;
  name: string;
  img: string;
  slug: string;
  description: string;
  heroTitle?: string;
  heroSubtitle?: string;
  introSection?: string;
  sections?: Section[];
  closingSection?: string;
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/about`);
        if (!res.ok) {
          throw new Error("Lỗi khi fetch about");
        }
        const result: AboutData = await res.json();
        if (result.success) {
          setAbout(result.data);
        } else {
          setError("Lỗi không xác định");
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !about) {
    return (
      <div className="text-center py-8 text-red-500">
        Lỗi: {error || "Không tìm thấy thông tin"}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section với text overlay */}
      <div className="relative w-full h-[350px] md:h-[450px] lg:h-[500px]">
        <Image fill src={about.img} alt={about.name} className="object-cover" priority />
        <div className="absolute inset-0  bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 drop-shadow-lg">
              {about.heroTitle || about.name}
            </h1>
            <p className="text-sm md:text-lg lg:text-xl drop-shadow-lg">
              {about.heroSubtitle || about.description}
            </p>
          </div>
        </div>
      </div>

      {/* Intro Section - Full width với background */}
      {about.introSection && (
        <div className="w-full bg-linear-to-b from-gray-50 to-white py-12">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center" dangerouslySetInnerHTML={{ __html: about.introSection }} />
          </div>
        </div>
      )}

      {/* Sections with alternating layout - NO GAPS */}
      {about.sections && about.sections.length > 0 && (
        <div className="w-full">
          {about.sections.map((section, index) => (
            <div key={index} className={`w-full ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 items-center">
                  {/* Image Column */}
                  <div
                    className={`relative h-[300px] md:h-[400px] lg:h-[450px] ${
                      section.imagePosition === "right" ? "md:order-2" : "md:order-1"
                    }`}
                  >
                    <Image fill src={section.image} alt={section.title} className="object-cover" />
                  </div>

                  {/* Content Column */}
                  <div
                    className={`flex items-center ${
                      section.imagePosition === "right" ? "md:order-1" : "md:order-2"
                    }`}
                  >
                    <div className="w-full px-4 md:px-6 lg:px-8 py-6 md:py-6">
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-gray-800">
                        {section.title}
                      </h2>
                      <div
                        className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Closing Section - Full width với background đặc biệt */}
      {about.closingSection && (
        <div className="w-full bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div dangerouslySetInnerHTML={{ __html: about.closingSection }} />
          </div>
        </div>
      )}
    </div>
  );
}
