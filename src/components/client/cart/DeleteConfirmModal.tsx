// src/components/client/cart/DeleteConfirmModal.tsx
"use client";

import { useState } from "react";

interface DeleteConfirmModalProps {
  open: boolean;
  mode: "single" | "selected" | "all";
  itemCount: number;
  itemId?: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>; // ← PHẢI LÀ HÀM, KHÔNG PHẢI ReactNode!!!
}

export default function DeleteConfirmModal({
  open,
  mode,
  itemCount,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm(); // ← gọi hàm async bình thường
    } finally {
      setDeleting(false);
    }
  };

  const title =
    mode === "single"
      ? "Bạn chắc muốn xóa sản phẩm này không?"
      : mode === "selected"
      ? `Xóa ${itemCount} sản phẩm đã chọn?`
      : "Xóa toàn bộ giỏ hàng?";

  return (
    <div className="fixed inset-0 bg-black/20  bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8">
        <div className="w-14 h-14 mx-auto mb-5 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-center mb-3">Xác nhận xóa</h3>
        <p className="text-center text-gray-600 mb-8">{title}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Đang xóa...
              </>
            ) : (
              "Xóa"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
