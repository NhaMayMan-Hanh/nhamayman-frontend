// app/admin/users/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface UserDetail {
   _id: string;
   name: string;
   username: string;
   email: string;
   avatar?: string;
   role: string;
   isVerified: boolean;
   createdAt: string;
   updatedAt: string;
}

// Helper an toàn cho toast (không crash nếu ToastContainer chưa mount)
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

const formatDate = (dateString: string) => {
   return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
   });
};

// Modal xác nhận xóa
function DeleteModal({
   user,
   onClose,
   onConfirm,
}: {
   user: UserDetail;
   onClose: () => void;
   onConfirm: () => void;
}) {
   return (
      <div
         className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
         onClick={onClose}
      >
         <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
         >
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
               <h3 className="text-xl font-semibold text-gray-900">
                  Xác nhận xóa người dùng
               </h3>
               <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
               >
                  <svg
                     className="w-6 h-6"
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
               <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <svg
                     className="w-6 h-6 text-red-600 shrink-0 mt-0.5"
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
                        Bạn có chắc chắn muốn xóa người dùng này? Hành động này{" "}
                        <strong>không thể hoàn tác</strong>.
                     </p>
                  </div>
               </div>

               <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
               </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 rounded-b-xl">
               <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
               >
                  Hủy bỏ
               </button>
               <button
                  onClick={onConfirm}
                  className="w-full sm:w-auto px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
               >
                  Xóa người dùng
               </button>
            </div>
         </div>
      </div>
   );
}

export default function UserDetailPage() {
   const params = useParams();
   const router = useRouter();
   const userId = params.id as string;

   const [user, setUser] = useState<UserDetail | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [showDeleteModal, setShowDeleteModal] = useState(false);

   useEffect(() => {
      const fetchUser = async () => {
         try {
            setLoading(true);
            const res = await fetch(
               `http://localhost:5000/api/admin/users/${userId}`,
               {
                  credentials: "include",
               }
            );

            const result = await res.json();

            if (result.success) {
               setUser(result.data);
               setError(null);
            } else {
               setError(result.message || "Không thể tải thông tin người dùng");
            }
         } catch (err) {
            setError("Lỗi kết nối đến server");
            console.error(err);
         } finally {
            setLoading(false);
         }
      };

      if (userId) fetchUser();
   }, [userId]);

   const handleDelete = async () => {
      if (!user) return;

      const toastId = showToast("Đang xóa người dùng...", "loading");

      try {
         const res = await fetch(
            `http://localhost:5000/api/admin/users/${user._id}`,
            {
               method: "DELETE",
               credentials: "include",
            }
         );

         if (res.ok) {
            updateToast(
               toastId,
               `Đã xóa người dùng "${user.name}" thành công!`,
               "success"
            );
            setTimeout(() => {
               router.push("/admin/users");
            }, 1500);
         } else {
            const errorData = await res.json();
            updateToast(
               toastId,
               errorData.message || "Xóa người dùng thất bại",
               "error"
            );
         }
      } catch (err) {
         updateToast(toastId, "Lỗi kết nối server", "error");
         console.error("Delete error:", err);
      } finally {
         setShowDeleteModal(false);
      }
   };

   // Loading state
   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
               <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
            </div>
         </div>
      );
   }

   // Error state
   if (error || !user) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
               <svg
                  className="w-16 h-16 text-red-500 mx-auto mb-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
               >
                  <path
                     fillRule="evenodd"
                     d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                     clipRule="evenodd"
                  />
               </svg>
               <h3 className="text-lg font-semibold text-red-800">
                  Lỗi tải dữ liệu
               </h3>
               <p className="text-red-700 mt-2">
                  {error || "Người dùng không tồn tại"}
               </p>
               <Link
                  href="/admin/users"
                  className="mt-6 inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
               >
                  Quay lại danh sách
               </Link>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
         <div>
            <div className="mb-8 flex items-center justify-between">
               <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                     Chi tiết người dùng
                  </h1>
                  <p className="text-gray-600 mt-1">
                     Thông tin đầy đủ về tài khoản
                  </p>
               </div>
               <Link
                  href="/admin/users"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
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
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                     />
                  </svg>
                  Quay lại
               </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Avatar + Info cơ bản */}
               <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                     <div className="relative inline-block">
                        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                           {user.avatar ? (
                              <img
                                 src={user.avatar}
                                 alt={user.name}
                                 className="w-full h-full object-cover rounded-full"
                              />
                           ) : (
                              <div className="w-full h-full bg-blue-100 flex items-center justify-center rounded-full">
                                 <span className="text-4xl font-bold text-blue-600">
                                    {user.name.charAt(0).toUpperCase()}
                                 </span>
                              </div>
                           )}
                        </div>
                        {user.isVerified ? (
                           <div className="absolute bottom-0 right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                              <svg
                                 className="w-6 h-6"
                                 fill="currentColor"
                                 viewBox="0 0 20 20"
                              >
                                 <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                 />
                              </svg>
                           </div>
                        ) : (
                           <div className="absolute bottom-0 right-2 bg-yellow-500 text-white rounded-full p-2 shadow-lg">
                              <svg
                                 className="w-6 h-6"
                                 fill="currentColor"
                                 viewBox="0 0 20 20"
                              >
                                 <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                 />
                              </svg>
                           </div>
                        )}
                     </div>

                     <h2 className="mt-6 text-2xl font-bold text-gray-900">
                        {user.name}
                     </h2>
                     <p className="text-gray-500">@{user.username}</p>

                     <div className="mt-4">
                        <span
                           className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                              user.role === "admin"
                                 ? "bg-purple-100 text-purple-800"
                                 : "bg-blue-100 text-blue-800"
                           }`}
                        >
                           {user.role === "admin"
                              ? "Quản trị viên"
                              : "Người dùng"}
                        </span>
                     </div>

                     <div className="mt-4 pt-4 border-t border-gray-200">
                        <p
                           className={`text-sm font-medium ${
                              user.isVerified
                                 ? "text-green-600"
                                 : "text-yellow-600"
                           }`}
                        >
                           {user.isVerified
                              ? "Đã xác thực email"
                              : "Chưa xác thực email"}
                        </p>
                     </div>
                  </div>
               </div>

               {/* Thông tin chi tiết + Hành động */}
               <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Thông tin tài khoản
                     </h3>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                           <span className="text-gray-600">Email</span>
                           <span className="font-medium text-gray-900">
                              {user.email}
                           </span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                           <span className="text-gray-600">ID người dùng</span>
                           <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                              {user._id}
                           </code>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                           <span className="text-gray-600">
                              Ngày tạo tài khoản
                           </span>
                           <span className="font-medium text-gray-900">
                              {formatDate(user.createdAt)}
                           </span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                           <span className="text-gray-600">
                              Cập nhật lần cuối
                           </span>
                           <span className="font-medium text-gray-900">
                              {formatDate(user.updatedAt)}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Hành động
                     </h3>
                     <div className="flex flex-wrap gap-3">
                        <Link
                           href={`/admin/users/edit/${user._id}`}
                           className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
                                 d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                           </svg>
                           Chỉnh sửa người dùng
                        </Link>

                        <button
                           onClick={() => setShowDeleteModal(true)}
                           className="flex items-center gap-2 px-5 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
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
                           Xóa người dùng
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Modal xóa */}
         {showDeleteModal && user && (
            <DeleteModal
               user={user}
               onClose={() => setShowDeleteModal(false)}
               onConfirm={handleDelete}
            />
         )}
      </div>
   );
}
