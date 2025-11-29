"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, RefreshCw, Eye, Package } from "lucide-react";
import { Order, OrderStatus, OrderActionModal, ApiResponse } from "./types";
import { STATUS_CONFIG, PAYMENT_METHOD_LABELS } from "./helpers/constants";
import {
   formatDate,
   filterOrders,
   usePagination,
   useOrderActions,
} from "./helpers/utils";
import { useToast } from "@contexts/ToastContext";
import Loading from "@components/admin/Loading";
import ConfirmModal from "./components/ModalConfirm";
import OrderActionButtons from "./components/OrderActionButtons";
import apiRequest from "@lib/api";
export default function Orders() {
   const [orders, setOrders] = useState<Order[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState("");
   const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
   const router = useRouter();
   const toast = useToast();
   const {
      actionLoading,
      showConfirmModal,
      handleAction,
      confirmAction,
      cancelAction,
   } = useOrderActions(setOrders, toast);

   const fetchOrders = useCallback(async () => {
      try {
         setLoading(true);
         const result = await apiRequest.get<ApiResponse>(`/admin/orders`);
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
   }, []);

   useEffect(() => {
      fetchOrders();
   }, [fetchOrders]);
   const filteredOrders = useMemo(
      () => filterOrders(orders, searchTerm, statusFilter),
      [orders, searchTerm, statusFilter]
   );
   const {
      currentPage,
      totalPages,
      paginatedData: paginatedOrders,
      goToNextPage,
      goToPrevPage,
      setPage,
   } = usePagination(filteredOrders, 10);

   useEffect(() => {
      setPage(1);
   }, [searchTerm, statusFilter, setPage]);

   if (loading) return <Loading />;

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
            {/* Header */}
            <div className="mb-8">
               <h1 className="text-3xl font-bold text-gray-900">
                  Quản lý Đơn hàng
               </h1>
               <p className="text-gray-600 mt-2">
                  Theo dõi và xử lý tất cả đơn hàng từ khách
               </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                     <input
                        type="text"
                        placeholder="Tìm mã đơn, tên, sđt, địa chỉ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>

                  <select
                     value={statusFilter}
                     onChange={(e) =>
                        setStatusFilter(e.target.value as OrderStatus | "all")
                     }
                     className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                     <option value="all">Tất cả trạng thái</option>
                     {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                        <option key={status} value={status}>
                           {config.label}
                        </option>
                     ))}
                  </select>

                  <button
                     onClick={fetchOrders}
                     className="flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                     <RefreshCw className="w-5 h-5" />
                     Làm mới
                  </button>
               </div>
            </div>

            {/* Table */}
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
                                    <Package className="w-16 h-16 text-gray-300 mb-3" />
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
                                          PAYMENT_METHOD_LABELS[
                                             order.paymentMethod
                                          ]
                                       }
                                    </span>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span
                                       className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                          STATUS_CONFIG[order.status].color
                                       }`}
                                    >
                                       {STATUS_CONFIG[order.status].label}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-sm text-gray-600">
                                    {formatDate(order.createdAt)}
                                 </td>
                                 <td className="px-6 py-4">
                                    <OrderActionButtons
                                       order={order}
                                       actionLoading={actionLoading}
                                       onView={() =>
                                          router.push(
                                             `/admin/orders/${order._id}`
                                          )
                                       }
                                       onAction={handleAction}
                                    />
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>

               {/* Pagination */}
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
                              onClick={goToPrevPage}
                              disabled={currentPage === 1}
                              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                           >
                              Trước
                           </button>
                           <button
                              onClick={goToNextPage}
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
            <ConfirmModal
               isOpen={true}
               action={showConfirmModal.action}
               isLoading={actionLoading !== null}
               onConfirm={() => confirmAction(fetchOrders)}
               onCancel={cancelAction}
            />
         )}
      </div>
   );
}
