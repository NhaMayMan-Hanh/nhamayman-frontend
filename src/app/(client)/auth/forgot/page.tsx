import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quên mật khẩu - NhaMayMan-Hanh",
  description: "Khôi phục mật khẩu tài khoản của bạn.",
};

export default function ForgotPage() {
  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Quên mật khẩu</h1>
        <p className="text-center text-gray-600 mb-8">
          Nhập email để nhận liên kết khôi phục mật khẩu.
        </p>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email của bạn"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Gửi liên kết khôi phục
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Nhớ mật khẩu?{" "}
          <a href="/login" className="text-amber-500 hover:underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}
