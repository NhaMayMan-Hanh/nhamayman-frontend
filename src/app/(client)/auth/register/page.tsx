import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký - NhaMayMan-Hanh",
  description: "Tạo tài khoản mới để trải nghiệm mua sắm tốt hơn.",
};

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Đăng ký</h1>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Họ và tên"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Đăng ký
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-amber-500 hover:underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}
