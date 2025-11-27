"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
   Package,
   User,
   MapPin,
   CreditCard,
   Clock,
   Truck,
   CheckCircle2,
   XCircle,
   AlertCircle,
   ArrowLeft,
   RefreshCw,
   ShoppingBag,
} from "lucide-react";

const formatDateVN = (dateString: string): string => {
   const date = new Date(dateString);
   const hours = date.getHours().toString().padStart(2, "0");
   const minutes = date.getMinutes().toString().padStart(2, "0");
   const day = date.getDate().toString().padStart(2, "0");
   const month = (date.getMonth() + 1).toString().padStart(2, "0");
   const year = date.getFullYear();
   return `${hours}:${minutes} - ${day}/${month}/${year}`;
};

interface Product {
   _id: string;
   name: string;
   description: string;
   price: number;
   category: string;
   image: string;
   stock: number;
}

interface OrderItem {
   productId: string | null;
   quantity: number;
   price: number;
   _id: string;
   productDetails?: Product | null;
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
   status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
   paymentMethod: "cod" | "online" | "chuyen_khoan";
   shippingAddress: ShippingAddress;
   createdAt: string;
   updatedAt: string;
}

const statusConfig: Record<
   Order["status"],
   { label: string; color: string; bg: string; icon: any }
> = {
   pending: {
      label: "Chờ xác nhận",
      color: "text-amber-700",
      bg: "bg-amber-100",
      icon: AlertCircle,
   },
   confirmed: {
      label: "Đã xác nhận",
      color: "text-blue-700",
      bg: "bg-blue-100",
      icon: CheckCircle2,
   },
   shipped: {
      label: "Đang giao",
      color: "text-purple-700",
      bg: "bg-purple-100",
      icon: Truck,
   },
   delivered: {
      label: "Đã giao",
      color: "text-green-700",
      bg: "bg-green-100",
      icon: Package,
   },
   cancelled: {
      label: "Đã hủy",
      color: "text-red-700",
      bg: "bg-red-100",
      icon: XCircle,
   },
};

const paymentMethodLabel: Record<Order["paymentMethod"], string> = {
   cod: "Thanh toán khi nhận hàng (COD)",
   online: "Thanh toán online",
   chuyen_khoan: "Chuyển khoản ngân hàng",
};

const statusFlow: Order["status"][] = [
   "pending",
   "confirmed",
   "shipped",
   "delivered",
   "cancelled",
];

const statusUpdateMessages: Record<Order["status"], string> = {
   pending: "Đã chuyển về trạng thái chờ xác nhận",
   confirmed: "Đã xác nhận đơn hàng thành công!",
   shipped: "Đơn hàng đang được giao!",
   delivered: "Đơn hàng đã được giao thành công!",
   cancelled: "Đã hủy đơn hàng",
};

