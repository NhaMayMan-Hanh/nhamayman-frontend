// components/admin/ConfirmModal.tsx
import { X, CheckCircle, Truck, XCircle, Trash2 } from "lucide-react";
interface ConfirmModalProps {
   isOpen: boolean;
   action: "cancel" | "confirm" | "ship" | "deliver" | "delete";
   isLoading: boolean;
   onConfirm: () => void;
   onCancel: () => void;
}
const ACTION_CONFIG = {
   cancel: {
      title: "Hủy đơn hàng",
      description:
         "Đơn hàng sẽ bị hủy và không thể khôi phục. Bạn có chắc chắn muốn tiếp tục?",
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      buttonClass:
         "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-500/30",
   },
   confirm: {
      title: "Xác nhận đơn hàng",
      description: "Bạn có chắc chắn muốn xác nhận đơn hàng này không?",
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      buttonClass:
         "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-green-500/30",
   },
   ship: {
      title: "Chuyển sang đang giao",
      description:
         "Bạn có chắc chắn muốn chuyển đơn hàng sang trạng thái đang giao không?",
      icon: Truck,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      buttonClass:
         "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-purple-500/30",
   },
   deliver: {
      title: "Đánh dấu đã giao",
      description: "Bạn có chắc chắn đơn hàng đã được giao thành công không?",
      icon: CheckCircle,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      buttonClass:
         "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/30",
   },
   delete: {
      title: "Xóa đơn hàng",
      description:
         "Đơn hàng sẽ bị xóa vĩnh viễn và không thể khôi phục. Bạn có chắc chắn?",
      icon: Trash2,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      buttonClass:
         "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-500/30",
   },
};
export default function ConfirmModal({
   isOpen,
   action,
   isLoading,
   onConfirm,
   onCancel,
}: ConfirmModalProps) {
   if (!isOpen) return null;

   const config = ACTION_CONFIG[action];
   const Icon = config.icon;

   return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
         <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
         >
            {/* Header with Icon */}
            <div className="relative pt-8 pb-6 px-6">
               <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
                  aria-label="Đóng"
               >
                  <X className="w-5 h-5 text-gray-400" />
               </button>

               <div className="flex flex-col items-center text-center">
                  {/* Dynamic Icon */}
                  <div
                     className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${config.iconBg}`}
                  >
                     <Icon className={`w-8 h-8 ${config.iconColor}`} />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                     {config.title}
                  </h3>

                  <p className="text-gray-600 text-sm">{config.description}</p>
               </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-linear-to-r from-transparent via-gray-200 to-transparent" />

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
               <div className="flex gap-3">
                  <button
                     onClick={onCancel}
                     disabled={isLoading}
                     className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                     Hủy bỏ
                  </button>

                  <button
                     onClick={onConfirm}
                     disabled={isLoading}
                     className={`flex-1 px-4 py-2.5 font-medium rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${config.buttonClass} cursor-pointer`}
                  >
                     {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                           <svg
                              className="animate-spin h-5 w-5"
                              viewBox="0 0 24 24"
                           >
                              <circle
                                 className="opacity-25"
                                 cx="12"
                                 cy="12"
                                 r="10"
                                 stroke="currentColor"
                                 strokeWidth="4"
                                 fill="none"
                              />
                              <path
                                 className="opacity-75"
                                 fill="currentColor"
                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                           </svg>
                           Đang xử lý...
                        </span>
                     ) : (
                        "Xác nhận"
                     )}
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}
