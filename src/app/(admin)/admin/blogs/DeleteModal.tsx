import { Blog } from "./types";

interface DeleteModalProps {
   blog: Blog;
   onClose: () => void;
   onConfirm: () => void;
}

export default function DeleteModal({
   blog,
   onClose,
   onConfirm,
}: DeleteModalProps) {
   return (
      <div
         className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
         onClick={onClose}
      >
         <div
            className="bg-white rounded-lg shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
         >
            {/* Modal Header */}
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

            {/* Modal Body */}
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
                           Bạn có chắc chắn muốn xóa blog này? Hành động này
                           không thể hoàn tác.
                        </p>
                     </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                     <p className="text-sm text-gray-900 font-medium">
                        {blog.name}
                     </p>
                     <p className="text-xs text-gray-500 mt-1">
                        {blog.description}
                     </p>
                  </div>
               </div>
            </div>

            {/* Modal Footer */}
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
