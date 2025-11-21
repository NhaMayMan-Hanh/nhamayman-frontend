"use client";
import { ToastContainer } from "@components/admin/ui/Toast";
import { useState, useEffect } from "react";

// Types
interface User {
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

interface ApiResponse {
   success: boolean;
   data: User[];
}

interface FilterOptions {
   sortBy: "newest" | "oldest" | "name";
   dateRange: "all" | "today" | "week" | "month" | "year";
   role: "all" | "admin" | "user";
   verified: "all" | "verified" | "unverified";
}

// Utility functions
const formatDate = (dateString: string): string => {
   const date = new Date(dateString);
   return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
   });
};

const filterUsers = (
   users: User[],
   searchTerm: string,
   filters: FilterOptions
): User[] => {
   let filtered = users.filter(
      (user) =>
         user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.username.toLowerCase().includes(searchTerm.toLowerCase())
   );

   // Apply role filter
   if (filters.role !== "all") {
      filtered = filtered.filter((user) => user.role === filters.role);
   }

   // Apply verified filter
   if (filters.verified !== "all") {
      filtered = filtered.filter((user) =>
         filters.verified === "verified" ? user.isVerified : !user.isVerified
      );
   }

   // Apply date range filter
   const now = new Date();
   if (filters.dateRange !== "all") {
      filtered = filtered.filter((user) => {
         const userDate = new Date(user.createdAt);
         const diffTime = Math.abs(now.getTime() - userDate.getTime());
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

         switch (filters.dateRange) {
            case "today":
               return diffDays === 0;
            case "week":
               return diffDays <= 7;
            case "month":
               return diffDays <= 30;
            case "year":
               return diffDays <= 365;
            default:
               return true;
         }
      });
   }

   // Apply sorting
   return filtered.sort((a, b) => {
      switch (filters.sortBy) {
         case "newest":
            return (
               new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
         case "oldest":
            return (
               new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
         case "name":
            return a.name.localeCompare(b.name);
         default:
            return 0;
      }
   });
};

// Components
function UserFilter({
   filters,
   onFilterChange,
}: {
   filters: FilterOptions;
   onFilterChange: (filters: FilterOptions) => void;
}) {
   return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sắp xếp theo
               </label>
               <select
                  value={filters.sortBy}
                  onChange={(e) =>
                     onFilterChange({
                        ...filters,
                        sortBy: e.target.value as FilterOptions["sortBy"],
                     })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
               >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="name">Tên (A-Z)</option>
               </select>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khoảng thời gian
               </label>
               <select
                  value={filters.dateRange}
                  onChange={(e) =>
                     onFilterChange({
                        ...filters,
                        dateRange: e.target.value as FilterOptions["dateRange"],
                     })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
               >
                  <option value="all">Tất cả</option>
                  <option value="today">Hôm nay</option>
                  <option value="week">7 ngày qua</option>
                  <option value="month">30 ngày qua</option>
                  <option value="year">1 năm qua</option>
               </select>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vai trò
               </label>
               <select
                  value={filters.role}
                  onChange={(e) =>
                     onFilterChange({
                        ...filters,
                        role: e.target.value as FilterOptions["role"],
                     })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
               >
                  <option value="all">Tất cả</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
               </select>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái xác thực
               </label>
               <select
                  value={filters.verified}
                  onChange={(e) =>
                     onFilterChange({
                        ...filters,
                        verified: e.target.value as FilterOptions["verified"],
                     })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
               >
                  <option value="all">Tất cả</option>
                  <option value="verified">Đã xác thực</option>
                  <option value="unverified">Chưa xác thực</option>
               </select>
            </div>
         </div>

         <div className="mt-4 flex justify-end">
            <button
               onClick={() =>
                  onFilterChange({
                     sortBy: "newest",
                     dateRange: "all",
                     role: "all",
                     verified: "all",
                  })
               }
               className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
               Đặt lại bộ lọc
            </button>
         </div>
      </div>
   );
}

function Pagination({
   currentPage,
   totalPages,
   onPageChange,
}: {
   currentPage: number;
   totalPages: number;
   onPageChange: (page: number) => void;
}) {
   const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const showEllipsisStart = currentPage > 3;
      const showEllipsisEnd = currentPage < totalPages - 2;

      if (totalPages <= 7) {
         for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
         }
      } else {
         pages.push(1);
         if (showEllipsisStart) pages.push("...");
         const start = Math.max(2, currentPage - 1);
         const end = Math.min(totalPages - 1, currentPage + 1);
         for (let i = start; i <= end; i++) {
            pages.push(i);
         }
         if (showEllipsisEnd) pages.push("...");
         pages.push(totalPages);
      }
      return pages;
   };

   if (totalPages <= 1) return null;

   return (
      <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
         <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-700">
               Trang <span className="font-medium">{currentPage}</span> trong{" "}
               <span className="font-medium">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
               <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        d="M15 19l-7-7 7-7"
                     />
                  </svg>
               </button>
               <div className="flex gap-2">
                  {getPageNumbers().map((page, index) => {
                     if (page === "...") {
                        return (
                           <span
                              key={`ellipsis-${index}`}
                              className="px-3 py-2 text-gray-500"
                           >
                              ...
                           </span>
                        );
                     }
                     return (
                        <button
                           key={page}
                           onClick={() => onPageChange(page as number)}
                           className={`px-3 py-2 rounded-lg transition-colors ${
                              currentPage === page
                                 ? "bg-blue-600 text-white"
                                 : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                           }`}
                        >
                           {page}
                        </button>
                     );
                  })}
               </div>
               <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        d="M9 5l7 7-7 7"
                     />
                  </svg>
               </button>
            </div>
         </div>
      </div>
   );
}

function DeleteModal({
   user,
   onClose,
   onConfirm,
}: {
   user: User;
   onClose: () => void;
   onConfirm: () => void;
}) {
   return (
      <div
         className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
         onClick={onClose}
      >
         <div
            className="bg-white rounded-lg shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
         >
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-lg">
               <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Xác nhận xóa
               </h3>
               <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
               >
                  <svg
                     className="w-5 h-5 sm:w-6 sm:h-6"
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
            <div className="p-4 sm:p-6">
               <div className="space-y-4">
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
                        <h4 className="font-semibold text-red-900">
                           Cảnh báo!
                        </h4>
                        <p className="text-sm text-red-700 mt-1">
                           Bạn có chắc chắn muốn xóa người dùng này? Hành động
                           này không thể hoàn tác.
                        </p>
                     </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                     <p className="text-sm text-gray-900 font-medium">
                        {user.name}
                     </p>
                     <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                     <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
               </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 rounded-b-lg">
               <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
               >
                  Hủy
               </button>
               <button
                  onClick={onConfirm}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
               >
                  Xác nhận xóa
               </button>
            </div>
         </div>
      </div>
   );
}

// Main Component
export default function Users() {
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

   useEffect(() => {
      fetchUsers();
   }, []);

   const fetchUsers = async () => {
      try {
         setLoading(true);
         const response = await fetch("http://localhost:5000/api/admin/users", {
            credentials: "include",
         });
         const result: ApiResponse = await response.json();
         if (result.success) {
            setUsers(result.data);
            setError(null);
         } else {
            setError("Không thể tải dữ liệu người dùng");
         }
      } catch (err) {
         setError("Lỗi kết nối đến server: " + (err as Error).message);
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

      // @ts-ignore - đã gắn vào window
      const toastId = window.showToast("Đang xóa người dùng...", "loading");

      try {
         const res = await fetch(
            `http://localhost:5000/api/admin/users/${selectedUser._id}`,
            {
               method: "DELETE",
               credentials: "include",
            }
         );

         if (res.ok) {
            // @ts-ignore
            window.updateToast(
               toastId,
               `Đã xóa người dùng "${selectedUser.name}" thành công!`,
               "success"
            );

            // Cập nhật lại danh sách user
            fetchUsers();

            // Đóng modal và reset state
            setShowModal(false);
            setSelectedUser(null);
         } else {
            const errorData = await res.json();
            // @ts-ignore
            window.updateToast(
               toastId,
               errorData.message || "Xóa thất bại",
               "error"
            );
         }
      } catch (err) {
         // @ts-ignore
         window.updateToast(toastId, "Lỗi kết nối server", "error");
         console.error("Error deleting user:", err);
      }
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
               <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
               <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
               <div className="flex items-center gap-3 text-red-800">
                  <svg
                     className="w-6 h-6 shrink-0"
                     fill="currentColor"
                     viewBox="0 0 20 20"
                  >
                     <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                     />
                  </svg>
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
                     <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                     </svg>
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
                     onClick={() =>
                        (window.location.href = `/admin/users/create`)
                     }
                     className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
                           d="M12 4v16m8-8H4"
                        />
                     </svg>
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
                                 <svg
                                    className="w-16 h-16 mx-auto text-gray-300 mb-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                 >
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                 </svg>
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
                                             <svg
                                                className="w-3 h-3 mr-1"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                             >
                                                <path
                                                   fillRule="evenodd"
                                                   d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                   clipRule="evenodd"
                                                />
                                             </svg>
                                             Đã xác thực
                                          </>
                                       ) : (
                                          <>
                                             <svg
                                                className="w-3 h-3 mr-1"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                             >
                                                <path
                                                   fillRule="evenodd"
                                                   d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                   clipRule="evenodd"
                                                />
                                             </svg>
                                             Chưa xác thực
                                          </>
                                       )}
                                    </span>
                                 </td>
                                 <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-500">
                                       <svg
                                          className="w-4 h-4 mr-1 shrink-0"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                       >
                                          <path
                                             fillRule="evenodd"
                                             d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                             clipRule="evenodd"
                                          />
                                       </svg>
                                       {formatDate(user.createdAt)}
                                    </div>
                                 </td>
                                 <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                                       <button
                                          onClick={() =>
                                             (window.location.href = `/admin/users/${user._id}`)
                                          }
                                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg group"
                                          title="Xem chi tiết"
                                       >
                                          <svg
                                             className="w-4 h-4 sm:w-5 sm:h-5  transition-transform"
                                             fill="none"
                                             stroke="currentColor"
                                             viewBox="0 0 24 24"
                                          >
                                             <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                             />
                                             <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                             />
                                          </svg>
                                       </button>
                                       <button
                                          onClick={() =>
                                             (window.location.href = `/admin/users/edit/${user._id}`)
                                          }
                                          className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg group"
                                          title="Chỉnh sửa"
                                       >
                                          <svg
                                             className="w-4 h-4 sm:w-5 sm:h-5 transition-transform"
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
                                       </button>
                                       <button
                                          onClick={() => handleDelete(user)}
                                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                          title="Xóa"
                                       >
                                          <svg
                                             className="w-4 h-4 sm:w-5 sm:h-5"
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

            {showModal && selectedUser && (
               <DeleteModal
                  user={selectedUser}
                  onClose={() => setShowModal(false)}
                  onConfirm={confirmDelete}
               />
            )}
            <ToastContainer />
         </div>
      </div>
   );
}
