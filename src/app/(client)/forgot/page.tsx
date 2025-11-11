// app/(client)/forgot/page.tsx (Form forgot - static)
"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPage() {
  const [formData, setFormData] = useState({ email: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API /auth/forgot
    console.log("Forgot:", formData);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Quên mật khẩu</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email của bạn"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Gửi liên kết khôi phục
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Nhớ mật khẩu?{" "}
          <Link href="/login" className="text-amber-500 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
