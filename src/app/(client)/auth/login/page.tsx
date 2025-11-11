import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập - NhaMayMan-Hanh",
  description: "Đăng nhập vào tài khoản để mua sắm và theo dõi đơn hàng.",
};

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Đăng nhập</h1>
        <form className="space-y-4">
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
            Đăng nhập
          </button>
        </form>
        <div className="mt-6 text-center space-y-2">
          <a href="/forgot" className="text-amber-500 hover:underline text-sm">
            Quên mật khẩu?
          </a>
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <a href="/register" className="text-amber-500 hover:underline">
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
