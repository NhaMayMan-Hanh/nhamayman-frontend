"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@contexts/AuthContext";
import ProfileSidebar from "@components/client/profile/ProfileSidebar";
import Link from "next/link";
import Image from "next/image";
import { Eye, Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { LoadingPage } from "@components/ui/Loading";

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
  { key: "all", label: "Tất cả", icon: Package },
  { key: "pending", label: "Chờ xác nhận", icon: Clock },
  { key: "confirmed", label: "Đã xác nhận", icon: CheckCircle },
  { key: "shipped", label: "Đang giao", icon: Truck },
  { key: "delivered", label: "Hoàn thành", icon: CheckCircle },
  { key: "cancelled", label: "Đã hủy", icon: XCircle },
];

const getStatusDisplay = (status: string) => {
  const statusMap: { [key: string]: { label: string; className: string } } = {
    pending: {
      label: "Chờ xác nhận",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    confirmed: {
      label: "Đã xác nhận",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    shipped: {
      label: "Đang giao hàng",
      className: "bg-purple-100 text-purple-800 border-purple-200",
    },
    delivered: {
      label: "Hoàn thành",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    cancelled: {
      label: "Đã hủy",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  return (
    statusMap[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800 border-gray-200",
    }
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/orders`, {
          credentials: "include",
        });
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
      setFilteredOrders(orders.filter((order) => order.status === activeTab));
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
            order._id === orderToCancel ? { ...order, status: "cancelled" } : order
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
          <LoadingPage message="Đang tải trang..." />
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Đơn hàng của bạn</h2>

              {/* Tabs - Responsive Grid Layout */}
              <div className="mb-6">
                {/* Desktop: Horizontal tabs */}
                <div className="hidden md:flex flex-wrap gap-2 border-b pb-2">
                  {statusTabs.map((tab) => {
                    const count =
                      tab.key === "all"
                        ? orders.length
                        : orders.filter((o) => o.status === tab.key).length;
                    const Icon = tab.icon;

                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`
                          flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                          transition-all duration-200 whitespace-nowrap
                          ${
                            activeTab === tab.key
                              ? "bg-amber-50 text-amber-600 font-semibold shadow-sm ring-2 ring-amber-200"
                              : "text-gray-700 hover:text-amber-500 hover:bg-gray-50"
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        <span
                          className={`
                          px-2 py-0.5 rounded-full text-xs font-semibold
                          ${
                            activeTab === tab.key
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                          }
                        `}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Mobile: Grid Layout */}
                <div className="grid grid-cols-2 gap-2 md:hidden">
                  {statusTabs.map((tab) => {
                    const count =
                      tab.key === "all"
                        ? orders.length
                        : orders.filter((o) => o.status === tab.key).length;
                    const Icon = tab.icon;

                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`
                          flex flex-col items-center gap-1 px-3 py-3 rounded-lg text-xs font-medium
                          transition-all duration-200 relative
                          ${
                            activeTab === tab.key
                              ? "bg-amber-50 text-amber-600 font-semibold shadow-sm ring-2 ring-amber-200"
                              : "text-gray-700 hover:text-amber-500 hover:bg-gray-50 border border-gray-200"
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-center leading-tight">{tab.label}</span>
                        <span
                          className={`
                          absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-xs font-bold
                          ${
                            activeTab === tab.key
                              ? "bg-amber-500 text-white"
                              : "bg-gray-200 text-gray-700"
                          }
                        `}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-2 text-lg font-medium">
                    Không có đơn hàng trong danh mục này
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    Hãy khám phá và mua sắm những sản phẩm tuyệt vời
                  </p>
                  <Link
                    href="/productsAll"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                  >
                    <Package className="w-4 h-4" />
                    Mua sắm ngay
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const statusInfo = getStatusDisplay(order.status);
                    return (
                      <div
                        key={order._id}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-amber-200 transition-all duration-200"
                      >
                        <div className="flex justify-between flex-wrap gap-4 items-start mb-4">
                          <div>
                            <h3 className="text-base font-bold text-gray-900 mb-1">
                              Đơn hàng #{order._id.substring(0, 8).toUpperCase()}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Đặt ngày:{" "}
                              {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <span
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${statusInfo.className}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="space-y-3 mb-4">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="border-b border-gray-100 last:border-0 pb-3 last:pb-0"
                            >
                              <Link
                                href={`/products/${item.productId._id}`}
                                className="flex items-center space-x-4 py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors duration-200"
                              >
                                <Image
                                  src={item.productId.image}
                                  alt={item.productId.name}
                                  width={70}
                                  height={70}
                                  className="object-cover rounded-lg border-2 border-gray-200"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 truncate mb-1">
                                    {item.productId.name}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Số lượng: <span className="font-medium">{item.quantity}</span> ×{" "}
                                    <span className="font-medium">
                                      {item.price.toLocaleString()} VNĐ
                                    </span>
                                  </p>
                                </div>
                                <span className="font-bold text-gray-900 whitespace-nowrap text-base">
                                  {(item.quantity * item.price).toLocaleString()} VNĐ
                                </span>
                              </Link>
                            </div>
                          ))}
                        </div>

                        <div className="border-t-2 border-gray-200 pt-4 flex justify-between items-center flex-wrap gap-3">
                          <div className="bg-amber-50 px-4 py-2 rounded-lg">
                            <p className="text-xs text-gray-600 mb-0.5">Tổng thanh toán</p>
                            <p className="text-xl font-bold text-amber-600">
                              {order.total.toLocaleString()} VNĐ
                            </p>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {/* Nút Xem chi tiết */}
                            <Link
                              href={`/orders/${order._id}`}
                              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <Eye className="w-4 h-4" />
                              Xem chi tiết
                            </Link>

                            {/* Nút Hủy đơn hàng */}
                            {order.status === "pending" && (
                              <button
                                onClick={() => handleCancelClick(order._id)}
                                disabled={cancellingOrderId === order._id}
                                className="px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                {cancellingOrderId === order._id ? (
                                  <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Đang hủy...
                                  </span>
                                ) : (
                                  "Hủy đơn hàng"
                                )}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Xác nhận hủy đơn hàng</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setOrderToCancel(null);
                }}
                className="px-6 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold"
              >
                Không
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancellingOrderId !== null}
                className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
              >
                {cancellingOrderId ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang hủy...
                  </span>
                ) : (
                  "Có, hủy đơn"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
