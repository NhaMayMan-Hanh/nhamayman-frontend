// app/admin/orders/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

// Format ngày giờ tiếng Việt (không dùng date-fns)
const formatDateVN = (dateString: string): string => {
   const date = new Date(dateString);
   const hours = date.getHours().toString().padStart(2, "0");
   const minutes = date.getMinutes().toString().padStart(2, "0");
   const day = date.getDate().toString().padStart(2, "0");
   const month = (date.getMonth() + 1).toString().padStart(2, "0");
   const year = date.getFullYear();
   return `${hours}:${minutes} - ${day}/${month}/${year}`;
};

// Toast helper
const showToast = (
   message: string,
   type: "success" | "error" | "loading" = "success"
): string | null => {
   if (
      typeof window !== "undefined" &&
      typeof window.showToast === "function"
   ) {
      return window.showToast(message, type);
   }
   console.log("[Toast]", type, message);
   return null;
};

const updateToast = (
   id: string | null,
   message: string,
   type: "success" | "error"
) => {
   if (
      id &&
      typeof window !== "undefined" &&
      typeof window.updateToast === "function"
   ) {
      window.updateToast(id, message, type);
   }
};

interface OrderItem {
   productId: string | null;
   quantity: number;
   price: number;
   _id: string;
}

interface ShippingAddress {
   fullName: string;
   phone: string;
   address: string;
   city: string;
   country: string;
}

interface Order {
   _id: string;
   userId: string;
   items: OrderItem[];
   total: number;
   status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
   paymentMethod: "cash" | "banking" | "momo" | "zalopay";
   shippingAddress: ShippingAddress;
   createdAt: string;
   updatedAt: string;
}

// Cấu hình trạng thái
const statusConfig: Record<
   Order["status"],
   { label: string; color: string; bg: string }
> = {
   pending: {
      label: "Chờ xác nhận",
      color: "text-amber-700",
      bg: "bg-amber-100",
   },
   confirmed: {
      label: "Đã xác nhận",
      color: "text-blue-700",
      bg: "bg-blue-100",
   },
   shipping: {
      label: "Đang giao",
      color: "text-purple-700",
      bg: "bg-purple-100",
   },
   delivered: { label: "Đã giao", color: "text-green-700", bg: "bg-green-100" },
   cancelled: { label: "Đã hủy", color: "text-red-700", bg: "bg-red-100" },
};

const paymentMethodLabel: Record<Order["paymentMethod"], string> = {
   cash: "Thanh toán khi nhận hàng (COD)",
   banking: "Chuyển khoản ngân hàng",
   momo: "Ví MoMo",
   zalopay: "Ví ZaloPay",
};

// Thứ tự trạng thái hợp lệ (chỉ cho phép chuyển theo luồng)
const statusFlow: Order["status"][] = [
   "pending",
   "confirmed",
   "shipping",
   "delivered",
   "cancelled",
];

