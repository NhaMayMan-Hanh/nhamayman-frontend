"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@contexts/AuthContext";
import ProfileSidebar from "@components/client/profile/ProfileSidebar";
import Link from "next/link";
import Image from "next/image";
import { Eye } from "lucide-react";

interface OrderItem {
   productId: {
      _id: string;
      name: string;
      price: number;
      image: string;
   };
   quantity: number;
   price: number;
}

interface Order {
   _id: string;
   items: OrderItem[];
   total: number;
   status: string;
   createdAt: string;
}

interface OrdersData {
   message: string;
   success: boolean;
   data: Order[];
}

const statusTabs = [
   { key: "all", label: "Tất cả" },
   { key: "pending", label: "Chờ xác nhận" },
   { key: "confirmed", label: "Đã xác nhận" },
   { key: "shipped", label: "Đang giao" },
   { key: "delivered", label: "Hoàn thành" },
   { key: "cancelled", label: "Đã hủy" },
];

const getStatusDisplay = (status: string) => {
   const statusMap: { [key: string]: { label: string; className: string } } = {
      pending: {
         label: "Chờ xác nhận",
         className: "bg-yellow-100 text-yellow-800",
      },
      confirmed: {
         label: "Đã xác nhận",
         className: "bg-blue-100 text-blue-800",
      },
      shipped: {
         label: "Đang giao hàng",
         className: "bg-purple-100 text-purple-800",
      },
      delivered: {
         label: "Hoàn thành",
         className: "bg-green-100 text-green-800",
      },
      cancelled: {
         label: "Đã hủy",
         className: "bg-red-100 text-red-800",
      },
   };

   return (
      statusMap[status] || {
         label: status,
         className: "bg-gray-100 text-gray-800",
      }
   );
};

