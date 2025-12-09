"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
   MessageSquare,
   User,
   Calendar,
   ArrowLeft,
   Mail,
   CheckCircle,
   Clock,
   Shield,
} from "lucide-react";
import apiRequest from "@lib/api";
import { useNotifications } from "@contexts/NotificationContext";
import Link from "next/link";

interface Feedback {
   _id: string;
   userId: string;
   email: string | null;
   message: string;
   isReplied: boolean;
   createdAt: string;
   __v: number;
}

interface Reply {
   _id: string;
   userId: string;
   email: string | null;
   type: string;
   title: string;
   message: string;
   relatedId: string;
   relatedModel: string;
   link: string;
   metadata: {
      adminResponse: string;
      feedbackMessage: string;
   };
   isRead: boolean;
   createdAt: string;
   __v: number;
}

interface ApiResponse {
   success: boolean;
   data: {
      feedback: Feedback;
      replies: Reply[];
   };
}

const DetailFeedback = () => {
   const [data, setData] = useState<{
      feedback: Feedback;
      replies: Reply[];
   } | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const params = useParams();
   const router = useRouter();
   const searchParams = useSearchParams();
   const { markAsRead } = useNotifications();

   const feedbackId = params?.id as string;
   const notificationId = searchParams.get("notificationId");

   useEffect(() => {
      const fetchFeedback = async () => {
         if (!feedbackId) {
            setError("Không tìm thấy mã feedback");
            setLoading(false);
            return;
         }

         try {
            setLoading(true);

            // Đánh dấu đã đọc notification nếu có
            if (notificationId) {
               try {
                  await markAsRead(notificationId);
               } catch (err) {
                  console.error("Không thể đánh dấu thông báo đã đọc:", err);
               }
            }

            const response = await apiRequest.get<ApiResponse>(
               `/client/feedback/${feedbackId}`
            );

            if (response.success) {
               setData(response.data);
            } else {
               setError("Không thể tải thông tin feedback");
            }
         } catch (err: any) {
            setError(err.message || "Đã có lỗi xảy ra");
         } finally {
            setLoading(false);
         }
      };

      fetchFeedback();
   }, [feedbackId, notificationId]);

   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString("vi-VN", {
         year: "numeric",
         month: "2-digit",
         day: "2-digit",
         hour: "2-digit",
         minute: "2-digit",
      });
   };

   const formatTimeAgo = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return "Vừa xong";
      if (diffInSeconds < 3600)
         return `${Math.floor(diffInSeconds / 60)} phút trước`;
      if (diffInSeconds < 86400)
         return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
      if (diffInSeconds < 604800)
         return `${Math.floor(diffInSeconds / 86400)} ngày trước`;

      return date.toLocaleDateString("vi-VN");
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
               <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
               <div className="text-red-500 text-5xl mb-4">⚠️</div>
               <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Có lỗi xảy ra
               </h2>
               <p className="text-gray-600">{error}</p>
               <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
               >
                  Thử lại
               </button>
            </div>
         </div>
      );
   }

   if (!data) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-600">Không tìm thấy feedback</p>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
         <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <Link
               href="/notification"
               className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors cursor-pointer"
            >
               <ArrowLeft className="w-5 h-5" />
               <span className="font-medium">Quay lại thông báo</span>
            </Link>

            {/* Header */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
               <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                     </div>
                     <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                           Chi tiết phản hồi
                        </h1>
                        <p className="text-gray-600 text-sm">
                           Mã:{" "}
                           <span className="font-mono font-semibold">
                              {data.feedback._id}
                           </span>
                        </p>
                     </div>
                  </div>
                  <div>
                     <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                           data.feedback.isReplied
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        }`}
                     >
                        {data.feedback.isReplied ? (
                           <>
                              <CheckCircle className="w-4 h-4" />
                              Đã phản hồi
                           </>
                        ) : (
                           <>
                              <Clock className="w-4 h-4" />
                              Chờ phản hồi
                           </>
                        )}
                     </span>
                  </div>
               </div>
            </div>

            {/* Original Feedback Message */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
               <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                     <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                     <h3 className="font-semibold text-gray-900">
                        Tin nhắn của bạn
                     </h3>
                     <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1.5">
                           <Calendar className="w-4 h-4" />
                           {formatDate(data.feedback.createdAt)}
                        </div>
                        <span className="text-gray-300">•</span>
                        <span>{formatTimeAgo(data.feedback.createdAt)}</span>
                     </div>
                  </div>
               </div>
               <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                     {data.feedback.message}
                  </p>
               </div>
               {data.feedback.email && (
                  <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                     <Mail className="w-4 h-4" />
                     <span>Email liên hệ: {data.feedback.email}</span>
                  </div>
               )}
            </div>

            {/* Replies Section */}
            {data.replies.length > 0 && (
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                     <MessageSquare className="w-5 h-5 text-gray-600" />
                     <h2 className="text-lg font-semibold text-gray-900">
                        Phản hồi ({data.replies.length})
                     </h2>
                  </div>

                  {data.replies.map((reply) => (
                     <div
                        key={reply._id}
                        className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
                     >
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                           <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Shield className="w-5 h-5 text-white" />
                           </div>
                           <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                 Quản trị viên
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                 <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(reply.createdAt)}
                                 </div>
                                 <span className="text-gray-300">•</span>
                                 <span>{formatTimeAgo(reply.createdAt)}</span>
                              </div>
                           </div>
                           {!reply.isRead && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                 Mới
                              </span>
                           )}
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                           <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                              {reply.metadata.adminResponse}
                           </p>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {/* Empty State for No Replies */}
            {data.replies.length === 0 && (
               <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                     Chưa có phản hồi
                  </h3>
                  <p className="text-gray-500">
                     Chúng tôi sẽ phản hồi tin nhắn của bạn trong thời gian sớm
                     nhất
                  </p>
               </div>
            )}
         </div>
      </div>
   );
};

export default DetailFeedback;
