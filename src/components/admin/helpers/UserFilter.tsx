import { FilterOptions } from "app/(admin)/admin/users/types";

export function UserFilter({
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
