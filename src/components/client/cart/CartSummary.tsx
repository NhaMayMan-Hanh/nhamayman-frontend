// src/components/client/cart/CartSummary.tsx
import Link from "next/link";

interface CartSummaryProps {
   selectedCount: number;
   total: number;
   disabled: boolean;
   onCheckout: () => void;
}

export default function CartSummary({
   selectedCount,
   total,
   disabled,
   onCheckout,
}: CartSummaryProps) {
   return (
      <div className="bg-white rounded-xl shadow-xl p-6 sticky top-6">
         <h2 className="text-xl font-bold mb-5 text-gray-800">
            Tóm tắt đơn hàng
         </h2>

         <div className="space-y-4 mb-6 pb-6 border-b">
            <div className="flex justify-between text-gray-600">
               <span>Sản phẩm đã chọn:</span>
               <span className="font-semibold">{selectedCount}</span>
            </div>
            <div className="flex justify-between text-gray-700">
               <span>Tạm tính:</span>
               <span className="font-semibold">{total.toLocaleString()}₫</span>
            </div>
         </div>

         <div className="mb-6">
            <div className="flex justify-between items-center">
               <span className="text-lg font-bold">Tổng cộng:</span>
               <span className="text-2xl font-bold text-orange-600">
                  {total.toLocaleString()}₫
               </span>
            </div>
         </div>

         <button
            onClick={onCheckout}
            disabled={disabled}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md cursor-pointer ${
               disabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:shadow-xl"
            }`}
         >
            Tiến hành thanh toán
         </button>

         <Link
            href="/"
            className="block text-center mt-4 text-orange-600 hover:text-orange-700 font-medium hover:underline"
         >
            ← Tiếp tục mua sắm
         </Link>
      </div>
   );
}
