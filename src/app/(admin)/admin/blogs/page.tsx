"use client";

import { useState, useEffect } from "react";
import { ApiResponse, Blog, FilterOptions } from "./types";
import { filterBlogs, formatDate } from "./utils";
import BlogFilter from "./BlogFilter";
import Pagination from "./pagination";
import DeleteModal from "./DeleteModal";

export default function Blogs() {
   const [blogs, setBlogs] = useState<Blog[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
   const [showModal, setShowModal] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);
   const [filters, setFilters] = useState<FilterOptions>({
      sortBy: "newest",
      dateRange: "all",
   });
   const itemsPerPage = 10;
   useEffect(() => {
      fetchBlogs();
   }, []);

   const fetchBlogs = async () => {
      try {
         setLoading(true);
         const response = await fetch("http://localhost:5000/api/admin/blogs", {
            credentials: "include",
         });
         const result: ApiResponse = await response.json();
         if (result.success) {
            setBlogs(result.data);
            setError(null);
         } else {
            setError("Không thể tải dữ liệu blogs");
         }
      } catch (err) {
         setError("Lỗi kết nối đến server: " + (err as Error).message);
      } finally {
         setLoading(false);
      }
   };

   const filteredBlogs = filterBlogs(blogs, searchTerm, filters);
   const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
   const paginatedBlogs = filteredBlogs.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
   );

   const handleDelete = (blog: Blog) => {
      setSelectedBlog(blog);
      setShowModal(true);
   };

   const confirmDelete = async () => {
      if (!selectedBlog) return;
      try {
         const response = await fetch(
            `http://localhost:5000/api/admin/blogs/${selectedBlog._id}`,
            { method: "DELETE" }
         );
         if (response.ok) fetchBlogs();
         setShowModal(false);
      } catch (err) {
         console.error("Error deleting blog:", err);
      }
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
               <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
               <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
               <div className="flex items-center gap-3 text-red-800">
                  <svg
                     className="w-6 h-6 shrink-0"
                     fill="currentColor"
                     viewBox="0 0 20 20"
                  >
                     <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                     />
                  </svg>
                  <div>
                     <h3 className="font-semibold">Lỗi tải dữ liệu</h3>
                     <p className="text-sm mt-1">{error}</p>
                  </div>
               </div>
               <button
                  onClick={fetchBlogs}
                  className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
               >
                  Thử lại
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50">
         <div>
            <div className="mb-6 sm:mb-8">
               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Quản lý Blogs
               </h1>
               <p className="text-gray-600 mt-2">
                  Quản lý tất cả bài viết blog của bạn
               </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
               <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="relative w-full md:w-96">
                     <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
                        placeholder="Tìm kiếm blog..."
                        value={searchTerm}
                        onChange={(e) => {
                           setSearchTerm(e.target.value);
                           setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                     />
                  </div>
                  <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
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
                     Thêm Blog Mới
                  </button>
               </div>
            </div>

            <BlogFilter
               filters={filters}
               onFilterChange={(f) => {
                  setFilters(f);
                  setCurrentPage(1);
               }}
            />

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                           <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ảnh
                           </th>
                           <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tiêu đề
                           </th>
                           <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mô tả
                           </th>
                           <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ngày tạo
                           </th>
                           <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Thao tác
                           </th>
                        </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedBlogs.length === 0 ? (
                           <tr>
                              <td
                                 colSpan={5}
                                 className="px-6 py-12 text-center text-gray-500"
                              >
                                 <svg
                                    className="w-16 h-16 mx-auto text-gray-300 mb-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                 >
                                    <path
                                       fillRule="evenodd"
                                       d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                                       clipRule="evenodd"
                                    />
                                 </svg>
                                 <p className="text-lg font-medium">
                                    Không tìm thấy blog nào
                                 </p>
                                 <p className="text-sm mt-1">
                                    Thử tìm kiếm với từ khóa khác
                                 </p>
                              </td>
                           </tr>
                        ) : (
                           paginatedBlogs.map((blog) => (
                              <tr
                                 key={blog._id}
                                 className="hover:bg-gray-50 transition-colors"
                              >
                                 <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                       {blog.img ? (
                                          <img
                                             src={blog.img}
                                             alt={blog.name}
                                             className="w-full h-full object-cover"
                                          />
                                       ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                             <svg
                                                className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                             >
                                                <path
                                                   fillRule="evenodd"
                                                   d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                                   clipRule="evenodd"
                                                />
                                             </svg>
                                          </div>
                                       )}
                                    </div>
                                 </td>
                                 <td className="px-4 sm:px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                       {blog.name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                       {blog.slug}
                                    </div>
                                    <div className="lg:hidden text-xs text-gray-600 mt-2 line-clamp-2">
                                       {blog.description}
                                    </div>
                                 </td>
                                 <td className="hidden lg:table-cell px-6 py-4">
                                    <div className="text-sm text-gray-600 line-clamp-2 max-w-md">
                                       {blog.description}
                                    </div>
                                 </td>
                                 <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-500">
                                       <svg
                                          className="w-4 h-4 mr-1 shrink-0"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                       >
                                          <path
                                             fillRule="evenodd"
                                             d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                             clipRule="evenodd"
                                          />
                                       </svg>
                                       {formatDate(blog.createdAt)}
                                    </div>
                                 </td>
                                 <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                                       <button
                                          disabled
                                          className="p-1.5 sm:p-2 text-blue-600 rounded-lg transition-colors opacity-50 cursor-not-allowed"
                                          title="Xem chi tiết (không khả dụng)"
                                       >
                                          <svg
                                             className="w-4 h-4 sm:w-5 sm:h-5"
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
                                          disabled
                                          className="p-1.5 sm:p-2 text-green-600 rounded-lg transition-colors opacity-50 cursor-not-allowed"
                                          title="Chỉnh sửa (không khả dụng)"
                                       >
                                          <svg
                                             className="w-4 h-4 sm:w-5 sm:h-5"
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
                                          onClick={() => handleDelete(blog)}
                                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                          title="Xóa"
                                       >
                                          <svg
                                             className="w-4 h-4 sm:w-5 sm:h-5"
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
            </div>

            <Pagination
               currentPage={currentPage}
               totalPages={totalPages}
               onPageChange={setCurrentPage}
            />

            {showModal && selectedBlog && (
               <DeleteModal
                  blog={selectedBlog}
                  onClose={() => setShowModal(false)}
                  onConfirm={confirmDelete}
               />
            )}
         </div>
      </div>
   );
}
