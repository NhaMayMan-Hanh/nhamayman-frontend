"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import DeleteConfirmModal from "@components/admin/DeleteModal";

interface Comment {
   _id: string;
   content: string;
   rating?: number;
   username: string;
   userEmail: string;
   avatar: string;
   productId: string;
   productName: string;
   productImage: string;
   createdAt: string;
   updatedAt: string;
}

interface Pagination {
   total: number;
   page: number;
   limit: number;
   totalPages: number;
}

interface CommentsResponse {
   success: boolean;
   message: string;
   data: Comment[];
   pagination: Pagination;
}

const CommentProducts = () => {
   const [comments, setComments] = useState<Comment[]>([]);
   const [loading, setLoading] = useState(true);
   const [pagination, setPagination] = useState<Pagination>({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
   });

   // Filters
   const [search, setSearch] = useState("");
   const [sortBy, setSortBy] = useState("createdAt");
   const [searchInput, setSearchInput] = useState("");

   // Delete modal
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
   const [deleting, setDeleting] = useState(false);

   useEffect(() => {
      fetchComments();
   }, [pagination.page, search, sortBy]);

   const fetchComments = async () => {
      setLoading(true);
      try {
         const params = new URLSearchParams({
            page: pagination.page.toString(),
            limit: pagination.limit.toString(),
            sortBy: sortBy,
         });

         if (search) {
            params.append("search", search);
         }

         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/comments?${params}`,
            {
               credentials: "include",
            }
         );

         if (!res.ok) {
            throw new Error("Không thể tải danh sách bình luận");
         }

         const result: CommentsResponse = await res.json();

         if (result.success) {
            setComments(result.data);
            setPagination(result.pagination);
         }
      } catch (error) {
         console.error("Error fetching comments:", error);
         alert((error as Error).message);
      } finally {
         setLoading(false);
      }
   };

   const handleSearch = () => {
      setSearch(searchInput);
      setPagination((prev) => ({ ...prev, page: 1 }));
   };

   const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
         handleSearch();
      }
   };

   const handleDeleteClick = (comment: Comment) => {
      setCommentToDelete(comment);
      setShowDeleteModal(true);
   };

   const handleDeleteComment = async () => {
      if (!commentToDelete) return;

      setDeleting(true);
      try {
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/comments/${commentToDelete._id}`,
            {
               method: "DELETE",
               credentials: "include",
            }
         );

         if (!res.ok) {
            throw new Error("Không thể xóa bình luận");
         }

         const result = await res.json();

         if (result.success) {
            setComments((prev) =>
               prev.filter((c) => c._id !== commentToDelete._id)
            );
            alert("Xóa bình luận thành công!");
         }
      } catch (error) {
         alert((error as Error).message);
      } finally {
         setDeleting(false);
         setShowDeleteModal(false);
         setCommentToDelete(null);
      }
   };

   const renderStars = (rating?: number) => {
      if (!rating) return null;

      return (
         <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
               <svg
                  key={star}
                  className={`w-4 h-4 ${
                     star <= rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
               >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
               </svg>
            ))}
         </div>
      );
   };

   return (
      <div className="min-h-screen bg-gray-50 p-6">
         <div>
            {/* Header */}
            <div className="mb-6">
               <h1 className="text-3xl font-bold text-gray-900">
                  Quản lý bình luận sản phẩm
               </h1>
               <p className="text-gray-600 mt-2">
                  Tổng số: {pagination.total} bình luận
               </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Search */}
                  <div className="flex space-x-2">
                     <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Tìm kiếm theo nội dung hoặc tên người dùng..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     />
                     <button
                        onClick={handleSearch}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                     >
                        Tìm
                     </button>
                  </div>

                  {/* Sort */}
                  <select
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value)}
                     className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                     <option value="createdAt">Mới nhất</option>
                     <option value="oldest">Cũ nhất</option>
                     <option value="rating">Đánh giá cao nhất</option>
                  </select>
               </div>

               {search && (
                  <div className="mt-3 flex items-center space-x-2">
                     <span className="text-sm text-gray-600">
                        Đang tìm kiếm: <strong>{search}</strong>
                     </span>
                     <button
                        onClick={() => {
                           setSearch("");
                           setSearchInput("");
                        }}
                        className="text-sm text-red-500 hover:underline"
                     >
                        Xóa bộ lọc
                     </button>
                  </div>
               )}
            </div>

            {/* Comments List */}
            {loading ? (
               <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                     <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                     <p className="text-gray-600">Đang tải...</p>
                  </div>
               </div>
            ) : comments.length === 0 ? (
               <div className="bg-white rounded-lg shadow p-12 text-center">
                  <svg
                     className="mx-auto h-12 w-12 text-gray-400 mb-4"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                     />
                  </svg>
                  <p className="text-gray-600">Không có bình luận nào</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {comments.map((comment) => (
                     <div
                        key={comment._id}
                        className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow"
                     >
                        <div className="flex items-start space-x-4">
                           {/* User Avatar */}
                           <Image
                              src={comment.avatar}
                              alt={comment.username}
                              width={48}
                              height={48}
                              className="rounded-full object-cover"
                           />

                           {/* Content */}
                           <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                 <div>
                                    <h3 className="font-semibold text-gray-900">
                                       {comment.username}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                       {comment.userEmail}
                                    </p>
                                 </div>
                                 {comment.rating && renderStars(comment.rating)}
                              </div>

                              <p className="text-gray-700 mb-3">
                                 {comment.content}
                              </p>

                              {/* Product Info */}
                              <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg mb-3">
                                 <Image
                                    src={comment.productImage}
                                    alt={comment.productName}
                                    width={40}
                                    height={40}
                                    className="rounded object-cover"
                                 />
                                 <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                       {comment.productName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                       Sản phẩm
                                    </p>
                                 </div>
                              </div>

                              {/* Footer */}
                              <div className="flex items-center justify-between">
                                 <span className="text-xs text-gray-500">
                                    {new Date(comment.createdAt).toLocaleString(
                                       "vi-VN",
                                       {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                       }
                                    )}
                                 </span>
                                 <button
                                    onClick={() => handleDeleteClick(comment)}
                                    className="px-4 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                                 >
                                    Xóa
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {/* Pagination */}
            {!loading && comments.length > 0 && (
               <div className="bg-white rounded-lg shadow p-4 mt-6">
                  <div className="flex items-center justify-between">
                     <p className="text-sm text-gray-600">
                        Hiển thị {(pagination.page - 1) * pagination.limit + 1}{" "}
                        -{" "}
                        {Math.min(
                           pagination.page * pagination.limit,
                           pagination.total
                        )}{" "}
                        trong tổng số {pagination.total} bình luận
                     </p>
                     <div className="flex space-x-2">
                        <button
                           onClick={() =>
                              setPagination((prev) => ({
                                 ...prev,
                                 page: prev.page - 1,
                              }))
                           }
                           disabled={pagination.page === 1}
                           className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                           Trước
                        </button>
                        <span className="px-4 py-2 bg-blue-500 text-white rounded">
                           {pagination.page} / {pagination.totalPages}
                        </span>
                        <button
                           onClick={() =>
                              setPagination((prev) => ({
                                 ...prev,
                                 page: prev.page + 1,
                              }))
                           }
                           disabled={pagination.page === pagination.totalPages}
                           className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                           Sau
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* Delete Confirmation Modal */}
         <DeleteConfirmModal
            open={showDeleteModal}
            onClose={() => {
               if (!deleting) {
                  setShowDeleteModal(false);
                  setCommentToDelete(null);
               }
            }}
            onConfirm={handleDeleteComment}
            title="Xác nhận xóa bình luận"
            message="Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác."
            entityName={commentToDelete?.content || ""}
            confirmText={deleting ? "Đang xóa..." : "Xóa bình luận"}
            cancelText="Hủy"
            details={
               commentToDelete && (
                  <div className="space-y-2">
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500">
                           Người dùng:
                        </span>
                        <span className="text-sm text-gray-700">
                           {commentToDelete.username}
                        </span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500">
                           Sản phẩm:
                        </span>
                        <span className="text-sm text-gray-700">
                           {commentToDelete.productName}
                        </span>
                     </div>
                     {commentToDelete.rating && (
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-semibold text-gray-500">
                              Đánh giá:
                           </span>
                           <div className="flex">
                              {renderStars(commentToDelete.rating)}
                           </div>
                        </div>
                     )}
                  </div>
               )
            }
         />
      </div>
   );
};

export default CommentProducts;