export default function OrdersPage() {
   const [orders, setOrders] = useState<Order[]>([]);
   const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
   const [activeTab, setActiveTab] = useState("all");
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
      null
   );
   const [showCancelModal, setShowCancelModal] = useState(false);
   const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
   const { user, loading: authLoading } = useAuth();

   useEffect(() => {
      if (authLoading) {
         return;
      }

      if (!user) {
         setError("Vui lòng đăng nhập để xem đơn hàng");
         setLoading(false);
         return;
      }

      const fetchOrders = async () => {
         try {
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/client/orders`,
               {
                  credentials: "include",
               }
            );
            if (!res.ok) {
               if (res.status === 401) {
                  setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                  return;
               }
               throw new Error("Lỗi khi fetch orders");
            }
            const result: OrdersData = await res.json();
            if (result.success) {
               setOrders(result.data);
               setFilteredOrders(result.data);
            } else {
               setError(result.message || "Lỗi không xác định");
            }
         } catch (err) {
            setError((err as Error).message);
         } finally {
            setLoading(false);
         }
      };

      fetchOrders();
   }, [user, authLoading]);

   useEffect(() => {
      if (activeTab === "all") {
         setFilteredOrders(orders);
      } else {
         setFilteredOrders(
            orders.filter((order) => order.status === activeTab)
         );
      }
   }, [activeTab, orders]);

   const handleCancelClick = (orderId: string) => {
      setOrderToCancel(orderId);
      setShowCancelModal(true);
   };

   const handleCancelOrder = async () => {
      if (!orderToCancel) return;

      setCancellingOrderId(orderToCancel);
      try {
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/client/orders/${orderToCancel}/cancel`,
            {
               method: "PATCH",
               credentials: "include",
               headers: {
                  "Content-Type": "application/json",
               },
            }
         );

         if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Không thể hủy đơn hàng");
         }

         const result = await res.json();
         if (result.success) {
            setOrders((prevOrders) =>
               prevOrders.map((order) =>
                  order._id === orderToCancel
                     ? { ...order, status: "cancelled" }
                     : order
               )
            );
            alert("Hủy đơn hàng thành công!");
         } else {
            throw new Error(result.message || "Lỗi không xác định");
         }
      } catch (err) {
         alert((err as Error).message);
      } finally {
         setCancellingOrderId(null);
         setShowCancelModal(false);
         setOrderToCancel(null);
      }
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
               <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-2"></div>
               <p className="text-gray-600">Đang tải đơn hàng...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Link href="/login" className="text-amber-500 hover:underline">
               Đăng nhập để xem đơn hàng
            </Link>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50">
         <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
               <ProfileSidebar activePath="/orders" />

               <div className="lg:col-span-3">
                  <div className="bg-white rounded-lg shadow p-6">
                     <h2 className="text-2xl font-bold mb-6">
                        Đơn hàng của bạn
                     </h2>
                     <div className="flex border-b mb-6">
                        {statusTabs.map((tab) => {
                           const count =
                              tab.key === "all"
                                 ? orders.length
                                 : orders.filter((o) => o.status === tab.key)
                                      .length;

                           return (
                              <button
                                 key={tab.key}
                                 onClick={() => setActiveTab(tab.key)}
                                 className={`px-4 py-3 -mb-px font-medium border-b-2 transition-colors whitespace-nowrap text-sm cursor-pointer ${
                                    activeTab === tab.key
                                       ? "border-amber-500 text-amber-600"
                                       : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                 }`}
                              >
                                 {tab.label} ({count})
                              </button>
                           );
                        })}
                     </div>

                     {filteredOrders.length === 0 ? (
                        <div className="text-center py-12">
                           <svg
                              className="mx-auto h-12 w-12 text-gray-400 mb-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                           >
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth={2}
                                 d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                              />
                           </svg>
                           <p className="text-gray-600 mb-2">
                              Không có đơn hàng trong danh mục này
                           </p>
                           <Link
                              href="/productsAll"
                              className="text-amber-500 hover:underline"
                           >
                              Mua sắm ngay →
                           </Link>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           {filteredOrders.map((order) => {
                              const statusInfo = getStatusDisplay(order.status);
                              return (
                                 <div
                                    key={order._id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                 >
                                    <div className="flex justify-between items-start mb-3">
                                       <div>
                                          <h3 className="text-base font-semibold text-gray-900">
                                             Đơn hàng #
                                             {order._id
                                                .substring(0, 8)
                                                .toUpperCase()}
                                          </h3>
                                          <p className="text-sm text-gray-500 mt-1">
                                             Đặt ngày:{" "}
                                             {new Date(
                                                order.createdAt
                                             ).toLocaleDateString("vi-VN", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                             })}
                                          </p>
                                       </div>
                                       <span
                                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}
                                       >
                                          {statusInfo.label}
                                       </span>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                       {order.items.map((item, index) => (
                                          <div
                                             key={index}
                                             className="flex items-center space-x-3 py-2"
                                          >
                                             <Image
                                                src={item.productId.image}
                                                alt={item.productId.name}
                                                width={60}
                                                height={60}
                                                className="object-cover rounded border"
                                             />
                                             <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">
                                                   {item.productId.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                   Số lượng: {item.quantity} ×{" "}
                                                   {item.price.toLocaleString()}{" "}
                                                   VNĐ
                                                </p>
                                             </div>
                                             <span className="font-semibold text-gray-900 whitespace-nowrap">
                                                {(
                                                   item.quantity * item.price
                                                ).toLocaleString()}{" "}
                                                VNĐ
                                             </span>
                                          </div>
                                       ))}
                                    </div>

                                    <div className="border-t pt-3 flex justify-between items-center flex-wrap gap-3">
                                       <div>
                                          <p className="text-sm text-gray-500">
                                             Tổng thanh toán
                                          </p>
                                          <p className="text-xl font-bold text-amber-600">
                                             {order.total.toLocaleString()} VNĐ
                                          </p>
                                       </div>
                                       <div className="flex gap-2">
                                          {/* Nút Xem chi tiết */}
                                          <Link
                                             href={`/orders/${order._id}`}
                                             className="flex items-center gap-2 px-5 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                                          >
                                             <Eye className="w-4 h-4" />
                                             Xem chi tiết
                                          </Link>

                                          {/* Nút Hủy đơn hàng */}
                                          {order.status === "pending" && (
                                             <button
                                                onClick={() =>
                                                   handleCancelClick(order._id)
                                                }
                                                disabled={
                                                   cancellingOrderId ===
                                                   order._id
                                                }
                                                className="px-5 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                             >
                                                {cancellingOrderId === order._id
                                                   ? "Đang hủy..."
                                                   : "Hủy đơn hàng"}
                                             </button>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* Cancel Confirmation Modal */}
         {showCancelModal && (
            <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">
                     Xác nhận hủy đơn hàng
                  </h3>
                  <p className="text-gray-600 mb-6">
                     Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không
                     thể hoàn tác.
                  </p>
                  <div className="flex justify-end space-x-3">
                     <button
                        onClick={() => {
                           setShowCancelModal(false);
                           setOrderToCancel(null);
                        }}
                        className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                     >
                        Không
                     </button>
                     <button
                        onClick={handleCancelOrder}
                        disabled={cancellingOrderId !== null}
                        className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors font-medium"
                     >
                        {cancellingOrderId ? "Đang hủy..." : "Có, hủy đơn"}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
