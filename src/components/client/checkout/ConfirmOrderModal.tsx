import type { CartItem } from "@app/(client)/checkout/type";

interface ConfirmOrderModalProps {
  open: boolean;
  onClose: () => void;
  form: any;
  items: CartItem[];
  total: number;
  onConfirm: () => void;
  loading?: boolean;
}

export default function ConfirmOrderModal({
  open,
  onClose,
  form,
  items,
  total,
  onConfirm,
  loading,
}: ConfirmOrderModalProps) {
  if (!open) return null;

  const fullAddress = [form.dia_chi_chi_tiet, form.phuong_xa, form.quan_huyen, form.tinh_thanh]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold text-orange-600 mb-6 text-center">Xác nhận đơn hàng</h2>

        <div className="space-y-4 text-gray-700">
          <div>
            <span className="font-semibold">Họ tên:</span> {form.ho_ten}
          </div>
          <div>
            <span className="font-semibold">SĐT:</span> {form.dien_thoai}
          </div>
          <div>
            <span className="font-semibold">Địa chỉ:</span> {fullAddress}
          </div>
          <div>
            <span className="font-semibold">Phương thức:</span>{" "}
            {form.phuong_thuc === "cod" ? "Thanh toán khi nhận hàng" : form.phuong_thuc}
          </div>
          <div className="pt-4 border-t-2 border-orange-100">
            <div className="flex justify-between text-xl font-bold">
              <span>Tổng tiền:</span>
              <span className="text-orange-600">{total.toLocaleString()}₫</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition disabled:opacity-60"
          >
            {loading ? "Đang gửi..." : "Xác nhận đặt hàng"}
          </button>
        </div>
      </div>
    </div>
  );
}