export default function OrderDetailPage() {
   const params = useParams();
   const router = useRouter();
   const orderId = params.id as string;

   const [order, setOrder] = useState<Order | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [updatingStatus, setUpdatingStatus] = useState(false);
   const [selectedStatus, setSelectedStatus] =
      useState<Order["status"]>("pending");
   const [loadingProducts, setLoadingProducts] = useState(false);

   useEffect(() => {
      if (orderId) fetchOrder();
   }, [orderId]);

   const fetchOrder = async () => {
      try {
         setLoading(true);
         setLoadingProducts(true);

         const res = await fetch(
            `http://localhost:5000/api/admin/orders/${orderId}`,
            {
               credentials: "include",
            }
         );

         if (!res.ok) throw new Error("Không thể tải đơn hàng");
         const result = await res.json();

         if (result.success && result.data) {
            const updatedItems = await Promise.all(
               result.data.items.map(async (item: any) => {
                  if (!item.productId || !item.productId._id) {
                     return { ...item, productDetails: null };
                  }
                  try {
                     const productRes = await fetch(
                        `http://localhost:5000/api/client/products/${item.productId._id}`
                     );
                     const productResult = await productRes.json();

                     if (productResult.success && productResult.data?.product) {
                        return {
                           ...item,
                           productDetails: productResult.data.product,
                        };
                     }
                     return { ...item, productDetails: null };
                  } catch (err) {
                     console.error(
                        `Error fetching product ${item.productId._id}:`,
                        err
                     );
                     return { ...item, productDetails: null };
                  }
               })
            );

            const orderWithDetails = { ...result.data, items: updatedItems };
            setOrder(orderWithDetails);
            setSelectedStatus(orderWithDetails.status);
         } else {
            throw new Error(result.message || "Không tìm thấy đơn hàng");
         }
      } catch (err) {
         const msg = err instanceof Error ? err.message : "Lỗi kết nối";
         setError(msg);
         window.showToast?.(msg, "error");
      } finally {
         setLoading(false);
         setLoadingProducts(false);
      }
   };

   const handleStatusChange = async () => {
      if (!order || selectedStatus === order.status) return;

      const toastId = window.showToast?.(
         "Đang cập nhật trạng thái...",
         "loading"
      );
      setUpdatingStatus(true);

      try {
         const res = await fetch(
            `http://localhost:5000/api/admin/orders/${orderId}`,
            {
               method: "PUT",
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

            if (toastId) {
               window.updateToast?.(
                  toastId,
                  statusUpdateMessages[selectedStatus],
                  "success"
               );
            }
         } else {
            if (toastId) {
               window.updateToast?.(
                  toastId,
                  result.message || "Cập nhật trạng thái thất bại",
                  "error"
               );
            }
            setSelectedStatus(order.status);
         }
      } catch (err) {
         if (toastId) {
            window.updateToast?.(toastId, "Lỗi kết nối server", "error");
         }
         setSelectedStatus(order.status);
      } finally {
         setUpdatingStatus(false);
      }
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="text-center">
               <RefreshCw className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
               <p className="text-slate-600">Đang tải chi tiết đơn hàng...</p>
            </div>
         </div>
      );
   }

   if (error || !order) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
               <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
               <p className="text-red-600 font-medium mb-4">
                  {error || "Không tìm thấy đơn hàng"}
               </p>
               <button
                  onClick={() => router.back()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
               >
                  Quay lại danh sách
               </button>
            </div>
         </div>
      );
   }

   const currentStatus = statusConfig[order.status];
   const StatusIcon = currentStatus.icon;
   const nextStatuses = statusFlow.slice(statusFlow.indexOf(order.status));

   return (
      <div className="min-h-screen bg-slate-50 p-6">
         <div>
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
               <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                     <div className="flex items-center gap-3 mb-2">
                        <ShoppingBag className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-slate-800">
                           Chi tiết đơn hàng
                        </h1>
                     </div>
                     <p className="text-slate-600">
                        Mã đơn:{" "}
                        <span className="font-mono font-semibold text-blue-600">
                           #{order._id.slice(-8).toUpperCase()}
                        </span>
                     </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                     <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">
                           Trạng thái:
                        </span>
                        <span
                           className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${currentStatus.bg} ${currentStatus.color}`}
                        >
                           <StatusIcon className="w-4 h-4" />
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
                                 {updatingStatus ? (
                                    <>
                                       <RefreshCw className="w-4 h-4 animate-spin" />
                                       Đang cập nhật...
                                    </>
                                 ) : (
                                    "Cập nhật"
                                 )}
                              </button>
                           </div>
                        )}
                  </div>

                  <button
                     onClick={() => router.back()}
                     className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium text-slate-700"
                  >
                     <ArrowLeft className="w-4 h-4" />
                     Quay lại
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                     <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
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

                  <div className="bg-white rounded-xl shadow-sm p-6">
                     <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        Địa chỉ giao hàng
                     </h3>
                     <p className="text-slate-700 leading-relaxed">
                        {order.shippingAddress.address},{" "}
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.country}
                     </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                     <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                        Phương thức thanh toán
                     </h3>
                     <p className="text-slate-700 font-medium">
                        {paymentMethodLabel[order.paymentMethod] ||
                           order.paymentMethod}
                     </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6 text-sm">
                     <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        Thời gian
                     </h3>
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

               <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                     <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                           <Package className="w-5 h-5 text-blue-600" />
                           Sản phẩm trong đơn hàng
                        </h3>
                     </div>
                     <div className="divide-y divide-slate-200">
                        {loadingProducts ? (
                           <div className="p-8 text-center">
                              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                              <p className="text-slate-600">
                                 Đang tải thông tin sản phẩm...
                              </p>
                           </div>
                        ) : (
                           order.items.map((item) => (
                              <div
                                 key={item._id}
                                 className="p-6 flex gap-4 items-center hover:bg-slate-50 transition"
                              >
                                 <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                                          Danh mục:{" "}
                                          {item.productDetails.category}
                                       </p>
                                    )}
                                    <p className="text-sm text-slate-500 mt-1">
                                       Số lượng:{" "}
                                       <span className="font-medium text-slate-700">
                                          {item.quantity}
                                       </span>
                                    </p>
                                    {item.productDetails?.stock !==
                                       undefined && (
                                       <p className="text-xs text-slate-500 mt-1">
                                          Tồn kho: {item.productDetails.stock}
                                       </p>
                                    )}
                                 </div>
                                 <div className="text-right">
                                    <p className="font-semibold text-lg text-slate-800">
                                       {item.price.toLocaleString("vi-VN")}₫
                                    </p>
                                    {item.quantity > 1 && (
                                       <p className="text-xs text-slate-500 mt-1">
                                          {(
                                             item.price / item.quantity
                                          ).toLocaleString("vi-VN")}
                                          ₫ / sp
                                       </p>
                                    )}
                                 </div>
                              </div>
                           ))
                        )}
                     </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                     <div className="space-y-4">
                        <div className="flex justify-between text-slate-600">
                           <span>Tạm tính</span>
                           <span className="font-medium">
                              {order.total.toLocaleString("vi-VN")}₫
                           </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                           <span>Phí vận chuyển</span>
                           <span className="text-green-600 font-medium">
                              Miễn phí
                           </span>
                        </div>
                        <div className="border-t-2 border-slate-200 pt-4">
                           <div className="flex justify-between items-center">
                              <span className="text-xl font-bold text-slate-800">
                                 Tổng cộng
                              </span>
                              <span className="text-2xl font-bold text-red-600">
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
