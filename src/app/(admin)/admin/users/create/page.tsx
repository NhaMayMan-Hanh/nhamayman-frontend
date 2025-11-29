"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@contexts/ToastContext";
import apiRequest from "@lib/api";

interface ApiResponse<T> {
   success: boolean;
   data?: T;
   message?: string;
}

export default function CreateUserPage() {
   const router = useRouter();
   const toast = useToast();

   const [formData, setFormData] = useState({
      name: "",
      username: "",
      email: "",
      password: "",
      role: "user" as "user" | "admin",
   });

   const [submitting, setSubmitting] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (submitting) return; // Prevent double submit

      setSubmitting(true);
      const toastId = toast.loading("Đang tạo người dùng mới...");

      try {
         const result = await apiRequest.post<ApiResponse<any>>(
            "/admin/users",
            formData
         );
         if (result.success) {
            toast.updateToast(
               toastId,
               `Tạo người dùng "${formData.name}" thành công!`,
               "success"
            );
            setTimeout(() => {
               router.push("/admin/users");
            }, 1500);
         } else {
            toast.updateToast(
               toastId,
               result.message || "Tạo người dùng thất bại",
               "error"
            );
            setSubmitting(false);
         }
      } catch (err: any) {
         toast.updateToast(
            toastId,
            err.message || "Lỗi kết nối đến server",
            "error"
         );
         console.error("Create user error:", err);
         setSubmitting(false);
      }
   };

   return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
         <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
               <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                     Tạo người dùng mới
                  </h1>
                  <p className="text-gray-600 mt-1">
                     Thêm tài khoản mới vào hệ thống
                  </p>
               </div>
               <Link
                  href="/admin/users"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
               >
                  <ArrowLeft className="w-5 h-5" />
                  Quay lại danh sách
               </Link>
            </div>

            {/* Form */}
            <form
               onSubmit={handleSubmit}
               className="bg-white rounded-xl shadow-sm p-6"
            >
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                           setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="Nguyễn Văn A"
                        disabled={submitting}
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên đăng nhập <span className="text-red-500">*</span>
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="nguyenvana"
                        disabled={submitting}
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                           setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="user@example.com"
                        disabled={submitting}
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="password"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={(e) =>
                           setFormData({
                              ...formData,
                              password: e.target.value,
                           })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="••••••••"
                        disabled={submitting}
                     />
                     <p className="text-xs text-gray-500 mt-1">
                        Tối thiểu 6 ký tự
                     </p>
                  </div>

                  <div className="md:col-span-2">
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
                        disabled={submitting}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                     >
                        <option value="user">Người dùng thường</option>
                        <option value="admin">Quản trị viên</option>
                     </select>
                  </div>
               </div>

               {/* Buttons */}
               <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                  <Link
                     href="/admin/users"
                     className={`px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer ${
                        submitting ? "pointer-events-none opacity-50" : ""
                     }`}
                  >
                     Hủy bỏ
                  </Link>
                  <button
                     type="submit"
                     disabled={submitting}
                     className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 min-w-[180px] justify-center cursor-pointer"
                  >
                     {submitting ? (
                        <>
                           <Loader2 className="w-5 h-5 animate-spin" />
                           <span>Đang tạo...</span>
                        </>
                     ) : (
                        <>
                           <UserPlus className="w-5 h-5" />
                           <span>Tạo người dùng</span>
                        </>
                     )}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}
