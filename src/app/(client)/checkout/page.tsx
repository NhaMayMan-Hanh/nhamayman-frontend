// app/(client)/checkout/page.tsx (Trang checkout - fetch cart, form address/payment, create order)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@contexts/CartContext";
import { useAuth } from "@contexts/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CheckoutData {
  success: boolean;
  data: any; // Order response
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    country: "Việt Nam",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash"); // Default cash

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        items: cart.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        total,
        shippingAddress: address,
        paymentMethod,
      };

      const res = await fetch("http://localhost:5000/api/client/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data: CheckoutData = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Tạo đơn hàng thất bại");
      }

      toast.success("Đặt hàng thành công! Đơn hàng sẽ được xử lý sớm.");
      clearCart(); // Clear cart after success
      router.push("/orders"); // Redirect to orders page
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4">Thanh toán</h1>
        <p className="text-gray-600 mb-8">
          Giỏ hàng trống.{" "}
          <Link href="/cart" className="text-amber-500 hover:underline">
            Quay về giỏ hàng
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Cart Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Tóm tắt giỏ hàng</h2>
          <div className="space-y-4 mb-6">
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Image
                    width={48}
                    height={48}
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
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
          <div className="border-t pt-4 text-right">
            <p className="text-xl font-bold">Tổng: {total.toLocaleString()} VNĐ</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Họ và tên"
              value={address.fullName}
              onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={address.phone}
              onChange={(e) => setAddress({ ...address, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
            <input
              type="text"
              placeholder="Địa chỉ chi tiết"
              value={address.address}
              onChange={(e) => setAddress({ ...address, address: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
            <input
              type="text"
              placeholder="Thành phố"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              <option value="cash">Thanh toán khi nhận hàng</option>
              <option value="card">Thẻ tín dụng</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-lg transition-colors ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
