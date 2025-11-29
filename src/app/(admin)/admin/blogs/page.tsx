"use client";

import { useState, useEffect, useCallback } from "react";
import { BlogData, BlogListResponse, FilterOptions } from "./types";
import { filterBlogs, formatDate } from "./utils";
import BlogFilter from "./BlogFilter";
import Link from "next/link";
import Loading from "@components/admin/Loading";
import DeleteConfirmModal from "@components/admin/DeleteModal";
import ActionButton from "@components/admin/ui/ActionsButton";
import { useToast } from "@contexts/ToastContext";
import { Pagination } from "@components/admin/helpers/Pagination";
import apiRequest from "@lib/api";
export default function Blogs() {
   const [blogs, setBlogs] = useState<BlogData[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [currentPage, setCurrentPage] = useState(1);
   const [filters, setFilters] = useState<FilterOptions>({
      sortBy: "newest",
      dateRange: "all",
   });
   const [deleteTarget, setDeleteTarget] = useState<BlogData | null>(null);

   const toast = useToast();
   const itemsPerPage = 10;
   const fetchBlogs = useCallback(async () => {
      try {
         setLoading(true);
         const result = await apiRequest.get<BlogListResponse>("/admin/blogs");
         if (result.success) {
            setBlogs(result.data);
         } else {
            toast.error(result.message || "Không thể tải danh sách blog");
         }
      } catch (err: any) {
         toast.error(err.message || "Lỗi kết nối server");
         console.error("Fetch blogs error:", err);
      } finally {
         setLoading(false);
      }
   }, [toast]);
   useEffect(() => {
      fetchBlogs();
   }, []);

   // Xử lý xóa blog
   const confirmDelete = useCallback(async () => {
      if (!deleteTarget) return;

      const toastId = toast.loading("Đang xóa bài viết...");

      try {
         const result = await apiRequest.delete<{
            success: boolean;
            message?: string;
         }>(`/admin/blogs/${deleteTarget._id}`);

         if (result.success) {
            toast.updateToast(toastId, "Xóa bài viết thành công!", "success");
            await fetchBlogs();
            setDeleteTarget(null);
         } else {
            toast.updateToast(
               toastId,
               result.message || "Xóa thất bại",
               "error"
            );
         }
      } catch (err: any) {
         toast.updateToast(
            toastId,
            err.message || "Lỗi kết nối server",
            "error"
         );
         console.error("Delete blog error:", err);
      }
   }, [deleteTarget, toast, fetchBlogs]);

   // Filter và pagination
   const filteredBlogs = filterBlogs(blogs, searchTerm, filters);
   const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
   const paginatedBlogs = filteredBlogs.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
   );

   // Handlers
   const handleSearchChange = useCallback((value: string) => {
      setSearchTerm(value);
      setCurrentPage(1);
   }, []);

   const handleFilterChange = useCallback((f: FilterOptions) => {
      setFilters(f);
      setCurrentPage(1);
   }, []);

   const handleDelete = useCallback((blog: BlogData) => {
      setDeleteTarget(blog);
   }, []);

   if (loading) return <Loading />;

   return (
      <div className="min-h-screen bg-gray-50">
         <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 sm:mb-8">
               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Quản lý Blogs
               </h1>
               <p className="text-gray-600 mt-2">
                  Quản lý tất cả bài viết blog của bạn
               </p>
            </div>

            {/* Search + Add Button */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
               <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="relative w-full md:w-96">
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
                        placeholder="Tìm kiếm blog..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>
                  <Link
                     href="/admin/blogs/create"
                     className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
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
                     Thêm Blog Mới
                  </Link>
               </div>
            </div>

            <BlogFilter filters={filters} onFilterChange={handleFilterChange} />

            {/* Table */}
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
                                       <img
                                          src={blog.img}
                                          alt={blog.name}
                                          className="w-full h-full object-cover"
                                       />
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
                                 <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                       <svg
                                          className="w-4 h-4 mr-1"
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
                                 <td className="px-4 sm:px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                       <ActionButton
                                          href={`/admin/blogs/${blog._id}`}
                                          icon="view"
                                          color="blue"
                                          title="Xem chi tiết"
                                       />
                                       <ActionButton
                                          href={`/admin/blogs/edit/${blog._id}`}
                                          icon="edit"
                                          color="green"
                                          title="Chỉnh sửa"
                                       />
                                       <button
                                          onClick={() => handleDelete(blog)}
                                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                          title="Xóa"
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

            {/* Modal Xóa */}
            <DeleteConfirmModal
               open={!!deleteTarget}
               onClose={() => setDeleteTarget(null)}
               onConfirm={confirmDelete}
               title="Xóa blog"
               message="Bạn có chắc chắn muốn xóa blog này? Hành động này không thể hoàn tác."
               entityName={deleteTarget?.name || ""}
               details={
                  deleteTarget && (
                     <p className="mt-1 text-sm text-gray-600 line-clamp-3">
                        {deleteTarget.description}
                     </p>
                  )
               }
               confirmText="Xóa"
               cancelText="Hủy"
            />
         </div>
      </div>
   );
}
