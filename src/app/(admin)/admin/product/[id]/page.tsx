"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
   ArrowLeft,
   AlertCircle,
   Edit,
   Trash2,
   Clock,
   RefreshCw,
   Tag,
   FileText,
} from "lucide-react";
import Loading from "@components/admin/Loading";

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
            `${process.env.NEXT_PUBLIC_API_URL}/client/products/${productId}`
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
      return <Loading />;
   }

   if (error || !product) {
      return (
         <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="text-center bg-white p-8 rounded-xl shadow-md">
               <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
               <p className="text-red-600 font-medium mb-4">
                  {error || "Không tìm thấy sản phẩm"}
               </p>
               <button
                  onClick={() => router.push("/admin/products")}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer"
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
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition cursor-pointer"
         >
            <ArrowLeft className="w-5 h-5" />
            Quay lại danh sách sản phẩm
         </button>

         {/* Main Content */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Product Image */}
            <div className="lg:col-span-1">
               <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-6">
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
               <div className="bg-white rounded-xl shadow-sm p-6">
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
                           className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                           <Edit className="w-6 h-6" />
                        </Link>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer">
                           <Trash2 className="w-6 h-6" />
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
                  <div className="bg-white rounded-xl shadow-sm p-6">
                     <h2 className="text-xl font-bold text-slate-800 mb-4">
                        Mô tả chi tiết
                     </h2>
                     <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {product.detailedDescription}
                     </p>
                  </div>
               )}

               {/* Meta Info */}
               <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">
                     Thông tin hệ thống
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Clock className="w-5 h-5 text-slate-500" />
                        <div>
                           <p className="text-xs text-slate-500">Ngày tạo</p>
                           <p className="text-sm font-medium text-slate-800">
                              {formatDate(product.createdAt)}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <RefreshCw className="w-5 h-5 text-slate-500" />
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
                        <Tag className="w-5 h-5 text-slate-500" />
                        <div>
                           <p className="text-xs text-slate-500">ID Sản phẩm</p>
                           <p className="text-sm font-medium text-slate-800 font-mono">
                              {product._id}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <FileText className="w-5 h-5 text-slate-500" />
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
