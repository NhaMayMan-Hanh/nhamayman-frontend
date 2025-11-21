"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
   _id: string;
   name: string;
   description: string;
   price: number;
   category: string;
   image: string;
   stock: number;
   detailedDescription?: string;
   createdAt: string;
   updatedAt: string;
   __v: number;
}

interface ApiResponse {
   success: boolean;
   data: {
      product: Product;
   };
}

export default function AdminProductDetailPage() {
   const params = useParams();
   const router = useRouter();
   const productId = params.id as string;

   const [product, setProduct] = useState<Product | null>(null);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      if (productId) {
         fetchProductDetail();
      }
   }, [productId]);

   const fetchProductDetail = async () => {
      try {
         setLoading(true);
         const response = await fetch(
            `http://localhost:5000/api/client/products/${productId}`
         );
         if (!response.ok) throw new Error("Không thể tải chi tiết sản phẩm");
         const result: ApiResponse = await response.json();
         setProduct(result.data.product);
         setError(null);
      } catch (err) {
         setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
      } finally {
         setLoading(false);
      }
   };

   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("vi-VN", {
         year: "numeric",
         month: "long",
         day: "numeric",
         hour: "2-digit",
         minute: "2-digit",
      });
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="text-center">
               <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
               <p className="text-slate-600">Đang tải chi tiết sản phẩm...</p>
            </div>
         </div>
      );
   }

   if (error || !product) {
      return (
         <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg">
               <svg
                  className="w-16 h-16 text-red-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
               </svg>
               <p className="text-red-600 font-medium mb-4">
                  {error || "Không tìm thấy sản phẩm"}
               </p>
               <button
                  onClick={() => router.push("/admin/products")}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
               >
                  Quay lại danh sách
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-slate-50 p-6">
         {/* Back Button */}
         <button
            onClick={() => router.push("/admin/products")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
               />
            </svg>
            Quay lại danh sách sản phẩm
         </button>

         {/* Main Content */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Product Image */}
            <div className="lg:col-span-1">
               <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6">
                  <div className="aspect-square bg-slate-100">
                     <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                     />
                  </div>
               </div>
            </div>

            {/* Product Info */}
            <div className="lg:col-span-2 space-y-6">
               {/* Basic Info Card */}
               <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                     <div className="flex-1">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">
                           {product.name}
                        </h1>
                        <p className="text-slate-600">{product.description}</p>
                     </div>
                     <div className="flex gap-2">
                        <Link
                           href={`/admin/products/edit/${product._id}`}
                           className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                           <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                           >
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth={2}
                                 d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                           </svg>
                        </Link>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                           <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                           >
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth={2}
                                 d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                           </svg>
                        </button>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                     <div>
                        <p className="text-sm text-slate-500 mb-1">Giá bán</p>
                        <p className="text-2xl font-bold text-blue-600">
                           {product.price.toLocaleString("vi-VN")}₫
                        </p>
                     </div>
                     <div>
                        <p className="text-sm text-slate-500 mb-1">Tồn kho</p>
                        <p className="text-2xl font-bold text-slate-800">
                           {product.stock}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm text-slate-500 mb-1">Danh mục</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                           {product.category}
                        </span>
                     </div>
                     <div>
                        <p className="text-sm text-slate-500 mb-1">
                           Trạng thái
                        </p>
                        {product.stock > 0 ? (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Còn hàng
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              Hết hàng
                           </span>
                        )}
                     </div>
                  </div>
               </div>

               {/* Detailed Description */}
               {product.detailedDescription && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                     <h2 className="text-xl font-bold text-slate-800 mb-4">
                        Mô tả chi tiết
                     </h2>
                     <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {product.detailedDescription}
                     </p>
                  </div>
               )}

               {/* Meta Info */}
               <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">
                     Thông tin hệ thống
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <svg
                           className="w-5 h-5 text-slate-500"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                           />
                        </svg>
                        <div>
                           <p className="text-xs text-slate-500">Ngày tạo</p>
                           <p className="text-sm font-medium text-slate-800">
                              {formatDate(product.createdAt)}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <svg
                           className="w-5 h-5 text-slate-500"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                           />
                        </svg>
                        <div>
                           <p className="text-xs text-slate-500">
                              Cập nhật lần cuối
                           </p>
                           <p className="text-sm font-medium text-slate-800">
                              {formatDate(product.updatedAt)}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <svg
                           className="w-5 h-5 text-slate-500"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                           />
                        </svg>
                        <div>
                           <p className="text-xs text-slate-500">ID Sản phẩm</p>
                           <p className="text-sm font-medium text-slate-800 font-mono">
                              {product._id}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <svg
                           className="w-5 h-5 text-slate-500"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                           />
                        </svg>
                        <div>
                           <p className="text-xs text-slate-500">Version</p>
                           <p className="text-sm font-medium text-slate-800">
                              v{product.__v}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
