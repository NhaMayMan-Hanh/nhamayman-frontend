"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

interface BlogData {
   _id: string;
   name: string;
   img: string;
   slug: string;
   description: string;
   content: string;
   createdAt: string;
   updatedAt: string;
   __v: number;
}

interface ApiResponse {
   success: boolean;
   data: BlogData;
}

const BlogDetail = () => {
   const params = useParams();
   const router = useRouter();
   const id = params?.id as string;

   const [blog, setBlog] = useState<BlogData | null>(null);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      if (id) {
         fetchBlogDetail();
      }
   }, [id]);

   const fetchBlogDetail = async () => {
      try {
         setLoading(true);
         const res = await fetch(
            `http://localhost:5000/api/admin/blogs/${id}`,
            {
               credentials: "include",
            }
         );
         const data: ApiResponse = await res.json();
         if (data.success) {
            setBlog(data.data);
         } else {
            setError("Không tìm thấy bài viết");
         }
      } catch (err) {
         setError("Lỗi khi tải bài viết");
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
         year: "numeric",
         month: "long",
         day: "numeric",
      });
   };

   const calculateReadTime = (content: string): number => {
      const wordsPerMinute = 200;
      const textLength = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
      const readTime = Math.ceil(textLength / wordsPerMinute);
      return readTime;
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
               <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
         </div>
      );
   }

   if (error || !blog) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
               <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  😞 Không tìm thấy bài viết
               </h2>
               <button
                  onClick={() => router.push("/blogs")}
                  className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition"
               >
                  Quay lại danh sách blog
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50">
         {/* Header */}
         <div className="bg-white shadow-sm">
            <div className="max-w-4xl mx-auto px-4 py-4">
               <button
                  onClick={() => router.back()}
                  className="flex items-center text-gray-600 hover:text-pink-600 transition"
               >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Quay lại
               </button>
            </div>
         </div>

         {/* Hero Image */}
         <div className="px-4 py-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
               <img
                  src={`${blog.img}`}
                  alt={blog.name}
                  className="w-full h-96 object-cover"
               />

               {/* Content */}
               <div className="p-8 md:p-12">
                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                     {blog.name}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
                     <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(blog.createdAt)}
                     </div>
                     <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {calculateReadTime(blog.content)} phút đọc
                     </div>
                  </div>

                  {/* Description */}
                  <div className="bg-pink-50 border-l-4 border-pink-600 p-4 rounded-r-lg mb-8">
                     <p className="text-gray-700 italic text-lg">
                        {blog.description}
                     </p>
                  </div>

                  {/* Main Content */}
                  <div
                     className="prose prose-lg max-w-none
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-pink-600
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-pink-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-ul:my-4 prose-li:my-2
                prose-img:rounded-lg prose-img:shadow-md"
                     dangerouslySetInnerHTML={{ __html: blog.content }}
                  />

                  {/* Footer Actions */}
                  <div className="mt-12 pt-8 border-t">
                     <div className="flex flex-wrap gap-4">
                        <button
                           onClick={() => router.push("/blogs")}
                           className="flex-1 min-w-[200px] bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition font-medium"
                        >
                           Xem thêm bài viết
                        </button>
                        <button
                           onClick={() =>
                              window.scrollTo({ top: 0, behavior: "smooth" })
                           }
                           className="flex-1 min-w-[200px] bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
                        >
                           Về đầu trang
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Related Info */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
               <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Thông tin chi tiết
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                     <span className="text-gray-600">Slug:</span>
                     <span className="ml-2 text-gray-900 font-medium">
                        {blog.slug}
                     </span>
                  </div>
                  <div>
                     <span className="text-gray-600">Cập nhật:</span>
                     <span className="ml-2 text-gray-900 font-medium">
                        {formatDate(blog.updatedAt)}
                     </span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default BlogDetail;
