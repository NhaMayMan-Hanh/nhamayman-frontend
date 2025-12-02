"use client";

import React, { useState, useEffect } from "react";
import {
   Mail,
   MessageSquare,
   Clock,
   CheckCircle,
   XCircle,
   Send,
   RefreshCw,
} from "lucide-react";
import { useToast } from "@contexts/ToastContext";
import apiRequest from "@lib/api";
import Loading from "@components/admin/Loading";
// Types
interface Feedback {
   _id: string;
   email: string | null;
   message: string;
   adminResponse: string | null;
   isReplied: boolean;
   repliedAt: string | null;
   createdAt: string;
   __v?: number;
}

interface ApiResponse {
   success: boolean;
   data: Feedback[];
}

interface Stats {
   total: number;
   replied: number;
   unreplied: number;
}

type FilterType = "all" | "replied" | "unreplied";

const FeedbackManagement: React.FC = () => {
   const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
      null
   );
   const [replyText, setReplyText] = useState<string>("");
   const [filter, setFilter] = useState<FilterType>("all");

   const toast = useToast();

   const fetchFeedbacks = async (): Promise<void> => {
      setLoading(true);
      try {
         const result = await apiRequest.get<ApiResponse>(
            "/client/feedback/all"
         );
         if (result.success) {
            setFeedbacks(result.data);
         }
      } catch (error: any) {
         toast.error(error.message || "Không thể tải danh sách feedback");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchFeedbacks();
   }, []);

   const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
         year: "numeric",
         month: "2-digit",
         day: "2-digit",
         hour: "2-digit",
         minute: "2-digit",
      });
   };

   const handleReply = (feedback: Feedback): void => {
      setSelectedFeedback(feedback);
      setReplyText(feedback.adminResponse || "");
   };

   const handleSendReply = async (): Promise<void> => {
      if (!replyText.trim()) {
         toast.error("Vui lòng nhập nội dung phản hồi");
         return;
      }

      if (!selectedFeedback) return;

      try {
         await apiRequest.post(
            `/client/feedback/${selectedFeedback._id}/reply`,
            { adminResponse: replyText }
         );

         // Cập nhật optimistic UI
         setFeedbacks((prev) =>
            prev.map((fb) =>
               fb._id === selectedFeedback._id
                  ? {
                       ...fb,
                       adminResponse: replyText,
                       isReplied: true,
                       repliedAt: new Date().toISOString(),
                    }
                  : fb
            )
         );

         toast.success("Đã gửi phản hồi thành công!");
         setSelectedFeedback(null);
         setReplyText("");
      } catch (error: any) {
         toast.error(error.message || "Gửi phản hồi thất bại");
      }
   };

   const filteredFeedbacks: Feedback[] = feedbacks.filter((fb) => {
      if (filter === "replied") return fb.isReplied;
      if (filter === "unreplied") return !fb.isReplied;
      return true;
   });

   const stats: Stats = {
      total: feedbacks.length,
      replied: feedbacks.filter((fb) => fb.isReplied).length,
      unreplied: feedbacks.filter((fb) => !fb.isReplied).length,
   };

   if (loading) {
      return <Loading />;
   }
   return (
      <div className="min-h-screen bg-gray-50 p-6">
         {/* Header */}
         <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
               <h1 className="text-3xl font-bold text-gray-900">
                  Quản Lý Feedback
               </h1>
               <button
                  onClick={fetchFeedbacks}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                  <RefreshCw className="w-4 h-4" />
                  Làm mới
               </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
               <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3">
                     <MessageSquare className="w-8 h-8 text-blue-600" />
                     <div>
                        <p className="text-sm text-gray-600">Tổng số</p>
                        <p className="text-2xl font-bold text-gray-900">
                           {stats.total}
                        </p>
                     </div>
                  </div>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3">
                     <CheckCircle className="w-8 h-8 text-green-600" />
                     <div>
                        <p className="text-sm text-gray-600">Đã trả lời</p>
                        <p className="text-2xl font-bold text-gray-900">
                           {stats.replied}
                        </p>
                     </div>
                  </div>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3">
                     <XCircle className="w-8 h-8 text-orange-600" />
                     <div>
                        <p className="text-sm text-gray-600">Chưa trả lời</p>
                        <p className="text-2xl font-bold text-gray-900">
                           {stats.unreplied}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Filter Buttons */}
         <div className="mb-6 flex gap-2">
            {(["all", "unreplied", "replied"] as const).map((type) => (
               <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                     filter === type
                        ? type === "all"
                           ? "bg-blue-600 text-white"
                           : type === "unreplied"
                           ? "bg-orange-600 text-white"
                           : "bg-green-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border"
                  }`}
               >
                  {type === "all" && "Tất cả"}
                  {type === "unreplied" && "Chưa trả lời"}
                  {type === "replied" && "Đã trả lời"}
               </button>
            ))}
         </div>

         {/* Feedback Table */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                     <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Tin nhắn
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Thời gian
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Hành động
                        </th>
                     </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {filteredFeedbacks.map((feedback) => (
                        <tr key={feedback._id} className="hover:bg-gray-50">
                           <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                 <Mail className="w-4 h-4 text-gray-400" />
                                 <span className="text-sm text-gray-900">
                                    {feedback.email || "Không có email"}
                                 </span>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <p className="text-sm text-gray-900 line-clamp-2">
                                 {feedback.message}
                              </p>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                 <Clock className="w-4 h-4 text-gray-400" />
                                 {formatDate(feedback.createdAt)}
                              </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              {feedback.isReplied ? (
                                 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3" />
                                    Đã trả lời
                                 </span>
                              ) : (
                                 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    <XCircle className="w-3 h-3" />
                                    Chưa trả lời
                                 </span>
                              )}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                 onClick={() => handleReply(feedback)}
                                 className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                              >
                                 {feedback.isReplied ? "Xem/Sửa" : "Trả lời"}
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>

               {filteredFeedbacks.length === 0 && (
                  <div className="text-center py-12">
                     <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                     <p className="text-gray-600">Không có feedback nào</p>
                  </div>
               )}
            </div>
         </div>

         {/* Reply Modal */}
         {selectedFeedback && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
               <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                     <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Trả lời Feedback
                     </h2>

                     <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                           <Mail className="w-4 h-4 text-gray-500" />
                           <span className="text-sm font-medium text-gray-700">
                              {selectedFeedback.email || "Không có email"}
                           </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                           <strong>Tin nhắn:</strong> {selectedFeedback.message}
                        </p>
                        <p className="text-xs text-gray-500">
                           {formatDate(selectedFeedback.createdAt)}
                        </p>
                     </div>

                     <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Nội dung phản hồi
                        </label>
                        <textarea
                           value={replyText}
                           onChange={(e) => setReplyText(e.target.value)}
                           rows={6}
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                           placeholder="Nhập nội dung phản hồi của bạn..."
                        />
                     </div>

                     <div className="flex gap-3 justify-end">
                        <button
                           onClick={() => {
                              setSelectedFeedback(null);
                              setReplyText("");
                           }}
                           className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                           Hủy
                        </button>
                        <button
                           onClick={handleSendReply}
                           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                           <Send className="w-4 h-4" />
                           Gửi phản hồi
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default FeedbackManagement;
