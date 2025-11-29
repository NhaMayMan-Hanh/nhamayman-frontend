"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import type { BlogData, BlogDetailResponse } from "../types";
import { calculateReadTime, formatDate } from "../utils";
import Loading from "@components/admin/Loading";
import ErrorState from "@components/admin/ErrorState";
import apiRequest from "@lib/api";
const BlogDetail = () => {
   const params = useParams();
   const router = useRouter();
   const id = params?.id as string;

   const [blog, setBlog] = useState<BlogData | null>(null);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);

   const fetchBlogDetail = useCallback(async () => {
      try {
         setLoading(true);
         setError(null);
         const data = await apiRequest.get<BlogDetailResponse>(
            `/admin/blogs/${id}`
         );
         if (data.success) {
            setBlog(data.data);
         } else {
            setError(data.message || "Không tìm thấy bài viết");
         }
      } catch (err: any) {
         setError(err.message || "Lỗi khi tải bài viết");
         console.error("Fetch blog detail error:", err);
      } finally {
         setLoading(false);
      }
   }, [id]);

   useEffect(() => {
      if (id) {
         fetchBlogDetail();
      }
   }, [id]);

   const handleScrollToTop = useCallback(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
   }, []);

   if (loading) {
      return <Loading />;
   }

   if (error || !blog) {
      return (
         <ErrorState
            title="Không tìm thấy bài viết"
            message="Bài blog bạn đang tìm không tồn tại hoặc đã bị xóa."
            buttonText="Quay lại danh sách blog"
            redirect="/admin/blogs"
         />
      );
   }

   return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
         {/* Sticky Header */}
         <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
               <button
                  onClick={() => router.back()}
                  className="group flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-all duration-200 font-medium"
               >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Quay lại
               </button>
            </div>
         </div>

         {/* Main Content */}
         <article className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            {/* Hero Image with Gradient Overlay */}
            <div className="relative rounded-3xl overflow-hidden mb-8 lg:mb-12 group">
               <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent z-10"></div>
               <img
                  src={blog.img}
                  alt={blog.name}
                  className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
               />

               {/* Title Overlay on Image */}
               <div className="absolute bottom-0 left-0 right-0 z-20 p-6 sm:p-8 lg:p-10">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                     {blog.name}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white/90">
                     <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">
                           {formatDate(blog.createdAt)}
                        </span>
                     </div>
                     <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">
                           {calculateReadTime(blog.content)} phút đọc
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-12">
               {/* Description Highlight */}
               <div className="relative mb-10">
                  <div className="absolute -left-2 top-0 bottom-0 w-1 bg-linear-to-b from-pink-500 to-pink-600 rounded-full"></div>
                  <p className="text-lg sm:text-xl text-gray-700 leading-relaxed pl-6 italic font-light">
                     {blog.description}
                  </p>
               </div>

               {/* Blog Content */}
               <div
                  className="prose prose-lg max-w-none
                  prose-headings:font-bold prose-headings:tracking-tight
                  prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-gray-900 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-3
                  prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-pink-600
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base sm:prose-p:text-lg
                  prose-a:text-pink-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-all
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-ul:my-6 prose-ul:space-y-2 prose-li:text-gray-700
                  prose-ol:my-6 prose-ol:space-y-2
                  prose-blockquote:border-l-4 prose-blockquote:border-pink-500 prose-blockquote:bg-pink-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic
                  prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8
                  prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-sm"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
               />
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
               <button
                  onClick={() => router.push("/blogs")}
                  className="flex-1 bg-linear-to-r from-pink-500 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all duration-300 font-semibold text-center shadow-lg transform hover:-translate-y-0.5"
               >
                  Xem thêm bài viết
               </button>
               <button
                  onClick={handleScrollToTop}
                  className="flex-1 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold text-center"
               >
                  ↑ Về đầu trang
               </button>
            </div>

            {/* Metadata Card */}
            <div className="mt-8 bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
               <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-pink-600" />
                  Thông tin chi tiết
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                     <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                        Slug
                     </span>
                     <p className="mt-1 text-gray-900 font-medium break-all">
                        {blog.slug}
                     </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                     <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                        Cập nhật lần cuối
                     </span>
                     <p className="mt-1 text-gray-900 font-medium">
                        {formatDate(blog.updatedAt)}
                     </p>
                  </div>
               </div>
            </div>
         </article>
      </div>
   );
};

export default BlogDetail;
