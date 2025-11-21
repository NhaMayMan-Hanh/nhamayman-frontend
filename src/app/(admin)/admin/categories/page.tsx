"use client";
import { ToastContainer } from "@components/admin/ui/Toast";
import { useState, useEffect } from "react";

// Types (giữ nguyên)
interface Category {
   _id: string;
   name: string;
   img: string;
   slug: string;
   description: string;
   __v: number;
}

interface ApiResponse {
   success: boolean;
   message: string;
   data: Category[];
}

interface FilterOptions {
   sortBy: "newest" | "oldest" | "name";
   searchTerm: string;
}

const filterCategories = (
   categories: Category[],
   searchTerm: string,
   sortBy: FilterOptions["sortBy"]
): Category[] => {
   let filtered = categories.filter(
      (cat) =>
         cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
         cat.description.toLowerCase().includes(searchTerm.toLowerCase())
   );

   return filtered.sort((a, b) => {
      switch (sortBy) {
         case "newest":
            return b._id.localeCompare(a._id);
         case "oldest":
            return a._id.localeCompare(b._id);
         case "name":
            return a.name.localeCompare(b.name);
         default:
            return 0;
      }
   });
};

function DeleteModal({
   category,
   onClose,
   onConfirm,
}: {
   category: Category;
   onClose: () => void;
   onConfirm: () => void;
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
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
               <h3 className="text-xl font-semibold text-gray-900">
                  Xác nhận xóa
               </h3>
               <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg"
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
            <div className="p-6">
               <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
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
               <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{category.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{category.slug}</p>
               </div>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
               <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
               >
                  Hủy
               </button>
               <button
                  onClick={onConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
               >
                  Xóa danh mục
               </button>
            </div>
         </div>
      </div>
   );
}

export default function Categories() {
   const [categories, setCategories] = useState<Category[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState("");
   const [sortBy, setSortBy] = useState<FilterOptions["sortBy"]>("newest");
   const [currentPage, setCurrentPage] = useState(1);
   const [selectedCategory, setSelectedCategory] = useState<Category | null>(
      null
   );
   const [showModal, setShowModal] = useState(false);

   const itemsPerPage = 10;

   useEffect(() => {
      fetchCategories();
   }, []);

   const fetchCategories = async () => {
      try {
         setLoading(true);
         const res = await fetch("http://localhost:5000/api/admin/categories", {
            credentials: "include",
         });
         const result: ApiResponse = await res.json();
         if (result.success) {
            setCategories(result.data);
            setError(null);
         } else {
            setError("Không thể tải danh mục");
         }
      } catch (err: any) {
         setError("Lỗi kết nối: " + err.message);
      } finally {
         setLoading(false);
      }
   };

   const filtered = filterCategories(categories, searchTerm, sortBy);
   const totalPages = Math.ceil(filtered.length / itemsPerPage);
   const paginated = filtered.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
   );

   const handleDelete = (cat: Category) => {
      setSelectedCategory(cat);
      setShowModal(true);
   };

   const confirmDelete = async () => {
      if (!selectedCategory) return;
      // @ts-ignore - vì chúng ta đã gắn vào window
      const toastId = window.showToast("Đang xóa danh mục...", "loading");
      try {
         const res = await fetch(
            `http://localhost:5000/api/admin/categories/${selectedCategory._id}`,
            {
               method: "DELETE",
               credentials: "include",
            }
         );

         if (res.ok) {
            // @ts-ignore
            window.updateToast(
               toastId,
               `Đã xóa danh mục "${selectedCategory.name}" thành công!`,
               "success"
            );

            setCategories((prev) =>
               prev.filter((cat) => cat._id !== selectedCategory._id)
            );

            // Đóng modal
            setShowModal(false);
            setSelectedCategory(null);
         } else {
            const errorData = await res.json();
            // @ts-ignore
            window.updateToast(
               toastId,
               errorData.message || "Xóa thất bại",
               "error"
            );
         }
      } catch (err) {
         // @ts-ignore
         window.updateToast(toastId, "Lỗi kết nối server", "error");
      }
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
               <p className="mt-4 text-gray-600">Đang tải danh mục...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
               <p className="text-red-800 font-medium">{error}</p>
               <button
                  onClick={fetchCategories}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
               >
                  Thử lại
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
         <div>
            <div className="mb-8">
               <h1 className="text-3xl font-bold text-gray-900">
                  Quản lý Danh mục
               </h1>
               <p className="text-gray-600 mt-2">
                  Xem, chỉnh sửa và xóa các danh mục sản phẩm
               </p>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
               <div className="flex flex-col lg:flex-row gap-4 justify-between">
                  <div className="relative flex-1 max-w-md">
                     <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
                        placeholder="Tìm kiếm tên, slug, mô tả..."
                        value={searchTerm}
                        onChange={(e) => {
                           setSearchTerm(e.target.value);
                           setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>

                  <div className="flex gap-3">
                     <select
                        value={sortBy}
                        onChange={(e) => {
                           setSortBy(e.target.value as any);
                           setCurrentPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     >
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="name">Tên (A-Z)</option>
                     </select>

                     <button
                        className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() =>
                           (window.location.href = `/admin/categories/create`)
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
                              d="M12 4v16m8-8H4"
                           />
                        </svg>
                        Thêm danh mục
                     </button>
                  </div>
               </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                     <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                           <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Hình ảnh
                           </th>
                           <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tên danh mục
                           </th>
                           <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Slug
                           </th>
                           <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mô tả
                           </th>
                           <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Hành động
                           </th>
                        </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {paginated.length === 0 ? (
                           <tr>
                              <td
                                 colSpan={5}
                                 className="px-6 py-12 text-center text-gray-500"
                              >
                                 <div className="flex flex-col items-center">
                                    <svg
                                       className="w-16 h-16 text-gray-300 mb-3"
                                       fill="currentColor"
                                       viewBox="0 0 20 20"
                                    >
                                       <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                    </svg>
                                    Không tìm thấy danh mục nào
                                 </div>
                              </td>
                           </tr>
                        ) : (
                           paginated.map((cat) => (
                              <tr
                                 key={cat._id}
                                 className="hover:bg-gray-50 transition-colors"
                              >
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <img
                                       src={
                                          cat.img.startsWith("http")
                                             ? cat.img
                                             : cat.img.includes("/uploads/")
                                             ? `http://localhost:5000${cat.img}`
                                             : `http://localhost:3000${cat.img}`
                                       }
                                       alt={cat.name}
                                       className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                    />
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">
                                       {cat.name}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="text-sm text-gray-600 font-mono">
                                       {cat.slug}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="text-sm text-gray-600 max-w-xs truncate">
                                       {cat.description || "(Không có mô tả)"}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-3">
                                       <button
                                          onClick={() =>
                                             (window.location.href = `/admin/categories/${cat._id}`)
                                          }
                                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                                          title="Xem chi tiết"
                                       >
                                          <svg
                                             className="w-5 h-5 group-hover:scale-110 transition-transform"
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
                                       <button
                                          onClick={() =>
                                             (window.location.href = `/admin/categories/edit/${cat._id}`)
                                          }
                                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 group"
                                          title="Chỉnh sửa"
                                       >
                                          <svg
                                             className="w-5 h-5 group-hover:scale-110 transition-transform"
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
                                       </button>
                                       <button
                                          onClick={() => handleDelete(cat)}
                                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                                          title="Xóa danh mục"
                                       >
                                          <svg
                                             className="w-5 h-5 group-hover:scale-110 transition-transform"
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
                           ))
                        )}
                     </tbody>
                  </table>
               </div>

               {/* Pagination */}
               {totalPages > 1 && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                     <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-700">
                           Trang{" "}
                           <span className="font-medium">{currentPage}</span> /{" "}
                           <span className="font-medium">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                           <button
                              onClick={() =>
                                 setCurrentPage((p) => Math.max(1, p - 1))
                              }
                              disabled={currentPage === 1}
                              className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                           >
                              Trước
                           </button>
                           <button
                              onClick={() =>
                                 setCurrentPage((p) =>
                                    Math.min(totalPages, p + 1)
                                 )
                              }
                              disabled={currentPage === totalPages}
                              className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                           >
                              Sau
                           </button>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Modal */}
         {showModal && selectedCategory && (
            <DeleteModal
               category={selectedCategory}
               onClose={() => setShowModal(false)}
               onConfirm={confirmDelete}
            />
         )}
         <ToastContainer />
      </div>
   );
}
