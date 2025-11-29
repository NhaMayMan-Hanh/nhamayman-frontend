import { ShoppingCart } from "lucide-react";

interface Props {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function AddToCartButton({ onClick, loading, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all
        ${
          disabled
            ? "bg-gray-300 text-gray-500"
            : "bg-amber-500 hover:bg-amber-600 text-white shadow-lg"
        }`}
    >
      {loading ? (
        <>Đang thêm...</>
      ) : (
        <>
          <ShoppingCart size={24} />
          Thêm vào giỏ hàng
        </>
      )}
    </button>
  );
}
