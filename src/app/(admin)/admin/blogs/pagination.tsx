interface PaginationProps {
   currentPage: number;
   totalPages: number;
   onPageChange: (page: number) => void;
}

export default function Pagination({
   currentPage,
   totalPages,
   onPageChange,
}: PaginationProps) {
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

         if (showEllipsisStart) {
            pages.push("...");
         }

         const start = Math.max(2, currentPage - 1);
         const end = Math.min(totalPages - 1, currentPage + 1);

         for (let i = start; i <= end; i++) {
            pages.push(i);
         }

         if (showEllipsisEnd) {
            pages.push("...");
         }

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
               {/* Previous Button */}
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

               {/* Page Numbers */}
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

               {/* Next Button */}
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
