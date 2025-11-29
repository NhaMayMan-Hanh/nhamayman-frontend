import React from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
   open: boolean;
   onClose: () => void;
   onConfirm: () => void;
   title?: string;
   message?: string;
   entityName: string;
   confirmText?: string;
   cancelText?: string;
   details?: React.ReactNode;
}

export default function DeleteConfirmModal({
   open,
   onClose,
   onConfirm,
   title = "Xác nhận xóa",
   message = "Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.",
   entityName,
   confirmText = "Xác nhận xóa",
   cancelText = "Hủy",
   details,
}: DeleteConfirmModalProps) {
   React.useEffect(() => {
      if (open) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "unset";
      }

      // Cleanup khi component unmount
      return () => {
         document.body.style.overflow = "unset";
      };
   }, [open]);

   if (!open) return null;

   return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
         <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
         >
            <div className="relative bg-linear-to-br from-red-50 to-orange-50 px-6 py-5 flex items-center justify-between rounded-t-2xl border-b border-red-100">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                     <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{title}</h3>
               </div>
               <button
                  onClick={onClose}
                  className="p-2 hover:bg-red-100 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer group"
               >
                  <X className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
               </button>
            </div>

            {/* Body */}
            <div className="p-6">
               <div className="space-y-5">
                  {/* Warning Box với animation */}
                  <div className="relative bg-linear-to-br from-yellow-50 to-red-100 border-2 border-red-200 rounded-xl p-5 flex items-start gap-4 shadow-sm overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                     <div className="relative z-10">
                        <AlertTriangle className="w-7 h-7 text-red-600 animate-pulse" />
                     </div>
                     <div className="relative z-10 flex-1">
                        <h4 className="font-bold text-red-900 text-base mb-1.5">
                           Cảnh báo quan trọng!
                        </h4>
                        <p className="text-sm text-red-800 leading-relaxed">
                           {message}
                        </p>
                     </div>
                  </div>

                  {/* Entity Info với modern design */}
                  <div className="bg-linear-to-br from-gray-50 to-gray-100 border-2 border-gray-200 p-5 rounded-xl shadow-sm">
                     <div className="flex items-center gap-2 mb-3">
                        <div className="h-1 w-1 rounded-full bg-gray-400"></div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">
                           Mục sẽ bị xóa vĩnh viễn
                        </p>
                     </div>
                     <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-base font-bold text-gray-900 wrap-break-word">
                           {entityName}
                        </p>
                        {details && (
                           <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                              {details}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {/* Footer với buttons hiện đại */}
            <div className="bg-gray-50 px-6 py-5 flex flex-col-reverse sm:flex-row justify-end gap-3 rounded-b-2xl border-t border-gray-200">
               <button
                  onClick={onClose}
                  className="group relative w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-white hover:border-gray-400 hover:shadow-md transition-all duration-200 cursor-pointer"
               >
                  <span className="relative z-10">{cancelText}</span>
               </button>
               <button
                  onClick={onConfirm}
                  className="group relative w-full sm:w-auto px-6 py-3 bg-linear-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden"
               >
                  <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                     <Trash2 className="w-4 h-4" />
                     {confirmText}
                  </span>
               </button>
            </div>
         </div>
      </div>
   );
}
