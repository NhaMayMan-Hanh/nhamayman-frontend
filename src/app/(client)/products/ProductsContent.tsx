"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@contexts/CartContext"; // Thêm import này
import toast from "react-hot-toast"; // Thêm toast
import apiRequest from "@lib/api/index";
import getErrorMessage from "@utils/getErrorMessage";
import { Loading } from "@components/common/Loading";
import type { ApiResponse, Product } from "@app/(client)/types";

export default function ProductsContent() {
   const searchParams = useSearchParams();
   const categorySlug = searchParams.get("category") || "";

   const [products, setProducts] = useState<Product[]>([]);
   const [categoryName, setCategoryName] = useState<string>("");
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const { addToCart } = useCart(); // Lấy addToCart từ context

   useEffect(() => {
      if (!categorySlug) {
         setError("Không có danh mục được chọn");
         setLoading(false);
         return;
      }

      const fetchProducts = async () => {
         try {
            const result = await apiRequest.get<ApiResponse<Product[]>>(
               `/client/products?category=${categorySlug}`,
               { noAuth: true }
            );

            if (result.success) {
               setProducts(result.data);
               setCategoryName(result.data[0]?.category || categorySlug);
            } else {
               setError(result.message || "Lỗi không xác định");
            }
         } catch (err: unknown) {
            setError(getErrorMessage(err));
         } finally {
            setLoading(false);
         }
      };

      fetchProducts();
   }, [categorySlug]);

   // Hàm xử lý thêm vào giỏ hàng
   const handleAddToCart = async (
      e: React.MouseEvent<HTMLButtonElement>,
      product: Product
   ) => {
      e.preventDefault();
      e.stopPropagation();

      if (product.stock <= 0) {
         toast.error("Sản phẩm đã hết hàng!");
         return;
      }

      try {
         await addToCart({
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            stock: product.stock,
         });
      } catch (err) {
         toast.error("Không thể thêm vào giỏ hàng!");
      }
   };

   if (loading) {
      return (
         <div className="py-12">
            <Loading message="Đang tải sản phẩm..." size="md" />
         </div>
      );
   }

   if (error) {
      return <div className="text-center py-8 text-red-500">Lỗi: {error}</div>;
   }

   if (products.length === 0) {
      return (
         <div className="text-center py-8">
            <h1 className="text-3xl font-bold mb-4">
               Sản phẩm theo danh mục: {categoryName || categorySlug}
            </h1>
            <p className="text-gray-600">
               Chưa có sản phẩm nào trong danh mục này.
            </p>
            <Link
               href="/"
               className="mt-4 inline-block bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors"
            >
               Quay về trang chủ
            </Link>
         </div>
      );
   }

   return (
      <div className="max-w-6xl min-h-screen mx-auto py-12 px-4">
         <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
               Sản phẩm theo danh mục: {categoryName || categorySlug}
            </h1>
            <Link href="/" className="text-amber-500 hover:underline">
               ← Quay về trang chủ
            </Link>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
               <div key={product._id} className="group relative">
                  {/* Link bao quanh để click vào ảnh/tên vẫn vào chi tiết */}
                  <Link href={`/products/${product._id}`} className="block">
                     <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                        <Image
                           width={300}
                           height={300}
                           src={product.image}
                           alt={product.name}
                           className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                           unoptimized
                        />
                        <div className="p-4">
                           <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                              {product.name}
                           </h3>
                           <p className="text-amber-600 font-bold text-lg mb-2">
                              {product.price.toLocaleString()} VNĐ
                           </p>
                           <p className="text-sm text-gray-500">
                              Tồn kho: {product.stock}
                           </p>
                           <button
                              onClick={(e) => handleAddToCart(e, product)}
                              disabled={product.stock === 0}
                              className={`w-full mt-2 py-3 px-4 rounded-lg font-medium text-white shadow-lg transition-all transform cursor-pointer ${
                                 product.stock === 0
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                              }`}
                           >
                              {product.stock === 0
                                 ? "Hết hàng"
                                 : "Thêm vào giỏ hàng"}
                           </button>
                        </div>
                     </div>
                  </Link>
               </div>
            ))}
         </div>
      </div>
   );
}
