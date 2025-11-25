"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@contexts/AuthContext";
import ProfileSidebar from "@components/client/profile/ProfileSidebar";
import Link from "next/link";
import Image from "next/image";

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
  success: boolean;
  data: Order[];
}

const statusTabs = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "delivered", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      // Wait for auth to load
      return;
    }

    if (!user) {
      setError("Vui lòng đăng nhập để xem đơn hàng");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/client/orders", {
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
          setFilteredOrders(result.data); // Initial all
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
  }, [user]);

  useEffect(() => {
    // Filter orders by tab
    if (activeTab === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order) => order.status === activeTab));
    }
  }, [activeTab, orders]);

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
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
          {/* Sidebar Menu */}
          <ProfileSidebar activePath="/orders" />

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Đơn hàng của bạn</h2>

              <div className="flex border-b mb-6 overflow-x-auto">
                {statusTabs.map((tab) => {
                  const count =
                    tab.key === "all"
                      ? orders.length
                      : orders.filter((o) => o.status === tab.key).length;

                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-6 py-3 -mb-px font-medium border-b-2 transition-colors whitespace-nowrap ${
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
                <p className="text-center text-gray-600 py-8">
                  Không có đơn hàng trong danh mục này.{" "}
                  <Link href="/productsAll" className="text-amber-500 hover:underline">
                    Mua sắm ngay
                  </Link>
                </p>
              ) : (
                <div className="space-y-6">
                  {filteredOrders.map((order) => (
                    <div key={order._id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold">
                          Đơn hàng #{order._id.substring(0, 8)}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status === "pending"
                            ? "Chờ xác nhận"
                            : order.status === "delivered"
                            ? "Hoàn thành"
                            : order.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        Ngày đặt: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <div className="space-y-2 mb-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <Image
                                src={item.productId.image}
                                alt={item.productId.name}
                                width={50}
                                height={50}
                                className="object-cover rounded"
                              />
                              <div>
                                <p className="font-medium">{item.productId.name}</p>
                                <p className="text-sm text-gray-500">
                                  {item.quantity} x {item.price.toLocaleString()} VNĐ
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold">
                              {(item.quantity * item.price).toLocaleString()} VNĐ
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-3 text-right">
                        <p className="text-lg font-bold">
                          Tổng: {order.total.toLocaleString()} VNĐ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
