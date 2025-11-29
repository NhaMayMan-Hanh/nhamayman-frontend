"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
   Search,
   Plus,
   Users,
   Eye,
   Edit,
   Trash2,
   Calendar,
   CheckCircle,
   XCircle,
   AlertCircle,
} from "lucide-react";
import { formatDate } from "./helpers";
import { ApiResponse, FilterOptions, User } from "./types";
import { filterUsers } from "./userFilter";
import { UserFilter } from "@components/admin/helpers/UserFilter";
import { Pagination } from "@components/admin/helpers/Pagination";
import DeleteConfirmModal from "@components/admin/DeleteModal";
import { useToast } from "@contexts/ToastContext";
import Loading from "@components/admin/Loading";
import apiRequest from "@lib/api";

export default function UsersComponent() {
   const router = useRouter();
   const [users, setUsers] = useState<User[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedUser, setSelectedUser] = useState<User | null>(null);
   const [showModal, setShowModal] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);
   const [filters, setFilters] = useState<FilterOptions>({
      sortBy: "newest",
      dateRange: "all",
      role: "all",
      verified: "all",
   });
   const itemsPerPage = 10;
   const toast = useToast();

   useEffect(() => {
      fetchUsers();
   }, []);

   const fetchUsers = async () => {
      try {
         setLoading(true);
         const result = await apiRequest.get<ApiResponse>("/admin/users");
         if (result.success) {
            setUsers(result.data);
            setError(null);
         } else {
            setError("Không thể tải dữ liệu người dùng");
         }
      } catch (err: any) {
         setError(err.message || "Lỗi kết nối đến server");
      } finally {
         setLoading(false);
      }
   };

   const filteredUsers = filterUsers(users, searchTerm, filters);
   const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
   const paginatedUsers = filteredUsers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
   );

   const handleDelete = (user: User) => {
      setSelectedUser(user);
      setShowModal(true);
   };

   const confirmDelete = async () => {
      if (!selectedUser) return;
      const toastId = toast.loading(
         `Đang xóa người dùng "${selectedUser.name}"...`
      );
      try {
         await apiRequest.delete(`/admin/users/${selectedUser._id}`);

         toast.updateToast(
            toastId,
            `Đã xóa người dùng "${selectedUser.name}" thành công!`,
            "success"
         );
         setShowModal(false);
         setSelectedUser(null);
         setTimeout(() => fetchUsers(), 500);
      } catch (err: any) {
         toast.updateToast(
            toastId,
            err.message || "Xóa người dùng thất bại",
            "error"
         );
         console.error("Error deleting user:", err);
      }
   };

   if (loading) {
      return <Loading />;
   }

   if (error) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
               <div className="flex items-center gap-3 text-red-800">
                  <XCircle className="w-6 h-6 shrink-0" />
                  <div>
                     <h3 className="font-semibold">Lỗi tải dữ liệu</h3>
                     <p className="text-sm mt-1">{error}</p>
                  </div>
               </div>
               <button
                  onClick={fetchUsers}
                  className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
               >
                  Thử lại
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
         <div>
            <div className="mb-6 sm:mb-8">
               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Quản lý Người dùng
               </h1>
               <p className="text-gray-600 mt-2">
                  Quản lý tất cả người dùng trong hệ thống
               </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
               <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="relative w-full md:w-96">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                     <input
                        type="text"
                        placeholder="Tìm kiếm người dùng..."
                        value={searchTerm}
                        onChange={(e) => {
                           setSearchTerm(e.target.value);
                           setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                     />
                  </div>
                  <button
                     onClick={() => router.push("/admin/users/create")}
                     className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                     <Plus className="w-5 h-5" />
                     Thêm Người dùng
                  </button>
               </div>
            </div>

            <UserFilter
               filters={filters}
               onFilterChange={(f) => {
                  setFilters(f);
                  setCurrentPage(1);
               }}
            />

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                           <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Avatar
                           </th>
                           <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Thông tin
                           </th>
                           <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                           </th>
                           <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Vai trò
                           </th>
                           <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Trạng thái
                           </th>
                           <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ngày tạo
                           </th>
                           <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Thao tác
                           </th>
                        </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedUsers.length === 0 ? (
                           <tr>
                              <td
                                 colSpan={7}
                                 className="px-6 py-12 text-center text-gray-500"
                              >
                                 <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                 <p className="text-lg font-medium">
                                    Không tìm thấy người dùng nào
                                 </p>
                                 <p className="text-sm mt-1">
                                    Thử tìm kiếm với từ khóa khác
                                 </p>
                              </td>
                           </tr>
                        ) : (
                           paginatedUsers.map((user) => (
                              <tr
                                 key={user._id}
                                 className="hover:bg-gray-50 transition-colors"
                              >
                                 <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 rounded-full overflow-hidden shrink-0">
                                       {user.avatar ? (
                                          <img
                                             src={user.avatar}
                                             alt={user.name}
                                             className="w-full h-full object-cover"
                                          />
                                       ) : (
                                          <div className="w-full h-full flex items-center justify-center bg-blue-100">
                                             <span className="text-blue-600 text-lg font-semibold">
                                                {user.name
                                                   .charAt(0)
                                                   .toUpperCase()}
                                             </span>
                                          </div>
                                       )}
                                    </div>
                                 </td>
                                 <td className="px-4 sm:px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">
                                       {user.name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                       @{user.username}
                                    </div>
                                    <div className="md:hidden text-xs text-gray-600 mt-1">
                                       {user.email}
                                    </div>
                                    <div className="lg:hidden mt-2 flex flex-wrap gap-2">
                                       <span
                                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                             user.role === "admin"
                                                ? "bg-purple-100 text-purple-800"
                                                : "bg-gray-100 text-gray-800"
                                          }`}
                                       >
                                          {user.role === "admin"
                                             ? "Admin"
                                             : "User"}
                                       </span>
                                       <span
                                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                             user.isVerified
                                                ? "bg-green-100 text-green-800"
                                                : "bg-yellow-100 text-yellow-800"
                                          }`}
                                       >
                                          {user.isVerified
                                             ? "Đã xác thực"
                                             : "Chưa xác thực"}
                                       </span>
                                    </div>
                                 </td>
                                 <td className="hidden md:table-cell px-6 py-4">
                                    <div className="text-sm text-gray-600">
                                       {user.email}
                                    </div>
                                 </td>
                                 <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                                    <span
                                       className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                          user.role === "admin"
                                             ? "bg-purple-100 text-purple-800"
                                             : "bg-gray-100 text-gray-800"
                                       }`}
                                    >
                                       {user.role === "admin"
                                          ? "Admin"
                                          : "User"}
                                    </span>
                                 </td>
                                 <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                                    <span
                                       className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                          user.isVerified
                                             ? "bg-green-100 text-green-800"
                                             : "bg-yellow-100 text-yellow-800"
                                       }`}
                                    >
                                       {user.isVerified ? (
                                          <>
                                             <CheckCircle className="w-3 h-3 mr-1" />
                                             Đã xác thực
                                          </>
                                       ) : (
                                          <>
                                             <AlertCircle className="w-3 h-3 mr-1" />
                                             Chưa xác thực
                                          </>
                                       )}
                                    </span>
                                 </td>
                                 <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-500">
                                       <Calendar className="w-4 h-4 mr-1 shrink-0" />
                                       {formatDate(user.createdAt)}
                                    </div>
                                 </td>
                                 <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                                       <button
                                          onClick={() =>
                                             router.push(
                                                `/admin/users/${user._id}`
                                             )
                                          }
                                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg group cursor-pointer"
                                          title="Xem chi tiết"
                                       >
                                          <Eye className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" />
                                       </button>
                                       <button
                                          onClick={() =>
                                             router.push(
                                                `/admin/users/edit/${user._id}`
                                             )
                                          }
                                          className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg group cursor-pointer"
                                          title="Chỉnh sửa"
                                       >
                                          <Edit className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" />
                                       </button>
                                       <button
                                          onClick={() => handleDelete(user)}
                                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                          title="Xóa"
                                       >
                                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

            <Pagination
               currentPage={currentPage}
               totalPages={totalPages}
               onPageChange={setCurrentPage}
            />

            <DeleteConfirmModal
               open={showModal}
               onClose={() => {
                  setShowModal(false);
                  setSelectedUser(null);
               }}
               onConfirm={confirmDelete}
               title="Xóa người dùng"
               message="Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."
               entityName={selectedUser?.name || ""}
               details={
                  selectedUser && (
                     <>
                        <p className="mt-1">{selectedUser.email}</p>
                        <p>@{selectedUser.username}</p>
                     </>
                  )
               }
               confirmText="Xác nhận xóa"
               cancelText="Hủy"
            />
         </div>
      </div>
   );
}
