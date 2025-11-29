"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Mail, Loader2, Save } from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import { useToast } from "@contexts/ToastContext";
import Loading from "@components/admin/Loading";
import ErrorState from "@components/admin/ErrorState";
import apiRequest from "@lib/api";

interface UserEdit {
   _id: string;
   name: string;
   username: string;
   email: string;
   phone?: string;
   role: "user" | "admin";
   address?: {
      tinh_thanh?: string;
      quan_huyen?: string;
      phuong_xa?: string;
      dia_chi_chi_tiet?: string;
   };
}

interface ApiResponse<T> {
   success: boolean;
   data?: T;
   message?: string;
}

export default function EditUserPage() {
   const params = useParams();
   const router = useRouter();
   const userId = params.id as string;
   const { user: currentAdmin } = useAuth();
   const toast = useToast();

   const [user, setUser] = useState<UserEdit | null>(null);
   const [formData, setFormData] = useState({
      name: "",
      username: "",
      phone: "",
      role: "user" as "user" | "admin",
      address: {
         tinh_thanh: "",
         quan_huyen: "",
         phuong_xa: "",
         dia_chi_chi_tiet: "",
      },
   });
   const [loading, setLoading] = useState(true);
   const [submitting, setSubmitting] = useState(false);
   const [sendingReset, setSendingReset] = useState(false);

   // Fetch user
   useEffect(() => {
      const fetchUser = async () => {
         try {
            setLoading(true);
            const result = await apiRequest.get<ApiResponse<UserEdit>>(
               `/admin/users/${userId}`
            );

            if (result.success && result.data) {
               const u = result.data;
               setUser(u);
               setFormData({
                  name: u.name || "",
                  username: u.username || "",
                  phone: u.phone || "",
                  role: u.role || "user",
                  address: {
                     tinh_thanh: u.address?.tinh_thanh || "",
                     quan_huyen: u.address?.quan_huyen || "",
                     phuong_xa: u.address?.phuong_xa || "",
                     dia_chi_chi_tiet: u.address?.dia_chi_chi_tiet || "",
                  },
               });
            } else {
               toast.error("Không tải được thông tin người dùng");
               router.replace("/admin/users");
            }
         } catch (err: any) {
            toast.error(err.message || "Lỗi kết nối server");
            router.replace("/admin/users");
         } finally {
            setLoading(false);
         }
      };

      if (userId) fetchUser();
   }, [userId, router, toast]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;

      if (submitting) return; // Prevent double submit

      if (
         currentAdmin &&
         user._id === currentAdmin.id &&
         formData.role !== user.role
      ) {
         toast.error("Bạn không thể tự thay đổi vai trò của chính mình!");
         return;
      }

      setSubmitting(true);
      const toastId = toast.loading("Đang lưu thay đổi...");

      try {
         const result = await apiRequest.put<ApiResponse<any>>(
            `/admin/users/${userId}`,
            {
               name: formData.name,
               username: formData.username,
               phone: formData.phone,
               role: formData.role,
               address: formData.address,
            }
         );

         if (result.success) {
            toast.updateToast(
               toastId,
               "Cập nhật người dùng thành công!",
               "success"
            );
            // Không setSubmitting(false), giữ disable cho đến khi redirect
            setTimeout(() => {
               router.push(`/admin/users`);
            }, 1500);
         } else {
            toast.updateToast(
               toastId,
               result.message || "Cập nhật thất bại",
               "error"
            );
            setSubmitting(false);
         }
      } catch (err: any) {
         toast.updateToast(
            toastId,
            err.message || "Lỗi kết nối server",
            "error"
         );
         setSubmitting(false);
      }
   };

   // Gửi link đặt lại mật khẩu
   const handleSendPasswordReset = async () => {
      if (!user) return;

      if (sendingReset) return; // Prevent double submit

      setSendingReset(true);
      const toastId = toast.loading("Đang gửi link đặt lại mật khẩu...");

      try {
         await apiRequest.post(`/admin/users/${userId}/send-reset-password`);

         toast.updateToast(
            toastId,
            `Đã gửi link đặt lại mật khẩu đến ${user.email}`,
            "success"
         );
      } catch (err: any) {
         toast.updateToast(
            toastId,
            err.message || "Gửi link thất bại",
            "error"
         );
      } finally {
         setSendingReset(false);
      }
   };

   const isEditingSelf = currentAdmin && user && user._id === currentAdmin.id;

   if (loading) {
      return <Loading />;
   }

   if (!user) return <ErrorState redirect="/admin/users" />;

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
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
               >
                  <ArrowLeft className="w-5 h-5" />
                  Quay lại
               </Link>
            </div>

            {/* Cảnh báo nếu đang sửa chính mình */}
            {isEditingSelf && (
               <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 shrink-0" />
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
                        disabled={submitting}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                        disabled={submitting}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                        Số điện thoại
                     </label>
                     <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                           setFormData({ ...formData, phone: e.target.value })
                        }
                        disabled={submitting}
                        placeholder="Nhập số điện thoại"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                     />
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
                        disabled={isEditingSelf || submitting}
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

               {/* Địa chỉ */}
               <div className="pt-6 border-t border-gray-200 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                     Địa chỉ
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Tỉnh/Thành phố
                        </label>
                        <input
                           type="text"
                           value={formData.address.tinh_thanh}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 address: {
                                    ...formData.address,
                                    tinh_thanh: e.target.value,
                                 },
                              })
                           }
                           disabled={submitting}
                           placeholder="VD: Thành phố Hà Nội"
                           className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Quận/Huyện
                        </label>
                        <input
                           type="text"
                           value={formData.address.quan_huyen}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 address: {
                                    ...formData.address,
                                    quan_huyen: e.target.value,
                                 },
                              })
                           }
                           disabled={submitting}
                           placeholder="VD: Quận Ba Đình"
                           className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Phường/Xã
                        </label>
                        <input
                           type="text"
                           value={formData.address.phuong_xa}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 address: {
                                    ...formData.address,
                                    phuong_xa: e.target.value,
                                 },
                              })
                           }
                           disabled={submitting}
                           placeholder="VD: Phường Điện Biên"
                           className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Địa chỉ chi tiết
                        </label>
                        <input
                           type="text"
                           value={formData.address.dia_chi_chi_tiet}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 address: {
                                    ...formData.address,
                                    dia_chi_chi_tiet: e.target.value,
                                 },
                              })
                           }
                           disabled={submitting}
                           placeholder="VD: Số 123, Ngõ 456"
                           className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                     </div>
                  </div>
               </div>

               {/* Gửi link đặt lại mật khẩu */}
               <div className="pt-6 border-t border-gray-200 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                     Đặt lại mật khẩu
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                     Gửi email cho người dùng để họ tự đặt lại mật khẩu an toàn.
                  </p>
                  <button
                     type="button"
                     onClick={handleSendPasswordReset}
                     disabled={sendingReset || submitting}
                     className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                     {sendingReset ? (
                        <>
                           <Loader2 className="w-5 h-5 animate-spin" />
                           Đang gửi...
                        </>
                     ) : (
                        <>
                           <Mail className="w-5 h-5" />
                           Gửi link đặt lại mật khẩu
                        </>
                     )}
                  </button>
               </div>

               {/* Buttons */}
               <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
                  <Link
                     href={`/admin/users`}
                     className={`px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer ${
                        submitting ? "pointer-events-none opacity-50" : ""
                     }`}
                  >
                     Hủy bỏ
                  </Link>
                  <button
                     type="submit"
                     disabled={submitting}
                     className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 min-w-40 justify-center cursor-pointer"
                  >
                     {submitting ? (
                        <>
                           <Loader2 className="w-5 h-5 animate-spin" />
                           Đang lưu...
                        </>
                     ) : (
                        <>
                           <Save className="w-5 h-5" />
                           Lưu thay đổi
                        </>
                     )}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}
