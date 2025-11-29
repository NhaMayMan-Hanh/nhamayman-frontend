"use client";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import CheckoutForm from "@components/client/checkout/CheckoutForm";
import type { CartItem } from "./type";

export default function CheckoutClient() {
  const [items, setItems] = useState<CartItem[] | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("checkout_items");

    if (!saved) {
      redirect("/cart");
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("Giỏ hàng trống");
      }
      setItems(parsed);
    } catch (error) {
      console.error("Lỗi parse giỏ hàng:", error);
      localStorage.removeItem("checkout_items");
      redirect("/cart");
    }
  }, []);

  // Trong lúc chờ load data → render layout giống hệt
  if (items === null) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8 text-orange-600">
            Thanh toán đơn hàng
          </h1>
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="mt-4 text-gray-600">Đang tải giỏ hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-orange-600">Thanh toán đơn hàng</h1>
        <CheckoutForm initialItems={items} />
      </div>
    </div>
  );
}
