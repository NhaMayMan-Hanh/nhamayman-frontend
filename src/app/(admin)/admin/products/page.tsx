// app/admin/products/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Product {
   _id: string;
   name: string;
   description: string;
   price: number;
   category: string;
   image: string;
   stock: number;
   detailedDescription?: string;
   __v: number;
}

interface ApiResponse {
   success: boolean;
   data: Product[];
}

// Toast helper (giữ nguyên trong dự án của bạn)
const showToast = (
   message: string,
   type: "success" | "error" | "loading" = "success"
): string | null => {
   if (
      typeof window !== "undefined" &&
      typeof window.showToast === "function"
   ) {
      return window.showToast(message, type);
   }
   console.log("[Toast]", type, message);
   return null;
};

const updateToast = (
   id: string | null,
   message: string,
   type: "success" | "error"
) => {
   if (
      id &&
      typeof window !== "undefined" &&
      typeof window.updateToast === "function"
   ) {
      window.updateToast(id, message, type);
   }
};

// MODAL XÓA SẢN PHẨM ĐẸP CHUẨN SHOPEE ADMIN
function DeleteProductModal({
   product,
   onClose,
   onConfirm,
   isLoading = false,
}: {
   product: Product;
   onClose: () => void;
   onConfirm: () => void;
   isLoading?: boolean;
}) {
   return (
      <div
         className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
         onClick={onClose}
      >
         <div
            className="bg-white rounded-lg shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
         >
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
               <h3 className="text-xl font-semibold text-gray-900">
                  Xác nhận xóa sản phẩm
               </h3>
               <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                        d="M6 18L18 6M6 6l12 12"
                     />
                  </svg>
               </button>
            </div>

            {/* Body */}
            <div className="p-6">
               {/* Cảnh báo đỏ */}
               <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 mb-5">
                  <svg
                     className="w-6 h-6 text-red-600 shrink-0"
                     fill="currentColor"
                     viewBox="0 0 20 20"
                  >
                     <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                     />
                  </svg>
                  <div>
                     <h4 className="font-semibold text-red-900">Cảnh báo!</h4>
                     <p className="text-sm text-red-700 mt-1">
                        Hành động này không thể hoàn tác.
                     </p>
                  </div>
               </div>

               {/* Thông tin sản phẩm */}
               <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex gap-4">
                     <div className="w-20 h-20 bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                        <img
                           src={product.image}
                           alt={product.name}
                           className="w-full h-full object-cover"
                        />
                     </div>
                     <div className="flex-1">
                        <p className="font-semibold text-gray-900 line-clamp-2">
                           {product.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                           Danh mục: {product.category}
                        </p>
                        <p className="text-sm font-medium text-gray-700 mt-2">
                           Giá: {product.price.toLocaleString("vi-VN")}₫
                        </p>
                        {product.stock === 0 && (
                           <p className="text-xs text-red-600 mt-1 font-medium">
                              Hết hàng
                           </p>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
               <button
                  onClick={onClose}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
               >
                  Hủy bỏ
               </button>
               <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                  {isLoading && (
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  {isLoading ? "Đang xóa..." : "Xóa sản phẩm"}
               </button>
            </div>
         </div>
      </div>
   );
}

export default function AdminProductsPage() {
   const [products, setProducts] = useState<Product[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);
   const [searchQuery, setSearchQuery] = useState<string>("");
   const [categoryFilter, setCategoryFilter] = useState<string>("all");
   const [currentPage, setCurrentPage] = useState<number>(1);
   const itemsPerPage = 10;

   // State cho modal xóa
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [productToDelete, setProductToDelete] = useState<Product | null>(null);
   const [deleting, setDeleting] = useState(false);

   useEffect(() => {
      fetchProducts();
   }, []);

   const fetchProducts = async () => {
      try {
         setLoading(true);
         const response = await fetch(
            "http://localhost:5000/api/client/products"
         );
         if (!response.ok) throw new Error("Không thể tải sản phẩm");
         const result: ApiResponse = await response.json();
         setProducts(result.data || []);
         setError(null);
      } catch (err) {
         setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
      } finally {
         setLoading(false);
      }
   };

   const handleDelete = (product: Product) => {
      setProductToDelete(product);
      setShowDeleteModal(true);
   };

   const confirmDelete = async () => {
      if (!productToDelete) return;

      const toastId = showToast("Đang xóa sản phẩm...", "loading");
      setDeleting(true);

      try {
         const res = await fetch(
            `http://localhost:5000/api/admin/products/${productToDelete._id}`,
            {
               method: "DELETE",
               credentials: "include",
            }
         );
         const result = await res.json();

         if (res.ok && result.success) {
            updateToast(toastId, "Xóa sản phẩm thành công!", "success");
            setProducts((prev) =>
               prev.filter((p) => p._id !== productToDelete._id)
            );
         } else {
            updateToast(toastId, result.message || "Xóa thất bại", "error");
         }
      } catch (err) {
         updateToast(toastId, "Lỗi kết nối server", "error");
      } finally {
         setDeleting(false);
         setShowDeleteModal(false);
         setProductToDelete(null);
      }
   };

   // Filter & Pagination
   const categories = Array.from(new Set(products.map((p) => p.category)));
   const filteredProducts = products.filter((product) => {
      const matchesSearch =
         product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
         categoryFilter === "all" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
   });
   const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const endIndex = startIndex + itemsPerPage;
   const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

   useEffect(() => {
      setCurrentPage(1);
   }, [searchQuery, categoryFilter]);

   if (loading) {
      return (
         <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="text-center">
               <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
               <p className="text-slate-600">Đang tải sản phẩm...</p>
            </div>
         </div>
      );
   }

   if (error) {
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
               <p className="text-red-600 font-medium mb-4">{error}</p>
               <button
                  onClick={fetchProducts}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
               >
                  Thử lại
               </button>
            </div>
         </div>
      );
   }

   return (
      <>
         <div className="min-h-screen bg-slate-50 p-6">
            {/* Header */}
            <div className="mb-6">
               <div className="flex items-center justify-between mb-4">
                  <div>
                     <h1 className="text-3xl font-bold text-slate-800 mb-2">
                        Quản lý sản phẩm
                     </h1>
                     <p className="text-slate-600">
                        Tổng số: {filteredProducts.length} sản phẩm
                     </p>
                  </div>
                  <Link
                     href="/admin/products/create"
                     className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-300 hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  >
                     <svg
                        className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2.5}
                           d="M12 4v16m8-8H4"
                        />
                     </svg>
                     <span className="tracking-wide">Thêm sản phẩm mới</span>
                  </Link>
               </div>

               {/* Filters */}
               <div className="flex gap-4 flex-wrap">
                  <div className="relative flex-1 min-w-64">
                     <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                     </svg>
                     <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     />
                  </div>
                  <select
                     value={categoryFilter}
                     onChange={(e) => setCategoryFilter(e.target.value)}
                     className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="all">Tất cả danh mục</option>
                     {categories.map((category) => (
                        <option key={category} value={category}>
                           {category}
                        </option>
                     ))}
                  </select>
               </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead>
                        <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                           <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              Sản phẩm
                           </th>
                           <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              Danh mục
                           </th>
                           <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              Giá
                           </th>
                           <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              Tồn kho
                           </th>
                           <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              Trạng thái
                           </th>
                           <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              Thao tác
                           </th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-200">
                        {paginatedProducts.map((product) => (
                           <tr
                              key={product._id}
                              className="hover:bg-slate-50 transition-colors"
                           >
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                       <img
                                          src={product.image}
                                          alt={product.name}
                                          className="w-full h-full object-cover"
                                       />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="font-medium text-slate-800 truncate">
                                          {product.name}
                                       </p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {product.category}
                                 </span>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="font-semibold text-slate-800">
                                    {product.price.toLocaleString("vi-VN")}₫
                                 </span>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="text-slate-700">
                                    {product.stock}
                                 </span>
                              </td>
                              <td className="px-6 py-4">
                                 {product.stock > 0 ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                       Còn hàng
                                    </span>
                                 ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                       <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                       Hết hàng
                                    </span>
                                 )}
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center justify-center gap-2">
                                    <button
                                       className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                       onClick={() =>
                                          (window.location.href = `/admin/product/${product._id}`)
                                       }
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
                                             d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                          />
                                          <path
                                             strokeLinecap="round"
                                             strokeLinejoin="round"
                                             strokeWidth={2}
                                             d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                          />
                                       </svg>
                                    </button>
                                    <Link
                                       href={`/admin/products/edit/${product._id}`}
                                       className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
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
                                             d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                          />
                                       </svg>
                                    </Link>
                                    <button
                                       onClick={() => handleDelete(product)}
                                       className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                                             d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                       </svg>
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {/* Pagination */}
               {filteredProducts.length > 0 && (
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                     <p className="text-sm text-slate-600">
                        Hiển thị{" "}
                        <span className="font-medium">{startIndex + 1}</span> -{" "}
                        <span className="font-medium">
                           {Math.min(endIndex, filteredProducts.length)}
                        </span>{" "}
                        trong tổng số{" "}
                        <span className="font-medium">
                           {filteredProducts.length}
                        </span>{" "}
                        sản phẩm
                     </p>
                     <div className="flex items-center gap-2">
                        <button
                           onClick={() =>
                              setCurrentPage((prev) => Math.max(1, prev - 1))
                           }
                           disabled={currentPage === 1}
                           className={`px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === 1
                                 ? "text-slate-400 cursor-not-allowed bg-slate-50"
                                 : "text-slate-700 hover:bg-slate-100"
                           }`}
                        >
                           Trước
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                           .filter(
                              (page) =>
                                 page === 1 ||
                                 page === totalPages ||
                                 Math.abs(page - currentPage) <= 1
                           )
                           .map((page, index, array) => {
                              const prevPage = array[index - 1];
                              const showEllipsis =
                                 prevPage && page - prevPage > 1;
                              return (
                                 <div
                                    key={page}
                                    className="flex items-center gap-2"
                                 >
                                    {showEllipsis && (
                                       <span className="px-2 text-slate-400">
                                          ...
                                       </span>
                                    )}
                                    <button
                                       onClick={() => setCurrentPage(page)}
                                       className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                          currentPage === page
                                             ? "bg-blue-600 text-white"
                                             : "border border-slate-300 text-slate-700 hover:bg-slate-100"
                                       }`}
                                    >
                                       {page}
                                    </button>
                                 </div>
                              );
                           })}
                        <button
                           onClick={() =>
                              setCurrentPage((prev) =>
                                 Math.min(totalPages, prev + 1)
                              )
                           }
                           disabled={currentPage === totalPages}
                           className={`px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === totalPages
                                 ? "text-slate-400 cursor-not-allowed bg-slate-50"
                                 : "text-slate-700 hover:bg-slate-100"
                           }`}
                        >
                           Sau
                        </button>
                     </div>
                  </div>
               )}
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 && (
               <div className="text-center py-20 bg-white rounded-xl shadow-lg">
                  <svg
                     className="w-24 h-24 text-slate-300 mx-auto mb-4"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                     />
                  </svg>
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">
                     Không tìm thấy sản phẩm nào
                  </h3>
                  <p className="text-slate-500 mb-4">
                     Thử thay đổi bộ lọc hoặc tìm kiếm của bạn
                  </p>
               </div>
            )}
         </div>

         {/* MODAL XÓA ĐẸP LUNG LINH */}
         {showDeleteModal && productToDelete && (
            <DeleteProductModal
               product={productToDelete}
               onClose={() => setShowDeleteModal(false)}
               onConfirm={confirmDelete}
               isLoading={deleting}
            />
         )}
      </>
   );
}
