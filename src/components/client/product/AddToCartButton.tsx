interface Props {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;
  disabled?: boolean;
}
export default function AddToCartButton({ onClick, loading, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full text-white text-sm md:text-base cursor-pointer py-4 px-2 md:px-4 rounded-lg transition-colors
        ${
          disabled
            ? "bg-gray-300 text-gray-500"
            : "bg-button-g hover:bg-amber-600 text-white shadow-lg"
        }`}
    >
      {loading ? <>Đang thêm...</> : <>Thêm vào giỏ hàng</>}
    </button>
  );
}
