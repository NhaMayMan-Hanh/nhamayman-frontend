"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Category {
   _id: string;
   name: string;
   img: string;
   slug: string;
   description: string;
   createdAt: string;
   updatedAt: string;
   __v: number;
}

export default function CategoryDetail() {
   const [category, setCategory] = useState<Category | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const router = useRouter();
   const params = useParams();
   const id = params.id as string;

   useEffect(() => {
      if (!id) return;

      const fetchCategory = async () => {
         try {
            setLoading(true);
            const res = await fetch(
               `http://localhost:5000/api/admin/categories/${id}`,
               {
                  credentials: "include",
               }
            );

            const result = await res.json();

            if (result.success && result.data) {
               setCategory(result.data);
               setError(null);
            } else {
               setError("Không tìm thấy danh mục");
            }
         } catch (err) {
            setError("Lỗi kết nối đến server");
            console.error(err);
         } finally {
            setLoading(false);
         }
      };

      fetchCategory();
   }, [id]);

   // Hàm format ngày chuẩn Việt Nam (không cần date-fns)
   const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return `${date.toLocaleDateString("vi-VN")} lúc ${date.toLocaleTimeString(
         "vi-VN",
         { hour: "2-digit", minute: "2-digit" }
      )}`;
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
               <p className="mt-4 text-gray-600">
                  Đang tải thông tin danh mục...
               </p>
            </div>
         </div>
      );
   }

   if (error || !category) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
               <svg
                  className="w-16 h-16 text-red-500 mx-auto mb-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
               >
                  <path
                     fillRule="evenodd"
                     d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                     clipRule="evenodd"
                  />
               </svg>
               <h3 className="text-lg font-semibold text-red-800">
                  Không tìm thấy danh mục
               </h3>
               <p className="text-red-600 mt-2">
                  {error || "Danh mục không tồn tại hoặc đã bị xóa"}
               </p>
               <button
                  onClick={() => router.push("/admin/categories")}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                  Quay lại danh sách
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
         <div>
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
               <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                     Chi tiết danh mục
                  </h1>
                  <p className="text-gray-600 mt-1">
                     Xem thông tin chi tiết về danh mục sản phẩm
                  </p>
               </div>
               <div className="flex gap-3">
                  <Link
                     href={`/admin/categories/edit/${category._id}`}
                     className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                     <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                     </svg>
                     Chỉnh sửa
                  </Link>
                  <button
                     onClick={() => router.push("/admin/categories")}
                     className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                     Quay lại
                  </button>
               </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Hình ảnh + Thông tin cơ bản */}
               <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                     <div className="aspect-square relative bg-gray-100">
                        <img
                           src={
                              category.img.startsWith("http")
                                 ? category.img
                                 : category.img.includes("/uploads/")
                                 ? `http://localhost:5000${category.img}`
                                 : `http://localhost:3000${category.img}`
                           }
                           alt={category.name}
                           className="object-cover w-full h-full"
                           onError={(e) => {
                              e.currentTarget.src = "/placeholder-image.png";
                           }}
                        />
                     </div>

                     <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                           {category.name}
                        </h2>
                        <p className="text-lg text-blue-600 font-medium mt-2">
                           /{category.slug}
                        </p>
                     </div>
                  </div>
               </div>

               {/* Thông tin chi tiết */}
               <div className="lg:col-span-2 space-y-6">
                  {/* Mô tả */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Mô tả danh mục
                     </h3>
                     <p className="text-gray-700 leading-relaxed">
                        {category.description || (
                           <span className="text-gray-400 italic">
                              Chưa có mô tả
                           </span>
                        )}
                     </p>
                  </div>

                  {/* Thông tin hệ thống */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Thông tin hệ thống
                     </h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                           <p className="text-sm text-gray-500">ID danh mục</p>
                           <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded mt-1">
                              {category._id}
                           </p>
                        </div>
                        <div>
                           <p className="text-sm text-gray-500">Ngày tạo</p>
                           <p className="font-medium mt-1">
                              {formatDate(category.createdAt)}
                           </p>
                        </div>
                        <div>
                           <p className="text-sm text-gray-500">
                              Cập nhật lần cuối
                           </p>
                           <p className="font-medium mt-1">
                              {formatDate(category.updatedAt)}
                           </p>
                        </div>
                        <div>
                           <p className="text-sm text-gray-500">Phiên bản</p>
                           <p className="font-medium mt-1">v{category.__v}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
