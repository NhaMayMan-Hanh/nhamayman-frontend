"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
   MapPin,
   Phone,
   Loader2,
   XCircle,
   Edit,
   Trash2,
   ArrowLeft,
   CheckCircle,
   AlertCircle,
} from "lucide-react";
import { useToast } from "@contexts/ToastContext";
import apiRequest from "@lib/api";
import DeleteConfirmModal from "@components/admin/DeleteModal";
import Loading from "@components/admin/Loading";

interface UserDetail {
   _id: string;
   name: string;
   username: string;
   email: string;
   avatar?: string;
   role: string;
   phone?: string;
   isVerified: boolean;
   address?: {
      tinh_thanh?: string;
      quan_huyen?: string;
      phuong_xa?: string;
      dia_chi_chi_tiet?: string;
   };
   createdAt: string;
   updatedAt: string;
}

interface ApiResponse<T> {
   success: boolean;
   data: T;
   message?: string;
}

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

export default function UserDetailPage() {
   const params = useParams();
   const router = useRouter();
   const userId = params.id as string;
   const toast = useToast();

   const [user, setUser] = useState<UserDetail | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [showDeleteModal, setShowDeleteModal] = useState(false);

   useEffect(() => {
      const fetchUser = async () => {
         try {
            setLoading(true);
            const result = await apiRequest.get<ApiResponse<UserDetail>>(
               `/admin/users/${userId}`
            );

            if (result.success) {
               setUser(result.data);
               setError(null);
            } else {
               setError(result.message || "Không thể tải thông tin người dùng");
            }
         } catch (err: any) {
            setError(err.message || "Lỗi kết nối đến server");
            console.error(err);
         } finally {
            setLoading(false);
         }
      };

      if (userId) fetchUser();
   }, [userId]);

   const handleDelete = async () => {
      if (!user) return;

      const toastId = toast.loading("Đang xóa người dùng...");

      try {
         await apiRequest.delete(`/admin/users/${user._id}`);

         toast.updateToast(
            toastId,
            `Đã xóa người dùng "${user.name}" thành công!`,
            "success"
         );
         setTimeout(() => {
            router.push("/admin/users");
         }, 1500);
      } catch (err: any) {
         toast.updateToast(
            toastId,
            err.message || "Xóa người dùng thất bại",
            "error"
         );
         console.error("Delete error:", err);
      } finally {
         setShowDeleteModal(false);
      }
   };

   // Loading state
   if (loading) {
      return <Loading />;
   }

   // Error state
   if (error || !user) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
               <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
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
               <div className="flex gap-2">
                  <div className="flex flex-wrap gap-3">
                     <Link
                        href={`/admin/users/edit/${user._id}`}
                        className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                     >
                        <Edit className="w-5 h-5" />
                        Chỉnh sửa người dùng
                     </Link>
                     <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 px-5 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                     >
                        <Trash2 className="w-5 h-5" />
                        Xóa người dùng
                     </button>
                  </div>
                  <Link
                     href="/admin/users"
                     className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                     <ArrowLeft className="w-5 h-5" />
                     Quay lại
                  </Link>
               </div>
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
                              <CheckCircle className="w-6 h-6" />
                           </div>
                        ) : (
                           <div className="absolute bottom-0 right-2 bg-yellow-500 text-white rounded-full p-2 shadow-lg">
                              <AlertCircle className="w-6 h-6" />
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
                        {user.phone && (
                           <div className="flex items-center justify-between py-3 border-b border-gray-100">
                              <span className="text-gray-600 flex items-center gap-2">
                                 <Phone className="w-4 h-4" />
                                 Số điện thoại
                              </span>
                              <span className="font-medium text-gray-900">
                                 {user.phone}
                              </span>
                           </div>
                        )}
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

                  {/* Địa chỉ */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Địa chỉ
                     </h3>
                     {user.address &&
                     (user.address.tinh_thanh ||
                        user.address.quan_huyen ||
                        user.address.phuong_xa ||
                        user.address.dia_chi_chi_tiet) ? (
                        <div className="space-y-3">
                           {user.address.dia_chi_chi_tiet && (
                              <div className="flex items-start gap-3">
                                 <span className="text-gray-600 min-w-[140px]">
                                    Địa chỉ chi tiết:
                                 </span>
                                 <span className="font-medium text-gray-900">
                                    {user.address.dia_chi_chi_tiet}
                                 </span>
                              </div>
                           )}
                           {user.address.phuong_xa && (
                              <div className="flex items-start gap-3">
                                 <span className="text-gray-600 min-w-[140px]">
                                    Phường/Xã:
                                 </span>
                                 <span className="font-medium text-gray-900">
                                    {user.address.phuong_xa}
                                 </span>
                              </div>
                           )}
                           {user.address.quan_huyen && (
                              <div className="flex items-start gap-3">
                                 <span className="text-gray-600 min-w-[140px]">
                                    Quận/Huyện:
                                 </span>
                                 <span className="font-medium text-gray-900">
                                    {user.address.quan_huyen}
                                 </span>
                              </div>
                           )}
                           {user.address.tinh_thanh && (
                              <div className="flex items-start gap-3">
                                 <span className="text-gray-600 min-w-[140px]">
                                    Tỉnh/Thành phố:
                                 </span>
                                 <span className="font-medium text-gray-900">
                                    {user.address.tinh_thanh}
                                 </span>
                              </div>
                           )}
                           <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-sm text-gray-600">
                                 <span className="font-semibold">
                                    Địa chỉ đầy đủ:
                                 </span>
                              </p>
                              <p className="text-gray-900 mt-1">
                                 {[
                                    user.address.dia_chi_chi_tiet,
                                    user.address.phuong_xa,
                                    user.address.quan_huyen,
                                    user.address.tinh_thanh,
                                 ]
                                    .filter(Boolean)
                                    .join(", ")}
                              </p>
                           </div>
                        </div>
                     ) : (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                           <MapPin className="w-10 h-10 text-gray-400" />
                           <div>
                              <p className="font-medium text-gray-900">
                                 Chưa cập nhật địa chỉ
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                 Người dùng chưa cung cấp thông tin địa chỉ
                              </p>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

         <DeleteConfirmModal
            open={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            title="Xác nhận xóa người dùng"
            message="Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."
            entityName={user.name}
            confirmText="Xóa người dùng"
            cancelText="Hủy bỏ"
            details={
               <div className="space-y-1">
                  <p className="text-gray-600">@{user.username}</p>
                  <p className="text-gray-600">{user.email}</p>
               </div>
            }
         />
      </div>
   );
}
