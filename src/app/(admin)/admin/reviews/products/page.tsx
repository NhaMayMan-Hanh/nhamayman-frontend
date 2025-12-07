"use client";

import { useState, useEffect } from "react";
import {
   Star,
   Eye,
   Search,
   Filter,
   ChevronLeft,
   ChevronRight,
   Trash2,
   MessageSquare,
   X,
   Send,
} from "lucide-react";
import apiRequest from "@lib/api";
import { Loading } from "@components/common/Loading";
import DeleteConfirmModal from "@components/admin/DeleteModal";

interface Review {
   _id: string;
   productId: string;
   userId: string;
   username: string;
   rating: number;
   content: string;
   createdAt: string;
   reply?: {
      content: string;
      createdAt: string;
   };
}

const ReplyModal = ({
   review,
   onClose,
   onSubmit,
}: {
   review: Review;
   onClose: () => void;
   onSubmit: (reviewId: string, replyContent: string) => Promise<void>;
}) => {
   const [replyContent, setReplyContent] = useState(
      review.reply?.content || ""
   );
   const [submitting, setSubmitting] = useState(false);

   const handleSubmit = async () => {
      if (!replyContent.trim()) {
         alert("Vui lòng nhập nội dung phản hồi");
         return;
      }

      setSubmitting(true);
      try {
         await onSubmit(review._id, replyContent);
         onClose();
      } catch (error) {
         alert("Gửi phản hồi thất bại!");
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="border-b px-6 py-4 flex items-center justify-between">
               <h3 className="text-xl font-bold text-gray-800">
                  {review.reply ? "Chỉnh sửa phản hồi" : "Phản hồi đánh giá"}
               </h3>
               <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg"
               >
                  <X className="w-5 h-5" />
               </button>
            </div>

            <div className="p-6 space-y-4">
               <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                     Đánh giá gốc:
                  </p>
                  <div className="flex items-center gap-1 mb-2">
                     {[...Array(5)].map((_, i) => (
                        <Star
                           key={i}
                           className={`w-4 h-4 ${
                              i < review.rating
                                 ? "fill-yellow-400 text-yellow-400"
                                 : "text-gray-300"
                           }`}
                        />
                     ))}
                  </div>
                  <p className="text-gray-700 font-medium">{review.username}</p>
                  <p className="text-gray-600 mt-1">{review.content}</p>
               </div>

               <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                     Nội dung phản hồi
                  </label>
                  <textarea
                     value={replyContent}
                     onChange={(e) => setReplyContent(e.target.value)}
                     placeholder="Nhập phản hồi của bạn..."
                     rows={6}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
               </div>

               <div className="flex gap-3 justify-end">
                  <button
                     onClick={onClose}
                     className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                     disabled={submitting}
                  >
                     Hủy
                  </button>
                  <button
                     onClick={handleSubmit}
                     disabled={submitting}
                     className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                     <Send className="w-4 h-4" />
                     {submitting ? "Đang gửi..." : "Gửi phản hồi"}
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

const ReviewProducts = () => {
   const [reviews, setReviews] = useState<Review[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const [searchTerm, setSearchTerm] = useState("");
   const [filterRating, setFilterRating] = useState("all");
   const [filterReplyStatus, setFilterReplyStatus] = useState("all");

   const [currentPage, setCurrentPage] = useState(1);
   const [selectedReview, setSelectedReview] = useState<Review | null>(null);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [showReplyModal, setShowReplyModal] = useState(false);
   const [deleting, setDeleting] = useState(false);

   const itemsPerPage = 10;

   useEffect(() => {
      fetchReviews();
   }, []);

   const fetchReviews = async () => {
      try {
         setLoading(true);
         setError(null);
         const res = await apiRequest.get<{ success: boolean; data: Review[] }>(
            "/admin/reviews/products"
         );
         if (res.success) {
            setReviews(res.data);
         }
      } catch (err: any) {
         setError("Không thể tải danh sách đánh giá");
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   const filteredReviews = reviews.filter((review) => {
      const matchesSearch =
         review.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
         review.content.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRating =
         filterRating === "all" || review.rating === Number(filterRating);

      const matchesReplyStatus =
         filterReplyStatus === "all" ||
         (filterReplyStatus === "replied" && review.reply) ||
         (filterReplyStatus === "not-replied" && !review.reply);
      return matchesSearch && matchesRating && matchesReplyStatus;
   });

   const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const paginatedReviews = filteredReviews.slice(
      startIndex,
      startIndex + itemsPerPage
   );

   const renderStars = (rating: number) => {
      return [...Array(5)].map((_, i) => (
         <Star
            key={i}
            className={`w-4 h-4 ${
               i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
         />
      ));
   };

   const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
         day: "2-digit",
         month: "2-digit",
         year: "numeric",
         hour: "2-digit",
         minute: "2-digit",
      });
   };

   const openReplyModal = (review: Review) => {
      setSelectedReview(review);
      setShowReplyModal(true);
   };

   const handleReplySubmit = async (reviewId: string, replyContent: string) => {
      try {
         await apiRequest.post(`/admin/reviews/${reviewId}/reply`, {
            content: replyContent,
         });

         // Cập nhật state
         setReviews((prev) =>
            prev.map((r) =>
               r._id === reviewId
                  ? {
                       ...r,
                       reply: {
                          content: replyContent,
                          createdAt: new Date().toISOString(),
                       },
                    }
                  : r
            )
         );
      } catch (error) {
         throw error;
      }
   };

   const confirmDelete = (review: Review) => {
      setSelectedReview(review);
      setShowDeleteModal(true);
   };

   const handleDeleteConfirm = async () => {
      if (!selectedReview) return;

      setDeleting(true);
      try {
         await apiRequest.delete(`/admin/reviews/${selectedReview._id}`);
         setReviews((prev) => prev.filter((r) => r._id !== selectedReview._id));
         setShowDeleteModal(false);
         setSelectedReview(null);
      } catch (err) {
         alert("Xóa đánh giá thất bại!");
      } finally {
         setDeleting(false);
      }
   };
   if (loading) return <Loading />;
   if (error)
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
               <p className="text-red-600 mb-4">{error}</p>
               <button
                  onClick={fetchReviews}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
               >
                  Thử lại
               </button>
            </div>
         </div>
      );

   const stats = {
      total: reviews.length,
      replied: reviews.filter((r) => r.reply).length,
      notReplied: reviews.filter((r) => !r.reply).length,
      avgRating: (
         reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0
      ).toFixed(1),
   };

   return (
      <>
         <div className="p-6 bg-gray-50 min-h-screen">
            <div>
               <h1 className="text-3xl font-bold text-gray-800 mb-6">
                  Quản Lý Đánh Giá Sản Phẩm
               </h1>

               {/* Thống kê */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                     <p className="text-gray-500 text-sm">Tổng đánh giá</p>
                     <p className="text-2xl font-bold text-gray-800">
                        {stats.total}
                     </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                     <p className="text-gray-500 text-sm">Đã phản hồi</p>
                     <p className="text-2xl font-bold text-green-600">
                        {stats.replied}
                     </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                     <p className="text-gray-500 text-sm">Chưa phản hồi</p>
                     <p className="text-2xl font-bold text-orange-600">
                        {stats.notReplied}
                     </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                     <p className="text-gray-500 text-sm">Đánh giá TB</p>
                     <p className="text-2xl font-bold text-yellow-600">
                        {stats.avgRating} <Star />
                     </p>
                  </div>
               </div>

               {/* Bộ lọc */}
               <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                  <div className="flex flex-col gap-4">
                     {/* Hàng 1: Tìm kiếm + Lọc cơ bản */}
                     <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                           <input
                              type="text"
                              placeholder="Tìm theo tên hoặc nội dung..."
                              value={searchTerm}
                              onChange={(e) => {
                                 setSearchTerm(e.target.value);
                                 setCurrentPage(1);
                              }}
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                           />
                        </div>
                        <div className="flex items-center gap-3">
                           <Filter className="text-gray-500 w-5 h-5" />
                           <select
                              value={filterRating}
                              onChange={(e) => {
                                 setFilterRating(e.target.value);
                                 setCurrentPage(1);
                              }}
                              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                           >
                              <option value="all">Tất cả sao</option>
                              <option value="5">5 sao</option>
                              <option value="4">4 sao</option>
                              <option value="3">3 sao</option>
                              <option value="2">2 sao</option>
                              <option value="1">1 sao</option>
                           </select>
                           <select
                              value={filterReplyStatus}
                              onChange={(e) => {
                                 setFilterReplyStatus(e.target.value);
                                 setCurrentPage(1);
                              }}
                              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                           >
                              <option value="all">Tất cả trạng thái</option>
                              <option value="replied">Đã phản hồi</option>
                              <option value="not-replied">Chưa phản hồi</option>
                           </select>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Bảng */}
               <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                     <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                           <tr>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                                 STT
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                                 Người đánh giá
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                                 Đánh giá
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                                 Nội dung
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                                 Trạng thái
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                                 Ngày đánh giá
                              </th>
                              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                                 Hành động
                              </th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                           {paginatedReviews.length === 0 ? (
                              <tr>
                                 <td
                                    colSpan={7}
                                    className="text-center py-12 text-gray-500"
                                 >
                                    Không tìm thấy đánh giá nào
                                 </td>
                              </tr>
                           ) : (
                              paginatedReviews.map((review, idx) => (
                                 <tr
                                    key={review._id}
                                    className="hover:bg-gray-50 transition-colors"
                                 >
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                       {startIndex + idx + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                       <div className="text-sm font-medium text-gray-900">
                                          {review.username}
                                       </div>
                                       <div className="text-xs text-gray-500">
                                          ID: {review.userId.slice(-8)}
                                       </div>
                                    </td>
                                    <td className="px-6 py-4">
                                       <div className="flex items-center gap-1">
                                          {renderStars(review.rating)}
                                          <span className="ml-2 text-sm font-medium">
                                             {review.rating}.0
                                          </span>
                                       </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-md">
                                       <p className="text-sm text-gray-700 line-clamp-2">
                                          {review.content}
                                       </p>
                                    </td>
                                    <td className="px-6 py-4">
                                       {review.reply ? (
                                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                             Đã phản hồi
                                          </span>
                                       ) : (
                                          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                             Chưa phản hồi
                                          </span>
                                       )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                       {formatDate(review.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                       <div className="flex justify-center gap-2">
                                          <button
                                             className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                             title="Xem chi tiết"
                                          >
                                             <Eye className="w-5 h-5" />
                                          </button>
                                          <button
                                             onClick={() =>
                                                openReplyModal(review)
                                             }
                                             className={`p-2 rounded-lg transition ${
                                                review.reply
                                                   ? "text-green-600 hover:bg-green-50"
                                                   : "text-purple-600 hover:bg-purple-50"
                                             }`}
                                             title={
                                                review.reply
                                                   ? "Sửa phản hồi"
                                                   : "Phản hồi"
                                             }
                                          >
                                             <MessageSquare className="w-5 h-5" />
                                          </button>
                                          <button
                                             onClick={() =>
                                                confirmDelete(review)
                                             }
                                             className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                             title="Xóa đánh giá"
                                          >
                                             <Trash2 className="w-5 h-5" />
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              ))
                           )}
                        </tbody>
                     </table>
                  </div>

                  {/* Phân trang */}
                  {totalPages > 1 && (
                     <div className="px-6 py-4 border-t flex items-center justify-between text-sm text-gray-700">
                        <span>
                           Hiển thị {startIndex + 1} -{" "}
                           {Math.min(
                              startIndex + itemsPerPage,
                              filteredReviews.length
                           )}{" "}
                           / {filteredReviews.length}
                        </span>
                        <div className="flex gap-2">
                           <button
                              onClick={() =>
                                 setCurrentPage((p) => Math.max(1, p - 1))
                              }
                              disabled={currentPage === 1}
                              className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                           >
                              <ChevronLeft className="w-5 h-5" />
                           </button>
                           {[...Array(totalPages)].map((_, i) => (
                              <button
                                 key={i}
                                 onClick={() => setCurrentPage(i + 1)}
                                 className={`px-3 py-1 rounded ${
                                    currentPage === i + 1
                                       ? "bg-blue-600 text-white"
                                       : "border hover:bg-gray-100"
                                 }`}
                              >
                                 {i + 1}
                              </button>
                           ))}
                           <button
                              onClick={() =>
                                 setCurrentPage((p) =>
                                    Math.min(totalPages, p + 1)
                                 )
                              }
                              disabled={currentPage === totalPages}
                              className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                           >
                              <ChevronRight className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Modal phản hồi */}
         {showReplyModal && selectedReview && (
            <ReplyModal
               review={selectedReview}
               onClose={() => {
                  setShowReplyModal(false);
                  setSelectedReview(null);
               }}
               onSubmit={handleReplySubmit}
            />
         )}

         {/* Modal xóa */}
         <DeleteConfirmModal
            open={showDeleteModal}
            onClose={() => {
               setShowDeleteModal(false);
               setSelectedReview(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Xóa đánh giá sản phẩm"
            message="Đánh giá này sẽ bị xóa vĩnh viễn và không thể khôi phục."
            entityName={selectedReview?.username || ""}
            confirmText={deleting ? "Đang xóa..." : "Xóa đánh giá"}
            cancelText="Hủy bỏ"
            details={
               selectedReview && (
                  <div className="space-y-2 text-sm">
                     <p>
                        <strong>Nội dung:</strong> {selectedReview.content}
                     </p>
                     <p>
                        <strong>Đánh giá:</strong> {selectedReview.rating} sao
                     </p>
                  </div>
               )
            }
         />
      </>
   );
};

export default ReviewProducts;
