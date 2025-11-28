"use client";

import { useCart } from "@contexts/CartContext";
import { useAuth } from "@contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, loading } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<"single" | "selected" | "all">("all");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (cart.length > 0 && selectedItems.length === 0) {
      setTimeout(() => {
        setSelectedItems(cart.map((item) => item._id));
      }, 0);
    }
  }, [cart.length]);

  if (loading || authLoading) {
    return (
      <div className="max-w-6xl min-h-screen mx-auto py-12 px-4">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Đang tải giỏ hàng...</span>
        </div>
      </div>
    );
  }

  // === GIỎ HÀNG TRỐNG ===
  if (cart.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 text-center">
        <div className="py-20">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h1 className="text-3xl font-bold mb-4">Giỏ hàng của bạn</h1>
          <p className="text-gray-600 mb-8">
            Giỏ hàng trống.{" "}
            <Link href="/" className="text-orange-500 hover:underline font-semibold">
              Tiếp tục mua sắm
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const total = cart
    .filter((item) => selectedItems.includes(item._id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const isAllSelected = cart.length > 0 && selectedItems.length === cart.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < cart.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item) => item._id));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleDeleteClick = (type: "single" | "selected" | "all", itemId?: string) => {
    setDeleteTarget(type);
    setItemToDelete(itemId || null);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget === "single" && itemToDelete) {
      await removeFromCart(itemToDelete);
      setSelectedItems((prev) => prev.filter((id) => id !== itemToDelete));
    } else if (deleteTarget === "selected") {
      for (const id of selectedItems) await removeFromCart(id);
      setSelectedItems([]);
    } else if (deleteTarget === "all") {
      await clearCart();
      setSelectedItems([]);
    }
    setShowDeleteConfirm(false);
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm!");
      return;
    }

    // Chuẩn hóa dữ liệu cho Checkout
    const selected = cart
      .filter((item) => selectedItems.includes(item._id))
      .map((item) => ({
        _id: item._id,
        ten_sp: item.name,
        gia_mua: item.price,
        hinh: item.image,
        so_luong: item.quantity,
        giam_gia_sp: 0,
      }));

    localStorage.setItem("checkout_items", JSON.stringify(selected));

    // Bắt đăng nhập nếu chưa có
    if (!user) {
      toast("Vui lòng đăng nhập để mua hàng.");
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 md:py-12 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Giỏ hàng của bạn</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Danh sách sản phẩm */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {/* Header checkbox và buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 md:p-4 bg-white rounded-lg shadow">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={handleSelectAll}
                className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 shrink-0"
              />
              <span className="font-medium text-gray-700 text-sm md:text-base">
                Chọn tất cả ({selectedItems.length}/{cart.length})
              </span>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {selectedItems.length > 0 && (
                <button
                  onClick={() => handleDeleteClick("selected")}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  Xóa đã chọn ({selectedItems.length})
                </button>
              )}
            </div>
          </div>

          {/* Cart Items */}
          {cart.map((item) => (
            <div
              key={item._id}
              className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-lg shadow transition-all ${
                selectedItems.includes(item._id) ? "ring-2 ring-orange-500" : "hover:shadow-md"
              }`}
            >
              {/* Checkbox và Image - Mobile layout */}
              <div className="flex items-start w-full sm:w-auto gap-3">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item._id)}
                  onChange={() => handleSelectItem(item._id)}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 flex-shrink-0 mt-1"
                />
                <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
                  <Image
                    width={100}
                    height={100}
                    src={item.image}
                    alt={item.name}
                    className="object-cover rounded-lg w-full h-full"
                  />
                </div>

                {/* Product Info - Mobile: bên cạnh image */}
                <div className="flex-1 min-w-0 sm:hidden">
                  <h3 className="font-semibold text-base text-gray-800 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-orange-600 font-bold text-base mt-1">
                    {item.price.toLocaleString()} VNĐ
                  </p>
                </div>
              </div>

              {/* Product Info - Desktop: chiếm full space giữa */}
              <div className="hidden sm:block flex-1 min-w-0 ml-0 sm:ml-4">
                <h3 className="font-semibold text-base md:text-lg text-gray-800 line-clamp-2">
                  {item.name}
                </h3>
                <p className="text-orange-600 font-bold text-base md:text-lg mt-1">
                  {item.price.toLocaleString()} VNĐ
                </p>
              </div>

              {/* Quantity Controls và Delete Button */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 md:gap-4 ml-0 sm:ml-auto">
                {/* Quantity Controls */}
                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    disabled={loading}
                    className="px-2 md:px-4 py-1.5 md:py-2 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50 font-medium text-gray-700 text-sm md:text-base"
                  >
                    −
                  </button>
                  <span className="px-3 md:px-6 py-1.5 md:py-2 font-semibold text-gray-800 bg-white min-w-[50px] md:min-w-[60px] text-center text-sm md:text-base">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    disabled={loading}
                    className="px-2 md:px-4 py-1.5 md:py-2 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50 font-medium text-gray-700 text-sm md:text-base"
                  >
                    +
                  </button>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteClick("single", item._id)}
                  disabled={loading}
                  className="p-1.5 md:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 group flex-shrink-0"
                  title="Xóa sản phẩm"
                >
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Tóm tắt đơn hàng</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Sản phẩm đã chọn:</span>
                <span className="font-medium">{selectedItems.length}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span className="font-medium">{total.toLocaleString()} VNĐ</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {total.toLocaleString()} VNĐ
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={selectedItems.length === 0 || loading}
              className={`w-full py-3 px-6 rounded-lg text-center font-semibold transition-all ${
                selectedItems.length > 0
                  ? "bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Tiến hành thanh toán
            </button>

            <Link
              href="/"
              className="block w-full mt-3 text-center text-orange-600 hover:text-orange-700 hover:underline font-medium"
            >
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>

      {/* Modal xác nhận xóa */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center mb-2 text-gray-800">Xác nhận xóa</h3>
            <p className="text-center text-gray-600 mb-6">
              {deleteTarget === "single"
                ? "Xóa sản phẩm này?"
                : deleteTarget === "selected"
                ? `Xóa ${selectedItems.length} sản phẩm?`
                : "Xóa toàn bộ giỏ hàng?"}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
