"use client";

import { useEffect, useRef } from "react";

interface CartHeaderProps {
   selectedCount: number;
   totalCount: number;
   isAllSelected: boolean;
   hasSelected: boolean;
   onSelectAll: () => void;
   onDeleteSelected: () => void;
}

export default function CartHeader({
   selectedCount,
   totalCount,
   isAllSelected,
   hasSelected,
   onSelectAll,
   onDeleteSelected,
}: CartHeaderProps) {
   const checkboxRef = useRef<HTMLInputElement>(null);

   // Tính trạng thái gạch ngang
   const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

   // Cập nhật indeterminate cho checkbox gốc
   useEffect(() => {
      if (checkboxRef.current) {
         checkboxRef.current.indeterminate = isIndeterminate;
      }
   }, [isIndeterminate]);

   return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-lg shadow">
         <div className="flex items-center gap-3">
            <input
               type="checkbox"
               ref={checkboxRef}
               checked={isAllSelected}
               onChange={onSelectAll}
               className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
            />
            <span className="font-medium text-gray-700">
               Chọn tất cả (
               <span className="text-orange-600">{selectedCount}</span>/
               {totalCount})
            </span>
         </div>

         {hasSelected && (
            <button
               onClick={onDeleteSelected}
               className="px-5 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition cursor-pointer"
            >
               Xóa đã chọn ({selectedCount})
            </button>
         )}
      </div>
   );
}
