// src/components/client/cart/EmptyCart.tsx
import Link from "next/link";

export default function EmptyCart() {
  return (
    <div className="max-w-6xl mx-auto py-20 text-center">
      <div className="bg-gray-50 rounded-3xl p-12 max-w-md mx-auto">
        <svg
          className="w-24 h-24 mx-auto text-gray-400 mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>

        <h1 className="text-3xl font-bold text-gray-800 mb-3">Giỏ hàng trống</h1>
        <p className="text-gray-600 mb-8">Bạn chưa chọn sản phẩm nào. Hãy khám phá ngay!</p>

        <Link
          href="/"
          className="inline-block px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition shadow-lg hover:shadow-xl"
        >
          Bắt đầu mua sắm
        </Link>
      </div>
    </div>
  );
}
