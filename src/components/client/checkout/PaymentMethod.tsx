"use client";

interface PaymentMethodProps {
  value: "cod" | "online" | "chuyen_khoan";
  onChange: (value: "cod" | "online" | "chuyen_khoan") => void;
}

export default function PaymentMethod({ value, onChange }: PaymentMethodProps) {
  const methods = [
    { value: "cod" as const, label: "Thanh toán khi nhận hàng (COD)", available: true },
    { value: "online" as const, label: "Thanh toán qua Momo", available: false },
    { value: "chuyen_khoan" as const, label: "Chuyển khoản ngân hàng", available: false },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-orange-600 mb-6 border-b-2 border-orange-600 pb-3 inline-block">
        Phương thức thanh toán
      </h3>

      <div className="space-y-4">
        {methods.map((m) => (
          <label
            key={m.value}
            className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all
              ${
                value === m.value
                  ? "border-orange-600 bg-orange-50"
                  : "border-gray-200 hover:border-gray-300"
              }
              ${!m.available ? "opacity-60 cursor-not-allowed" : ""}
            `}
          >
            <input
              type="radio"
              name="payment"
              value={m.value}
              checked={value === m.value}
              onChange={() => m.available && onChange(m.value)}
              disabled={!m.available}
              className="w-5 h-5 text-orange-600"
            />
            <span className="ml-4 font-semibold text-lg">
              {m.label}
              {!m.available && <span className="text-sm text-gray-500 ml-2">(Sắp ra mắt)</span>}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
