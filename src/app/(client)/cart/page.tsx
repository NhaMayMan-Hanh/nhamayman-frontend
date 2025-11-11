// app/(client)/cart/page.tsx (Trang cart - hiển thị items từ context)
"use client";

import { useCart } from "../../../contexts/CartContext";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Giỏ hàng của bạn</h1>
        <p className="text-gray-600 mb-8">
          Giỏ hàng trống.{" "}
          <Link href="/" className="text-amber-500 hover:underline">
            Tiếp tục mua sắm
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>
      <div className="space-y-4 mb-8">
        {cart.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
          >
            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1 ml-4">
              <h3 className="font-semibold">{item.name}</h3>
              <p>{item.price.toLocaleString()} VNĐ</p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
            </div>
            <button onClick={() => removeFromCart(item._id)} className="text-red-500 ml-4">
              Xóa
            </button>
          </div>
        ))}
      </div>
      <div className="text-right">
        <p className="text-xl font-bold">Tổng: {total.toLocaleString()} VNĐ</p>
        <Link
          href="/checkout" // Page checkout sau
          className="block mt-4 bg-amber-500 text-white py-3 px-6 rounded-lg hover:bg-amber-600 transition-colors text-center"
        >
          Thanh toán
        </Link>
      </div>
    </div>
  );
}
