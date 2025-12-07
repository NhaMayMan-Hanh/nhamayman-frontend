"use client";

import { useState } from "react";
import {
   Bell,
   CheckCheck,
   Clock,
   MessageSquare,
   AlertCircle,
   Trash2,
   Filter,
} from "lucide-react";
import ProfileSidebar from "@components/client/profile/ProfileSidebar";
import { useNotifications } from "@contexts/NotificationContext";
import apiRequest from "@lib/api";
export default function NotificationPage() {
   const {
      notifications,
      loading,
      markAsRead,
      markAllAsRead,
      refreshNotifications,
   } = useNotifications();

   const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
   const [error, setError] = useState<string | null>(null);

   const deleteNotification = async (notificationId: string) => {
      try {
         if (confirm("Bạn chắc chắn muốn xóa thông báo này!")) {
            await apiRequest.delete(`/client/notification/${notificationId}`);
            // Refresh notifications after delete
            await refreshNotifications();
         }
      } catch (err) {
         console.error("Không thể xóa thông báo:", err);
         setError("Không thể xóa thông báo");
      }
   };

   const handleMarkAsRead = async (notificationId: string) => {
      try {
         await markAsRead(notificationId);
      } catch (err) {
         console.error("Không thể đánh dấu đã đọc:", err);
         setError("Không thể đánh dấu đã đọc");
      }
   };

   const handleMarkAllAsRead = async () => {
      try {
         await markAllAsRead();
      } catch (err) {
         console.error("Không thể đánh dấu tất cả:", err);
         setError("Không thể đánh dấu tất cả");
      }
   };

   const getNotificationIcon = (type: string) => {
      const iconClasses = "w-5 h-5";
      switch (type) {
         case "FEEDBACK_REPLY":
            return <MessageSquare className={iconClasses} />;
         case "ORDER_UPDATE":
            return <Bell className={iconClasses} />;
         case "SYSTEM":
            return <AlertCircle className={iconClasses} />;
         default:
            return <Bell className={iconClasses} />;
      }
   };

   const getNotificationColor = (type: string) => {
      switch (type) {
         case "FEEDBACK_REPLY":
            return "bg-blue-100 text-blue-600";
         case "ORDER_UPDATE":
            return "bg-green-100 text-green-600";
         case "SYSTEM":
            return "bg-orange-100 text-orange-600";
         default:
            return "bg-gray-100 text-gray-600";
      }
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

   const filteredNotifications = notifications.filter((notif) => {
      if (filter === "unread") return !notif.isRead;
      if (filter === "read") return notif.isRead;
      return true;
   });

   const unreadCount = notifications.filter((n) => !n.isRead).length;

   return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
         <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
               {/* Sidebar */}
               <ProfileSidebar activePath="/notification" />

               {/* Main Content */}
               <div className="lg:col-span-3">
                  {/* Header */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-6 border border-gray-100">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                           <div className="relative">
                              <div className="w-8 h-8 bg-[#3494c8] to-indigo-600 rounded-2xl flex items-center justify-center">
                                 <Bell className="w-7 h-7 text-white" />
                              </div>
                           </div>
                           <div>
                              <h1 className="text-xl font-bold text-gray-900">
                                 Thông báo
                              </h1>
                              <p className="text-sm text-gray-500 mt-0.5">
                                 {unreadCount > 0
                                    ? `${unreadCount} thông báo chưa đọc`
                                    : "Không có thông báo mới"}
                              </p>
                           </div>
                        </div>

                        {unreadCount > 0 && (
                           <button
                              onClick={handleMarkAllAsRead}
                              className="flex items-center gap-2 px-5 py-2.5 hover:underline font-medium cursor-pointer text-[#ea8724]"
                           >
                              <CheckCheck className="w-4 h-4" />
                              Đánh dấu tất cả đã đọc
                           </button>
                        )}
                     </div>

                     {/* Filters */}
                     <div className="flex items-center gap-3 pt-5 border-t border-gray-200">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <div className="flex gap-2">
                           {(["all", "unread", "read"] as const).map((f) => (
                              <button
                                 key={f}
                                 onClick={() => setFilter(f)}
                                 className={`px-5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                                    filter === f
                                       ? "bg-[#3494c8] text-white shadow-md"
                                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                 }`}
                              >
                                 {f === "all"
                                    ? "Tất cả"
                                    : f === "unread"
                                    ? "Chưa đọc"
                                    : "Đã đọc"}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Notifications List */}
                  <div className="space-y-4">
                     {loading ? (
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-12 text-center border border-gray-100">
                           <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                           <p className="text-gray-500">
                              Đang tải thông báo...
                           </p>
                        </div>
                     ) : error ? (
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-12 text-center border border-gray-100">
                           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                           <p className="text-gray-900 font-medium mb-2">
                              Có lỗi xảy ra
                           </p>
                           <p className="text-gray-500 mb-4">{error}</p>
                           <button
                              onClick={refreshNotifications}
                              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
                           >
                              Thử lại
                           </button>
                        </div>
                     ) : filteredNotifications.length === 0 ? (
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-12 text-center border border-gray-100">
                           <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Bell className="w-10 h-10 text-gray-400" />
                           </div>
                           <p className="text-gray-900 font-medium mb-2">
                              Không có thông báo
                           </p>
                           <p className="text-gray-500">
                              {filter === "unread"
                                 ? "Bạn đã đọc tất cả thông báo"
                                 : filter === "read"
                                 ? "Chưa có thông báo đã đọc"
                                 : "Chưa có thông báo nào"}
                           </p>
                        </div>
                     ) : (
                        filteredNotifications.map((notification) => (
                           <div
                              key={notification._id}
                              className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl transition-all border ${
                                 !notification.isRead
                                    ? "border-blue-200 ring-2 ring-blue-100"
                                    : "border-gray-100"
                              }`}
                           >
                              <div className="p-6">
                                 <div className="flex gap-4">
                                    {/* Icon */}
                                    <div className="relative">
                                       <div
                                          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getNotificationColor(
                                             notification.type
                                          )}`}
                                       >
                                          {getNotificationIcon(
                                             notification.type
                                          )}
                                       </div>
                                       {!notification.isRead && (
                                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                             <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                          </span>
                                       )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                       <div className="flex items-start justify-between gap-4 mb-2">
                                          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                                             {notification.title}
                                          </h3>
                                       </div>

                                       <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                          {notification.message}
                                       </p>

                                       {notification.metadata && (
                                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-3 text-sm border border-gray-200">
                                             {notification.metadata
                                                .feedbackMessage && (
                                                <p className="text-gray-600 mb-2">
                                                   <span className="font-semibold text-gray-700">
                                                      Tin nhắn của bạn:
                                                   </span>{" "}
                                                   {
                                                      notification.metadata
                                                         .feedbackMessage
                                                   }
                                                </p>
                                             )}
                                             {notification.metadata
                                                .adminResponse && (
                                                <p className="text-gray-700">
                                                   <span className="font-semibold text-blue-600">
                                                      Phản hồi:
                                                   </span>{" "}
                                                   {
                                                      notification.metadata
                                                         .adminResponse
                                                   }
                                                </p>
                                             )}
                                          </div>
                                       )}

                                       <div className="flex items-center gap-3 text-sm flex-wrap">
                                          <div className="flex items-center gap-1.5 text-gray-500">
                                             <Clock className="w-4 h-4" />
                                             {formatTimeAgo(
                                                notification.createdAt
                                             )}
                                          </div>

                                          <div className="flex items-center gap-2 ml-auto">
                                             <button className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all font-medium cursor-pointer">
                                                <span>Chi tiết</span>
                                                <svg
                                                   className="w-4 h-4"
                                                   fill="none"
                                                   stroke="currentColor"
                                                   viewBox="0 0 24 24"
                                                >
                                                   <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth={2}
                                                      d="M9 5l7 7-7 7"
                                                   />
                                                </svg>
                                             </button>

                                             {!notification.isRead && (
                                                <button
                                                   onClick={() =>
                                                      handleMarkAsRead(
                                                         notification._id
                                                      )
                                                   }
                                                   className="px-3 py-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all font-medium cursor-pointer"
                                                >
                                                   Đánh dấu đã đọc
                                                </button>
                                             )}

                                             <button
                                                onClick={() =>
                                                   deleteNotification(
                                                      notification._id
                                                   )
                                                }
                                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                             >
                                                <Trash2 className="w-4 h-4" />
                                             </button>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
