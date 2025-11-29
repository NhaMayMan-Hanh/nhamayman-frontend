import type { CartItem } from "@app/(client)/checkout/type";

interface CheckoutSummaryProps {
  items: CartItem[];
  total: number;
  onConfirm: () => void;
  loading?: boolean;
}

export default function CheckoutSummary({
  items,
  total,
  onConfirm,
  loading,
}: CheckoutSummaryProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
      <h3 className="text-xl font-bold mb-5">Tóm tắt đơn hàng</h3>

      <div className="max-h-64 overflow-y-auto space-y-3 mb-5 border-b pb-5">
        {items.map((item) => (
          <div key={item._id} className="flex justify-between text-sm">
            <span className="text-gray-700">
              {item.ten_sp} × {item.so_luong}
            </span>
            <span className="font-medium">{(item.gia_mua * item.so_luong).toLocaleString()}₫</span>
          </div>
        ))}
      </div>

      <div className="space-y-3 text-lg">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span className="font-semibold">{total.toLocaleString()}₫</span>
        </div>
        <div className="flex justify-between text-orange-600">
          <span>Phí vận chuyển</span>
          <span className="font-bold">Miễn phí</span>
        </div>
        <div className="pt-4 border-t-2 border-orange-200 flex justify-between text-xl font-bold">
          <span>Tổng cộng</span>
          <span className="text-orange-600">{total.toLocaleString()}₫</span>
        </div>
      </div>

      <button
        onClick={onConfirm}
        disabled={loading}
        className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-all disabled:opacity-60"
      >
        {loading ? "Đang xử lý..." : "Hoàn tất đặt hàng"}
      </button>
    </div>
  );
}
