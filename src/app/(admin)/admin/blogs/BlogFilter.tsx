import { FilterOptions } from "./types";

interface BlogFilterProps {
   filters: FilterOptions;
   onFilterChange: (filters: FilterOptions) => void;
}
export default function BlogFilter({
   filters,
   onFilterChange,
}: BlogFilterProps) {
   return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
         <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
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

            <div className="flex-1">
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

            {/* Reset Button */}
            <div className="flex items-end">
               <button
                  onClick={() =>
                     onFilterChange({
                        sortBy: "newest",
                        dateRange: "all",
                     })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
               >
                  Đặt lại
               </button>
            </div>
         </div>
      </div>
   );
}
