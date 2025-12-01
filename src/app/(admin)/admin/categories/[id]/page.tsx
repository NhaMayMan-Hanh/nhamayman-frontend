"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Loading from "@components/admin/Loading";
import { Category } from "../types";
import { formatDate } from "../utils";
import ErrorState from "@components/admin/ErrorState";
import { ArrowLeft } from "lucide-react";
import apiRequest from "@lib/api";

export default function CategoryDetail() {
   const [category, setCategory] = useState<Category | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const router = useRouter();
   const params = useParams();
   const id = params.id as string;
   const fetchCategory = async () => {
      try {
         setLoading(true);
         const result = await apiRequest.get<{
            success: boolean;
            data: Category;
         }>(`/admin/categories/${id}`);

         if (result.success && result.data) {
            setCategory(result.data);
            setError(null);
         } else {
            setError("Không tìm thấy danh mục");
         }
      } catch (err: any) {
         setError(err.message || "Lỗi kết nối đến server");
         console.error(err);
      } finally {
         setLoading(false);
      }
   };
   useEffect(() => {
      if (!id) return;
      fetchCategory();
   }, [id]);
   if (loading) {
      return <Loading />;
   }
   if (error || !category) {
      return <ErrorState redirect="/admin/categories" />;
   }
   console.log(category);
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
                     className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                     className="px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 
              transition-colors cursor-pointer flex items-center gap-2"
                  >
                     <ArrowLeft className="h-5 w-5" />
                     <span>Quay lại</span>
                  </button>
               </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                     <div className="aspect-square relative bg-gray-100">
                        <img
                           src={category.img}
                           alt={category.name}
                           className="object-cover w-full h-full"
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
                        <div>
                           <p className="text-sm mb-1 text-gray-500">
                              Trạng thái
                           </p>
                           <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                 category.status
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                           >
                              {category.status ? (
                                 <>
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Hiển thị
                                 </>
                              ) : (
                                 <>
                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                    Ẩn
                                 </>
                              )}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
