// app/(client)/orders/page.tsx (Trang orders - fetch từ API, giả sử auth userId)
"use client";

import { useState, useEffect } from "react";

interface OrderItem {
  productId: string;
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Giả sử userId từ auth context
    const userId = "6913864d9bfb7360be6cf6aa"; // Placeholder - thay bằng real userId
    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/client/checkout`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, // Auth header
        });
        if (!res.ok) {
          throw new Error("Lỗi khi fetch orders");
        }
        const result: OrdersData = await res.json();
        if (result.success) {
          setOrders(result.data);
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
  }, []);

  if (loading) {
    return <div className="text-center py-8">Đang tải đơn hàng...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Lỗi: {error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Đơn hàng của bạn</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Đơn hàng #{order._id.substring(0, 8)}</h2>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  order.status === "delivered"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-gray-600 mb-4">
              Ngày đặt: {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>
                    Sản phẩm {index + 1}: {item.quantity} x {item.price.toLocaleString()} VNĐ
                  </span>
                  <span>{(item.quantity * item.price).toLocaleString()} VNĐ</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mt-4 text-right">
              <p className="text-xl font-bold">Tổng: {order.total.toLocaleString()} VNĐ</p>
            </div>
          </div>
        ))}
      </div>
      {orders.length === 0 && <p className="text-center text-gray-600">Chưa có đơn hàng nào.</p>}
    </div>
  );
}
