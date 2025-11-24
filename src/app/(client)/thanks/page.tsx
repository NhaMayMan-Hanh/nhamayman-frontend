"use client";

import Link from "next/link";
import Image from "next/image";

export default function ThanksPage() {
  return (
    <div className="max-w-md mx-auto py-12 px-4 text-center">
      <Image
        src="/icon/thanks-icon.svg"
        alt="Cảm ơn bạn!"
        width={150}
        height={150}
        className="mx-auto mb-6"
      />
      <h1 className="text-3xl font-bold text-green-600 mb-4">Cảm ơn bạn!</h1>
      <p className="text-gray-600 mb-8">
        Đơn hàng của bạn đã được nhận. Chúng tôi sẽ xử lý và giao hàng sớm nhất.
      </p>
      <p className="text-sm text-gray-500 mb-8">Số đơn hàng sẽ được gửi qua email.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/"
          className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors text-center"
        >
          Về trang chủ
        </Link>
        <Link
          href="/orders"
          className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors text-center"
        >
          Xem đơn hàng
        </Link>
      </div>
    </div>
  );
}
