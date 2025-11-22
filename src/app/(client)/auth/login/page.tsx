"use client";

import { useState } from "react";
import { useAuth } from "@contexts/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("http://localhost:5000/api/client/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Handle specific errors từ Zod
        if (data.errors && Array.isArray(data.errors)) {
          const fieldErrors: { [key: string]: string } = {};
          data.errors.forEach((err: { field: string; message: string }) => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
          toast.error(data.message || "Đăng nhập thất bại");
          return;
        }
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      toast.success("Đăng nhập thành công 🎉");

      await login(data.data);

      setFormData({ username: "", password: "" });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Đăng nhập</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              errors.username ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full pr-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-lg transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link href="/auth/forgot" className="text-amber-500 hover:underline text-sm">
            Quên mật khẩu?
          </Link>
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link href="/auth/register" className="text-amber-500 hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
