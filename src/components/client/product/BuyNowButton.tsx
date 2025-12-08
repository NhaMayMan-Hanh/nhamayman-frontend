// src/components/client/product/BuyNowButton.tsx
interface BuyNowButtonProps {
   onClick: () => void;
   disabled?: boolean;
}

export default function BuyNowButton({ onClick, disabled }: BuyNowButtonProps) {
   return (
      <button
         onClick={onClick}
         disabled={disabled}
         className={`w-full py-4 md:py-2 px-6 rounded-xl font-bold text-lg border-2 transition-all cursor-pointer
        ${
           disabled
              ? "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50"
              : "border-amber-500 text-amber-600 hover:bg-amber-50 hover:border-amber-600 hover:shadow-md"
        }`}
      >
         {disabled ? "Đang xử lý..." : "Mua ngay"}
      </button>
   );
}
