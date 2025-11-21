// app/admin/users/[id]/edit/page.tsx   (hoặc edit/[id]/page.tsx)
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@contexts/AuthContext";

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

interface UserEdit {
   _id: string;
   name: string;
   username: string;
   email: string;
   role: "user" | "admin";
}

export default function EditUserPage() {
   const params = useParams();
   const router = useRouter();
   const userId = params.id as string;
   const { user: currentAdmin } = useAuth();

   const [user, setUser] = useState<UserEdit | null>(null);
   const [formData, setFormData] = useState({
      name: "",
      username: "",
      role: "user" as "user" | "admin",
   });
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [sendingReset, setSendingReset] = useState(false);

   // Fetch user
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

            if (result.success && result.data) {
               const u = result.data;
               setUser(u);
               setFormData({
                  name: u.name || "",
                  username: u.username || "",
                  role: u.role || "user",
               });
            } else {
               showToast("Không tải được thông tin người dùng", "error");
               router.replace("/admin/users");
            }
         } catch (err) {
            showToast("Lỗi kết nối server", "error");
         } finally {
            setLoading(false);
         }
      };

      if (userId) fetchUser();
   }, [userId, router]);

   // Lưu thay đổi
   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || saving) return;

      // Không cho tự đổi role của chính mình
      if (
         currentAdmin &&
         user._id === currentAdmin.id &&
         formData.role !== user.role
      ) {
         showToast(
            "Bạn không thể tự thay đổi vai trò của chính mình!",
            "error"
         );
         return;
      }

      const toastId = showToast("Đang lưu thay đổi...", "loading");

      try {
         setSaving(true);
         const res = await fetch(
            `http://localhost:5000/api/admin/users/${userId}`,
            {
               method: "PUT",
               credentials: "include",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                  name: formData.name,
                  username: formData.username,
                  role: formData.role,
               }),
            }
         );

         const result = await res.json();

         if (res.ok && result.success) {
            updateToast(toastId, "Cập nhật người dùng thành công!", "success");
            setTimeout(() => {
               router.push(`/admin/users/${userId}`);
            }, 1500);
         } else {
            updateToast(
               toastId,
               result.message || "Cập nhật thất bại",
               "error"
            );
         }
      } catch (err) {
         updateToast(toastId, "Lỗi kết nối server", "error");
      } finally {
         setSaving(false);
      }
   };

   // Gửi link đặt lại mật khẩu
   const handleSendPasswordReset = async () => {
      if (!user || sendingReset) return;

      const toastId = showToast("Đang gửi link đặt lại mật khẩu...", "loading");

      try {
         setSendingReset(true);
         const res = await fetch(
            `http://localhost:5000/api/admin/users/${userId}/send-reset-password`,
            {
               method: "POST",
               credentials: "include",
            }
         );

         if (res.ok) {
            updateToast(
               toastId,
               `Đã gửi link đặt lại mật khẩu đến ${user.email}`,
               "success"
            );
         } else {
            const data = await res.json();
            updateToast(toastId, data.message || "Gửi link thất bại", "error");
         }
      } catch (err) {
         updateToast(toastId, "Lỗi kết nối server", "error");
      } finally {
         setSendingReset(false);
      }
   };

   const isEditingSelf = currentAdmin && user && user._id === currentAdmin.id;

   // Loading
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

   if (!user) return null;

   return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
         <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
               <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                     Chỉnh sửa người dùng
                  </h1>
                  <p className="text-gray-600 mt-1">
                     Cập nhật thông tin tài khoản
                  </p>
               </div>
               <Link
                  href={`/admin/users/${userId}`}
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

            {/* Cảnh báo nếu đang sửa chính mình */}
            {isEditingSelf && (
               <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-lg flex items-start gap-3">
                  <svg
                     className="w-6 h-6 shrink-0"
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
                     <p className="font-semibold">
                        Bạn đang chỉnh sửa tài khoản của chính mình
                     </p>
                     <p className="text-sm mt-1">
                        Không thể thay đổi vai trò để đảm bảo an toàn hệ thống.
                     </p>
                  </div>
               </div>
            )}

            {/* Form */}
            <form
               onSubmit={handleSubmit}
               className="bg-white rounded-xl shadow-sm p-6"
            >
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên
                     </label>
                     <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                           setFormData({ ...formData, name: e.target.value })
                        }
                        disabled={saving}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên đăng nhập
                     </label>
                     <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) =>
                           setFormData({
                              ...formData,
                              username: e.target.value,
                           })
                        }
                        disabled={saving}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                     </label>
                     <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                     />
                     <p className="text-xs text-gray-500 mt-1">
                        Email chỉ người dùng tự thay đổi được
                     </p>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vai trò
                     </label>
                     <select
                        value={formData.role}
                        onChange={(e) =>
                           setFormData({
                              ...formData,
                              role: e.target.value as "user" | "admin",
                           })
                        }
                        disabled={isEditingSelf || saving}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                     >
                        <option value="user">Người dùng thường</option>
                        <option value="admin">Quản trị viên</option>
                     </select>
                     {isEditingSelf && (
                        <p className="text-xs text-amber-600 mt-1">
                           Không thể tự thay đổi vai trò
                        </p>
                     )}
                  </div>
               </div>

               {/* Gửi link đặt lại mật khẩu */}
               <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                     Đặt lại mật khẩu
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                     Gửi email cho người dùng để họ tự đặt lại mật khẩu an toàn.
                  </p>
                  <button
                     type="button"
                     onClick={handleSendPasswordReset}
                     disabled={sendingReset || saving}
                     className="flex items-center gap-3 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-70 disabled:cursor-not-allowed transition"
                  >
                     {sendingReset ? (
                        <>
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           Đang gửi...
                        </>
                     ) : (
                        <>
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
                                 d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                           </svg>
                           Gửi link đặt lại mật khẩu
                        </>
                     )}
                  </button>
               </div>

               {/* Buttons */}
               <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <Link
                     href={`/admin/users/${userId}`}
                     className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                     Hủy bỏ
                  </Link>
                  <button
                     type="submit"
                     disabled={saving}
                     className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition flex items-center gap-3 min-w-40 justify-center"
                  >
                     {saving ? (
                        <>
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           Đang lưu...
                        </>
                     ) : (
                        "Lưu thay đổi"
                     )}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}
