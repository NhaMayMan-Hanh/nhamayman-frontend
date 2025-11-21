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
  data: any;
  message?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    country: "Việt Nam",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Load selected items from localStorage
  useEffect(() => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để tiếp tục thanh toán");
      router.push("/auth/login");
      return;
    }

    const savedItems = localStorage.getItem("checkout_items");
    if (savedItems) {
      try {
        const items = JSON.parse(savedItems);
        setCheckoutItems(items);
      } catch (error) {
        console.error("Error parsing checkout items:", error);
        toast.error("Lỗi khi tải thông tin thanh toán");
        router.push("/cart");
      }
    } else {
      // If no items selected, redirect to cart
      toast.error("Vui lòng chọn sản phẩm để thanh toán");
      router.push("/cart");
    }
  }, [router]);

  const total = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutItems.length === 0) {
      toast.error("Không có sản phẩm nào để thanh toán");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: checkoutItems.map((item) => ({
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

      // Remove ordered items from cart
      for (const item of checkoutItems) {
        const cartItem = cart.find((c) => c._id === item._id);
        if (cartItem) {
          await clearCart(); // Or implement selective removal
        }
      }

      // Clear checkout items from localStorage
      localStorage.removeItem("cart");

      router.push("/thanks");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12 px-4">
        <div className="py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Thanh toán</h1>
        <Link href="/cart" className="text-amber-600 hover:text-amber-700 font-medium">
          ← Quay về giỏ hàng
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Cart Summary */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Sản phẩm đã chọn ({checkoutItems.length})
          </h2>
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {checkoutItems.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Image
                    width={60}
                    height={60}
                    src={item.image}
                    alt={item.name}
                    className="w-15 h-15 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {item.price.toLocaleString()} VNĐ
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-amber-600">
                  {(item.quantity * item.price).toLocaleString()} VNĐ
                </span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2 text-gray-600">
              <span>Tạm tính:</span>
              <span className="font-medium">{total.toLocaleString()} VNĐ</span>
            </div>
            <div className="flex justify-between items-center mb-2 text-gray-600">
              <span>Phí vận chuyển:</span>
              <span className="font-medium text-green-600">Miễn phí</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
              <span className="text-2xl font-bold text-amber-600">
                {total.toLocaleString()} VNĐ
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Form */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Thông tin giao hàng</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập họ và tên"
                value={address.fullName}
                onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="Nhập số điện thoại"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ chi tiết <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Số nhà, tên đường"
                value={address.address}
                onChange={(e) => setAddress({ ...address, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thành phố <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập thành phố"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phương thức thanh toán <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              >
                <option value="cash">💵 Thanh toán khi nhận hàng (COD)</option>
                <option value="card">💳 Thẻ tín dụng / Ghi nợ</option>
                <option value="banking">🏦 Chuyển khoản ngân hàng</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-4 px-6 rounded-lg transition-all shadow-md hover:shadow-lg ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  `Xác nhận đặt hàng - ${total.toLocaleString()} VNĐ`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Bằng cách đặt hàng, bạn đồng ý với{" "}
                <Link href="/terms" className="text-amber-600 hover:underline">
                  Điều khoản dịch vụ
                </Link>{" "}
                của chúng tôi
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
