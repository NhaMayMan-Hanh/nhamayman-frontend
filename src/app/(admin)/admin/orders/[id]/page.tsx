"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { Order, OrderStatus } from "../types";
import {
  STATUS_CONFIG,
  PAYMENT_METHOD_LABELS,
  STATUS_FLOW,
  STATUS_UPDATE_MESSAGES,
} from "../helpers/constants";
import { formatDateVN } from "../helpers/utils";
import { useToast } from "@contexts/ToastContext";
import OrderItem from "../components/OrderItem";
import apiRequest from "@lib/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ProductResponse {
  product: any;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const toast = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("pending");
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fetchProductDetails = useCallback(async (productId: string) => {
    try {
      const result = await apiRequest.get<ApiResponse<ProductResponse>>(
        `/client/products/id/${productId}`
      );
      if (result.success && result.data?.product) {
        return result.data.product;
      }
      return null;
    } catch (err) {
      console.error(`Error fetching product ${productId}:`, err);
      return null;
    }
  }, []);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingProducts(true);

      const result = await apiRequest.get<ApiResponse<Order>>(`/admin/orders/${orderId}`);

      if (result.success && result.data) {
        // Parallel fetch all products at once
        const updatedItems = await Promise.all(
          result.data.items.map(async (item: any) => {
            if (!item.productId?._id) {
              return { ...item, productDetails: null };
            }

            const productDetails = await fetchProductDetails(item.productId._id);
            return { ...item, productDetails };
          })
        );

        const orderWithDetails = { ...result.data, items: updatedItems };
        setOrder(orderWithDetails);
        setSelectedStatus(orderWithDetails.status);
        setError(null);
      } else {
        throw new Error(result.message || "Không tìm thấy đơn hàng");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi kết nối";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setLoadingProducts(false);
    }
  }, [orderId, fetchProductDetails, toast]);

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId, fetchOrder]);

  const handleStatusChange = useCallback(async () => {
    if (!order || selectedStatus === order.status) return;

    const toastId = toast.loading("Đang cập nhật trạng thái...");
    setUpdatingStatus(true);

    try {
      const result = await apiRequest.put<ApiResponse<Order>>(`/admin/orders/${orderId}`, {
        status: selectedStatus,
      });

      if (result.success) {
        setOrder({ ...order, status: selectedStatus });
        toast.updateToast(toastId, STATUS_UPDATE_MESSAGES[selectedStatus], "success");
      } else {
        toast.updateToast(toastId, result.message || "Cập nhật trạng thái thất bại", "error");
        setSelectedStatus(order.status);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi kết nối server";
      toast.updateToast(toastId, errorMsg, "error");
      setSelectedStatus(order.status);
    } finally {
      setUpdatingStatus(false);
    }
  }, [order, selectedStatus, orderId, toast]);

  const currentStatus = useMemo(() => (order ? STATUS_CONFIG[order.status] : null), [order]);

  const nextStatuses = useMemo(
    () => (order ? STATUS_FLOW.slice(STATUS_FLOW.indexOf(order.status)) : []),
    [order]
  );

  const canUpdateStatus = useMemo(
    () => order && order.status !== "delivered" && order.status !== "cancelled",
    [order]
  );

  const isStatusChanged = useMemo(() => selectedStatus !== order?.status, [selectedStatus, order]);

  const orderCode = useMemo(() => order?._id.slice(-8).toUpperCase() || "", [order]);

  const paymentMethodLabel = useMemo(
    () => (order ? PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod : ""),
    [order]
  );

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

  if (error || !order || !currentStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-4">{error || "Không tìm thấy đơn hàng"}</p>
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

  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div>
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-800">Chi tiết đơn hàng</h1>
              </div>
              <p className="text-slate-600">
                Mã đơn: <span className="font-mono font-semibold text-blue-600">#{orderCode}</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">Trạng thái:</span>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${currentStatus.bg} ${currentStatus.color}`}
                >
                  <StatusIcon className="w-4 h-4" />
                  {currentStatus.label}
                </span>
              </div>

              {canUpdateStatus && (
                <div className="flex items-center gap-3">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                    disabled={updatingStatus}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                  >
                    {nextStatuses.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_CONFIG[status].label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleStatusChange}
                    disabled={updatingStatus || !isStatusChanged}
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
                  <p className="font-medium text-slate-800">{order.shippingAddress.fullName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Số điện thoại</p>
                  <p className="font-medium text-slate-800">{order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Địa chỉ giao hàng
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.country}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Phương thức thanh toán
              </h3>
              <p className="text-slate-700 font-medium">{paymentMethodLabel}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 text-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Thời gian
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-500">Thời gian đặt hàng</p>
                  <p className="font-medium text-slate-800">{formatDateVN(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Cập nhật lần cuối</p>
                  <p className="font-medium text-slate-800">{formatDateVN(order.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-linear-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Sản phẩm trong đơn hàng
                </h3>
              </div>
              <div className="divide-y divide-slate-200">
                {loadingProducts ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                    <p className="text-slate-600">Đang tải thông tin sản phẩm...</p>
                  </div>
                ) : (
                  order.items.map((item) => <OrderItem key={item._id} item={item} />)
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="space-y-4">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính</span>
                  <span className="font-medium">{order.total.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>
                <div className="border-t-2 border-slate-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-slate-800">Tổng cộng</span>
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
