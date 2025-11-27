"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const formatDate = (dateString: string) => {
   const date = new Date(dateString);
   const day = String(date.getDate()).padStart(2, "0");
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const year = date.getFullYear();
   const hours = String(date.getHours()).padStart(2, "0");
   const minutes = String(date.getMinutes()).padStart(2, "0");
   return `${day}/${month}/${year} ${hours}:${minutes}`;
};

interface ShippingAddress {
   fullName: string;
   phone: string;
   address: string;
   city: string;
   country: string;
}

interface OrderItem {
   productId: {
      _id: string;
      name: string;
      price: number;
      image: string;
   } | null;
   quantity: number;
   price: number;
   _id: string;
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

interface ApiResponse {
   success: boolean;
   data: Order[];
}

const statusDisplay: Record<Order["status"], { label: string; color: string }> =
   {
      pending: {
         label: "Chờ xác nhận",
         color: "bg-yellow-100 text-yellow-800",
      },
      confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
      shipped: { label: "Đang giao", color: "bg-purple-100 text-purple-800" },
      delivered: { label: "Đã giao", color: "bg-green-100 text-green-800" },
      cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
   };

const paymentMethodDisplay: Record<Order["paymentMethod"], string> = {
   cod: "Tiền mặt (COD)",
   online: "Thanh toán online",
   chuyen_khoan: "Chuyển khoản ngân hàng",
};

const actionMessages: Record<
   string,
   { loading: string; success: string; error: string }
> = {
   confirm: {
      loading: "Đang xác nhận đơn hàng...",
      success: "Xác nhận đơn hàng thành công!",
      error: "Xác nhận đơn hàng thất bại",
   },
   ship: {
      loading: "Đang cập nhật trạng thái giao hàng...",
      success: "Đã chuyển sang trạng thái đang giao!",
      error: "Cập nhật trạng thái thất bại",
   },
   deliver: {
      loading: "Đang cập nhật trạng thái giao hàng...",
      success: "Đơn hàng đã được giao thành công!",
      error: "Cập nhật trạng thái thất bại",
   },
   cancel: {
      loading: "Đang hủy đơn hàng...",
      success: "Đã hủy đơn hàng",
      error: "Hủy đơn hàng thất bại",
   },
};

export default function Orders() {
   const [orders, setOrders] = useState<Order[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState("");
   const [statusFilter, setStatusFilter] = useState<Order["status"] | "all">(
      "all"
   );
   const [currentPage, setCurrentPage] = useState(1);
   const [actionLoading, setActionLoading] = useState<string | null>(null);
   const [showConfirmModal, setShowConfirmModal] = useState<{
      orderId: string;
      action: "confirm" | "ship" | "deliver" | "cancel";
      currentStatus: Order["status"];
   } | null>(null);
   const router = useRouter();
   const itemsPerPage = 10;

   useEffect(() => {
      fetchOrders();
   }, []);

   const fetchOrders = async () => {
      try {
         setLoading(true);
         const res = await fetch("http://localhost:5000/api/admin/orders", {
            credentials: "include",
         });
         const result: ApiResponse = await res.json();
         if (result.success) {
            setOrders(result.data);
            setError(null);
         } else {
            setError("Không thể tải danh sách đơn hàng");
         }
      } catch (err: any) {
         setError("Lỗi kết nối: " + err.message);
      } finally {
         setLoading(false);
      }
   };

   const updateOrderStatus = async (
      orderId: string,
      newStatus: Order["status"]
   ) => {
      const action = showConfirmModal?.action;
      if (!action) return;

      const toastId = window.showToast?.(
         actionMessages[action].loading,
         "loading"
      );

      try {
         setActionLoading(orderId);
         const res = await fetch(
            `http://localhost:5000/api/admin/orders/${orderId}`,
            {
               method: "PUT",
               headers: { "Content-Type": "application/json" },
               credentials: "include",
               body: JSON.stringify({ status: newStatus }),
            }
         );

         const result = await res.json();

         if (result.success) {
            await fetchOrders();
            setShowConfirmModal(null);

            if (toastId) {
               window.updateToast?.(
                  toastId,
                  actionMessages[action].success,
                  "success"
               );
            }
         } else {
            if (toastId) {
               window.updateToast?.(
                  toastId,
                  result.message || actionMessages[action].error,
                  "error"
               );
            }
         }
      } catch (err: any) {
         if (toastId) {
            window.updateToast?.(toastId, "Lỗi: " + err.message, "error");
         }
      } finally {
         setActionLoading(null);
      }
   };

   const handleAction = (
      orderId: string,
      action: "confirm" | "ship" | "deliver" | "cancel",
      currentStatus: Order["status"]
   ) => {
      setShowConfirmModal({ orderId, action, currentStatus });
   };

   const confirmAction = () => {
      if (!showConfirmModal) return;

      const statusMap: Record<string, Order["status"]> = {
         confirm: "confirmed",
         ship: "shipped",
         deliver: "delivered",
         cancel: "cancelled",
      };

      updateOrderStatus(
         showConfirmModal.orderId,
         statusMap[showConfirmModal.action]
      );
   };

   const filteredOrders = orders
      .filter((order) => {
         if (statusFilter !== "all" && order.status !== statusFilter)
            return false;
         if (!searchTerm) return true;

         const search = searchTerm.toLowerCase();
         return (
            order._id.toLowerCase().includes(search) ||
            order.shippingAddress.fullName.toLowerCase().includes(search) ||
            order.shippingAddress.phone.includes(search) ||
            order.shippingAddress.address.toLowerCase().includes(search)
         );
      })
      .sort(
         (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

   const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
   const paginatedOrders = filteredOrders.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
   );

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
               <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
               <p className="text-red-800 font-medium">{error}</p>
               <button
                  onClick={fetchOrders}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
               >
                  Thử lại
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
         <div>
            <div className="mb-8">
               <h1 className="text-3xl font-bold text-gray-900">
                  Quản lý Đơn hàng
               </h1>
               <p className="text-gray-600 mt-2">
                  Theo dõi và xử lý tất cả đơn hàng từ khách
               </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                     <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                     </svg>
                     <input
                        type="text"
                        placeholder="Tìm mã đơn, tên, sđt, địa chỉ..."
                        value={searchTerm}
                        onChange={(e) => {
                           setSearchTerm(e.target.value);
                           setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>

                  <select
                     value={statusFilter}
                     onChange={(e) => {
                        setStatusFilter(e.target.value as any);
                        setCurrentPage(1);
                     }}
                     className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                     <option value="all">Tất cả trạng thái</option>
                     <option value="pending">Chờ xác nhận</option>
                     <option value="confirmed">Đã xác nhận</option>
                     <option value="shipped">Đang giao</option>
                     <option value="delivered">Đã giao</option>
                     <option value="cancelled">Đã hủy</option>
                  </select>

                  <button
                     onClick={fetchOrders}
                     className="flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                           d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                     </svg>
                     Làm mới
                  </button>
               </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                     <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                           <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mã đơn
                           </th>
                           <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Khách hàng
                           </th>
                           <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Sản phẩm
                           </th>
                           <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tổng tiền
                           </th>
                           <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Thanh toán
                           </th>
                           <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Trạng thái
                           </th>
                           <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ngày đặt
                           </th>
                           <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Hành động
                           </th>
                        </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedOrders.length === 0 ? (
                           <tr>
                              <td
                                 colSpan={8}
                                 className="px-6 py-12 text-center text-gray-500"
                              >
                                 <div className="flex flex-col items-center">
                                    <svg
                                       className="w-16 h-16 text-gray-300 mb-3"
                                       fill="currentColor"
                                       viewBox="0 0 20 20"
                                    >
                                       <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                    </svg>
                                    Không có đơn hàng nào
                                 </div>
                              </td>
                           </tr>
                        ) : (
                           paginatedOrders.map((order) => (
                              <tr
                                 key={order._id}
                                 className="hover:bg-gray-50 transition-colors"
                              >
                                 <td className="px-6 py-4">
                                    <div className="text-sm font-mono font-semibold text-gray-900">
                                       #{order._id.slice(-8).toUpperCase()}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="text-sm">
                                       <div className="font-medium text-gray-900">
                                          {order.shippingAddress.fullName}
                                       </div>
                                       <div className="text-gray-500">
                                          {order.shippingAddress.phone}
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-sm text-gray-600">
                                    {order.items.length} sản phẩm
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="text-sm font-semibold text-gray-900">
                                       {order.total.toLocaleString("vi-VN")}đ
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className="text-sm text-gray-600">
                                       {
                                          paymentMethodDisplay[
                                             order.paymentMethod
                                          ]
                                       }
                                    </span>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span
                                       className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                          statusDisplay[order.status].color
                                       }`}
                                    >
                                       {statusDisplay[order.status].label}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-sm text-gray-600">
                                    {formatDate(order.createdAt)}
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                       <button
                                          onClick={() =>
                                             router.push(
                                                `/admin/orders/${order._id}`
                                             )
                                          }
                                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                          title="Xem chi tiết"
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
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                             />
                                             <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                             />
                                          </svg>
                                       </button>

                                       {order.status === "pending" && (
                                          <>
                                             <button
                                                onClick={() =>
                                                   handleAction(
                                                      order._id,
                                                      "confirm",
                                                      order.status
                                                   )
                                                }
                                                disabled={
                                                   actionLoading === order._id
                                                }
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50"
                                                title="Xác nhận đơn"
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
                                                      d="M5 13l4 4L19 7"
                                                   />
                                                </svg>
                                             </button>
                                             <button
                                                onClick={() =>
                                                   handleAction(
                                                      order._id,
                                                      "cancel",
                                                      order.status
                                                   )
                                                }
                                                disabled={
                                                   actionLoading === order._id
                                                }
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                                title="Hủy đơn"
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
                                                      d="M6 18L18 6M6 6l12 12"
                                                   />
                                                </svg>
                                             </button>
                                          </>
                                       )}

                                       {order.status === "confirmed" && (
                                          <>
                                             <button
                                                onClick={() =>
                                                   handleAction(
                                                      order._id,
                                                      "ship",
                                                      order.status
                                                   )
                                                }
                                                disabled={
                                                   actionLoading === order._id
                                                }
                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all disabled:opacity-50"
                                                title="Chuyển sang đang giao"
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
                                                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                                                   />
                                                </svg>
                                             </button>
                                             <button
                                                onClick={() =>
                                                   handleAction(
                                                      order._id,
                                                      "cancel",
                                                      order.status
                                                   )
                                                }
                                                disabled={
                                                   actionLoading === order._id
                                                }
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                                title="Hủy đơn"
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
                                                      d="M6 18L18 6M6 6l12 12"
                                                   />
                                                </svg>
                                             </button>
                                          </>
                                       )}

                                       {order.status === "shipped" && (
                                          <button
                                             onClick={() =>
                                                handleAction(
                                                   order._id,
                                                   "deliver",
                                                   order.status
                                                )
                                             }
                                             disabled={
                                                actionLoading === order._id
                                             }
                                             className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50"
                                             title="Đánh dấu đã giao"
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
                                                   d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                             </svg>
                                          </button>
                                       )}
                                    </div>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>

               {totalPages > 1 && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                     <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-700">
                           Trang{" "}
                           <span className="font-medium">{currentPage}</span> /{" "}
                           <span className="font-medium">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                           <button
                              onClick={() =>
                                 setCurrentPage((p) => Math.max(1, p - 1))
                              }
                              disabled={currentPage === 1}
                              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                           >
                              Trước
                           </button>
                           <button
                              onClick={() =>
                                 setCurrentPage((p) =>
                                    Math.min(totalPages, p + 1)
                                 )
                              }
                              disabled={currentPage === totalPages}
                              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                           >
                              Sau
                           </button>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
         {showConfirmModal && (
            <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-semibold mb-4">
                     {showConfirmModal.action === "confirm" &&
                        "Xác nhận đơn hàng"}
                     {showConfirmModal.action === "ship" &&
                        "Chuyển sang đang giao"}
                     {showConfirmModal.action === "deliver" &&
                        "Đánh dấu đã giao"}
                     {showConfirmModal.action === "cancel" && "Hủy đơn hàng"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                     Bạn có chắc chắn muốn thực hiện hành động này?
                  </p>
                  <div className="flex gap-3 justify-end">
                     <button
                        onClick={() => setShowConfirmModal(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={actionLoading !== null}
                     >
                        Hủy
                     </button>
                     <button
                        onClick={confirmAction}
                        disabled={actionLoading !== null}
                        className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
                           showConfirmModal.action === "cancel"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-blue-600 hover:bg-blue-700"
                        }`}
                     >
                        {actionLoading ? "Đang xử lý..." : "Xác nhận"}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
