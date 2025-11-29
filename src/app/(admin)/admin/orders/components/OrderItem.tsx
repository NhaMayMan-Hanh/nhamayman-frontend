"use client";
import { Package, XCircle } from "lucide-react";
import { useMemo } from "react";
function OrderItem({ item }: { item: any }) {
   const pricePerUnit = useMemo(
      () =>
         item.quantity > 1
            ? (item.price / item.quantity).toLocaleString("vi-VN")
            : null,
      [item.price, item.quantity]
   );
   return (
      <div className="p-6 flex gap-4 items-center hover:bg-slate-50 transition">
         <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
            {item.productDetails?.image ? (
               <img
                  src={item.productDetails.image}
                  alt={item.productDetails.name}
                  className="w-full h-full object-cover"
               />
            ) : (
               <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300">
                  <Package className="w-8 h-8 text-gray-400" />
               </div>
            )}
         </div>
         <div className="flex-1">
            <p className="font-semibold text-slate-800">
               {item.productDetails ? (
                  item.productDetails.name
               ) : item.productId ? (
                  `Sản phẩm ID: ${item.productId}`
               ) : (
                  <span className="text-red-600 flex items-center gap-2">
                     <XCircle className="w-4 h-4" />
                     Sản phẩm đã bị xóa
                  </span>
               )}
            </p>
            {item.productDetails?.category && (
               <p className="text-xs text-slate-500 mt-1">
                  Danh mục: {item.productDetails.category}
               </p>
            )}
            <p className="text-sm text-slate-500 mt-1">
               Số lượng:{" "}
               <span className="font-medium text-slate-700">
                  {item.quantity}
               </span>
            </p>
            {item.productDetails?.stock !== undefined && (
               <p className="text-xs text-slate-500 mt-1">
                  Tồn kho: {item.productDetails.stock}
               </p>
            )}
         </div>
         <div className="text-right">
            <p className="font-semibold text-lg text-slate-800">
               {item.price.toLocaleString("vi-VN")}₫
            </p>
            {pricePerUnit && (
               <p className="text-xs text-slate-500 mt-1">
                  {pricePerUnit}₫ / sp
               </p>
            )}
         </div>
      </div>
   );
}

export default OrderItem;