export default function OrderDetailPage() {
   const { id } = useParams() as { id: string };
   const [order, setOrder] = useState<Order | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [updatingStatus, setUpdatingStatus] = useState(false);
   const [selectedStatus, setSelectedStatus] =
      useState<Order["status"]>("pending");

   useEffect(() => {
      if (id) fetchOrder();
   }, [id]);

   useEffect(() => {
      if (order) setSelectedStatus(order.status);
   }, [order]);

   const fetchOrder = async () => {
      try {
         setLoading(true);
         const res = await fetch(
            `http://localhost:5000/api/admin/orders/${id}`,
            {
               credentials: "include",
            }
         );

         if (!res.ok) throw new Error("Không thể tải đơn hàng");
         const result = await res.json();

         if (result.success && result.data) {
            setOrder(result.data);
         } else {
            throw new Error(result.message || "Không tìm thấy đơn hàng");
         }
      } catch (err) {
         const msg = err instanceof Error ? err.message : "Lỗi kết nối";
         setError(msg);
         showToast(msg, "error");
      } finally {
         setLoading(false);
      }
   };
   const handleStatusChange = async () => {
      if (!order || selectedStatus === order.status) return;

      const toastId = showToast("Đang cập nhật trạng thái...", "loading");
      setUpdatingStatus(true);

      try {
         const res = await fetch(
            `http://localhost:5000/api/admin/orders/${id}`,
            {
               method: "PUT", // hoặc "PUT" nếu backend dùng PUT
               credentials: "include",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify({ status: selectedStatus }),
            }
         );

         const result = await res.json();

         if (res.ok && result.success) {
            setOrder({ ...order, status: selectedStatus });
            updateToast(toastId, "Cập nhật trạng thái thành công!", "success");
         } else {
            updateToast(
               toastId,
               result.message || "Cập nhật thất bại",
               "error"
            );
            setSelectedStatus(order.status); // rollback
         }
      } catch (err) {
         updateToast(toastId, "Lỗi kết nối server", "error");
         setSelectedStatus(order.status);
      } finally {
         setUpdatingStatus(false);
      }
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="text-center">
               <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
               <p className="text-slate-600">Đang tải chi tiết đơn hàng...</p>
            </div>
         </div>
      );
   }

   if (error || !order) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
               <svg
                  className="w-16 h-16 text-red-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
               </svg>
               <p className="text-red-600 font-medium mb-4">
                  {error || "Không tìm thấy đơn hàng"}
               </p>
               <Link
                  href="/admin/orders"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
               >
                  Quay lại danh sách
               </Link>
            </div>
         </div>
      );
   }

   const currentStatus = statusConfig[order.status];
   const nextStatuses = statusFlow.slice(statusFlow.indexOf(order.status));

   return (
      <div className="min-h-screen bg-slate-50 p-6">
         <div>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
               <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                     <h1 className="text-2xl font-bold text-slate-800">
                        Chi tiết đơn hàng
                     </h1>
                     <p className="text-slate-600 mt-1">
                        Mã đơn:{" "}
                        <span className="font-mono font-semibold text-blue-600">
                           {order._id}
                        </span>
                     </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                     <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">
                           Trạng thái:
                        </span>
                        <span
                           className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${currentStatus.bg} ${currentStatus.color}`}
                        >
                           {currentStatus.label}
                        </span>
                     </div>

                     {order.status !== "delivered" &&
                        order.status !== "cancelled" && (
                           <div className="flex items-center gap-3">
                              <select
                                 value={selectedStatus}
                                 onChange={(e) =>
                                    setSelectedStatus(
                                       e.target.value as Order["status"]
                                    )
                                 }
                                 disabled={updatingStatus}
                                 className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                              >
                                 {nextStatuses.map((status) => (
                                    <option key={status} value={status}>
                                       {statusConfig[status].label}
                                    </option>
                                 ))}
                              </select>

                              <button
                                 onClick={handleStatusChange}
                                 disabled={
                                    updatingStatus ||
                                    selectedStatus === order.status
                                 }
                                 className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                              >
                                 {updatingStatus && (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                 )}
                                 {updatingStatus
                                    ? "Đang cập nhật..."
                                    : "Cập nhật"}
                              </button>
                           </div>
                        )}
                  </div>

                  <Link
                     href="/admin/orders"
                     className="px-5 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium text-slate-700"
                  >
                     Quay lại
                  </Link>
               </div>
            </div>

            {/* Phần còn lại giữ nguyên đẹp như cũ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Cột trái */}
               <div className="space-y-6">
                  {/* Thông tin khách hàng */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                     <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <svg
                           className="w-5 h-5 text-blue-600"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                           />
                        </svg>
                        Thông tin khách hàng
                     </h3>
                     <div className="space-y-3 text-sm">
                        <div>
                           <p className="text-slate-500">Họ tên</p>
                           <p className="font-medium text-slate-800">
                              {order.shippingAddress.fullName}
                           </p>
                        </div>
                        <div>
                           <p className="text-slate-500">Số điện thoại</p>
                           <p className="font-medium text-slate-800">
                              {order.shippingAddress.phone}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Địa chỉ giao hàng */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                     <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <svg
                           className="w-5 h-5 text-green-600"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                           />
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                           />
                        </svg>
                        Địa chỉ giao hàng
                     </h3>
                     <p className="text-slate-700 leading-relaxed">
                        {order.shippingAddress.address},{" "}
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.country}
                     </p>
                  </div>

                  {/* Phương thức thanh toán */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                     <h3 className="text-lg font-semibold text-slate-800 mb-4">
                        Phương thức thanh toán
                     </h3>
                     <p className="text-slate-700 font-medium">
                        {paymentMethodLabel[order.paymentMethod] ||
                           order.paymentMethod}
                     </p>
                  </div>

                  {/* Thời gian */}
                  <div className="bg-white rounded-xl shadow-lg p-6 text-sm">
                     <div className="space-y-4">
                        <div>
                           <p className="text-slate-500">Thời gian đặt hàng</p>
                           <p className="font-medium text-slate-800">
                              {formatDateVN(order.createdAt)}
                           </p>
                        </div>
                        <div>
                           <p className="text-slate-500">Cập nhật lần cuối</p>
                           <p className="font-medium text-slate-800">
                              {formatDateVN(order.updatedAt)}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Cột phải */}
               <div className="lg:col-span-2 space-y-6">
                  {/* Danh sách sản phẩm */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                     <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800">
                           Sản phẩm trong đơn hàng
                        </h3>
                     </div>
                     <div className="divide-y divide-slate-200">
                        {order.items.map((item) => (
                           <div
                              key={item._id}
                              className="p-6 flex gap-4 items-center"
                           >
                              <div className="w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                 <svg
                                    className="w-10 h-10 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                 >
                                    <path
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                       strokeWidth={2}
                                       d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                 </svg>
                              </div>
                              <div className="flex-1">
                                 <p className="font-medium text-slate-800">
                                    {item.productId ? (
                                       `Sản phẩm ID: ${item.productId}`
                                    ) : (
                                       <span className="text-red-600">
                                          Sản phẩm đã bị xóa
                                       </span>
                                    )}
                                 </p>
                                 <p className="text-sm text-slate-500 mt-1">
                                    Số lượng:{" "}
                                    <span className="font-medium">
                                       {item.quantity}
                                    </span>
                                 </p>
                              </div>
                              <div className="text-right">
                                 <p className="font-semibold text-slate-800">
                                    {item.price.toLocaleString("vi-VN")}₫
                                 </p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Tổng tiền */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                     <div className="space-y-4 text-lg">
                        <div className="flex justify-between text-slate-600">
                           <span>Tạm tính</span>
                           <span>{order.total.toLocaleString("vi-VN")}₫</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                           <span>Phí vận chuyển</span>
                           <span className="text-green-600">Miễn phí</span>
                        </div>
                        <div className="border-t-2 border-slate-200 pt-4">
                           <div className="flex justify-between font-bold text-xl">
                              <span>Tổng cộng</span>
                              <span className="text-red-600">
                                 {order.total.toLocaleString("vi-VN")}₫
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
