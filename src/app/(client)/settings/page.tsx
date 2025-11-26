"use client";

import { useState } from "react";
import { useAuth } from "@contexts/AuthContext";
import ProfileSidebar from "@components/client/profile/ProfileSidebar";
import toast from "react-hot-toast";
import router from "next/router";

export default function SettingsPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (formData.newPassword !== formData.confirmNewPassword) {
      setErrors({ confirmNewPassword: "Mật khẩu mới không khớp" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/auth/change-password`, {
        // Placeholder endpoint
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors) {
          setErrors(
            data.errors.reduce((acc: any, err: any) => {
              acc[err.field] = err.message;
              return acc;
            }, {})
          );
          toast.error(data.message || "Thay đổi mật khẩu thất bại");
          return;
        }
        throw new Error(data.message || "Thay đổi mật khẩu thất bại");
      }

      toast.success("Thay đổi mật khẩu thành công");
      setFormData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-center text-red-500">Vui lòng đăng nhập để truy cập cài đặt.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Menu */}
          <ProfileSidebar activePath="/settings" />

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Cài đặt tài khoản</h2>

              {/* Password Change Form */}
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  {errors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={formData.confirmNewPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmNewPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  {errors.confirmNewPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmNewPassword}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Đang cập nhật..." : "Thay đổi mật khẩu"}
                  </button>
                </div>
              </form>

              {/* Other Settings (placeholder) */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Thông báo</h3>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Nhận email khuyến mãi</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
