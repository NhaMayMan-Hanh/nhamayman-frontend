"use client";

import { useState } from "react";
import { useAuth } from "@contexts/AuthContext";
import ProfileSidebar from "@components/client/profile/ProfileSidebar";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Bell, Shield, Trash2 } from "lucide-react";
import { LoadingPage } from "@components/ui/Loading";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"security" | "notifications" | "privacy">("security");

  // Password Form
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailPromo: true,
    emailOrder: true,
    pushOrder: false,
  });

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
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors && Array.isArray(data.errors)) {
          const fieldErrors: { [key: string]: string } = {};
          data.errors.forEach((err: { field: string; message: string }) => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
          toast.error(data.message || "Thay đổi mật khẩu thất bại");
          return;
        }
        throw new Error(data.message || "Thay đổi mật khẩu thất bại");
      }

      toast.success("Thay đổi mật khẩu thành công 🎉");
      setFormData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
    toast.success("Cài đặt đã được cập nhật");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingPage message="Đang tải trang..." />
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
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header */}
              <div className="border-b border-gray-200 bg-linear-to-r from-amber-50 to-orange-50 px-6 py-5">
                <h2 className="text-2xl font-bold text-gray-900">Cài đặt tài khoản</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Quản lý thông tin bảo mật và tùy chọn của bạn
                </p>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex space-x-1 px-6">
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 border-gray-200 transition-colors ${
                      activeTab === "security"
                        ? "border-amber-500 text-amber-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Lock size={18} />
                    Bảo mật
                  </button>
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 border-gray-200 transition-colors ${
                      activeTab === "notifications"
                        ? "border-amber-500 text-amber-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Bell size={18} />
                    Thông báo
                  </button>
                  <button
                    onClick={() => setActiveTab("privacy")}
                    className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 border-gray-200 transition-colors ${
                      activeTab === "privacy"
                        ? "border-amber-500 text-amber-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Shield size={18} />
                    Quyền riêng tư
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Security Tab */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Lock size={20} className="text-amber-600" />
                        Thay đổi mật khẩu
                      </h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                          💡 <strong>Lưu ý:</strong> Mật khẩu mới phải có ít nhất 6 ký tự và khác
                          với mật khẩu hiện tại.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Mật khẩu hiện tại <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            value={formData.currentPassword}
                            onChange={(e) =>
                              setFormData({ ...formData, currentPassword: e.target.value })
                            }
                            className={`w-full pr-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                              errors.currentPassword ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="Nhập mật khẩu hiện tại"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords({
                                ...showPasswords,
                                current: !showPasswords.current,
                              })
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {errors.currentPassword && (
                          <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                        )}
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            value={formData.newPassword}
                            onChange={(e) =>
                              setFormData({ ...formData, newPassword: e.target.value })
                            }
                            className={`w-full pr-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                              errors.newPassword ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords({
                                ...showPasswords,
                                new: !showPasswords.new,
                              })
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {errors.newPassword && (
                          <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                        )}
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={formData.confirmNewPassword}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                confirmNewPassword: e.target.value,
                              })
                            }
                            className={`w-full pr-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                              errors.confirmNewPassword ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="Nhập lại mật khẩu mới"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords({
                                ...showPasswords,
                                confirm: !showPasswords.confirm,
                              })
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {errors.confirmNewPassword && (
                          <p className="text-red-500 text-sm mt-1">{errors.confirmNewPassword}</p>
                        )}
                      </div>

                      {/* Buttons */}
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => router.back()}
                          className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handlePasswordChange}
                          disabled={loading}
                          className={`px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium ${
                            loading ? "opacity-70 cursor-not-allowed" : ""
                          }`}
                        >
                          {loading ? "Đang cập nhật..." : "Thay đổi mật khẩu"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Bell size={20} className="text-amber-600" />
                        Cài đặt thông báo
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Quản lý cách bạn nhận thông báo từ chúng tôi
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Email Notifications */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Email</h4>
                        <div className="space-y-3">
                          <label className="flex items-center justify-between cursor-pointer group">
                            <div>
                              <p className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors">
                                Khuyến mãi & Tin tức
                              </p>
                              <p className="text-sm text-gray-500">
                                Nhận email về các chương trình ưu đãi đặc biệt
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={notifications.emailPromo}
                              onChange={() => handleNotificationChange("emailPromo")}
                              className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                            />
                          </label>
                          <label className="flex items-center justify-between cursor-pointer group">
                            <div>
                              <p className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors">
                                Trạng thái đơn hàng
                              </p>
                              <p className="text-sm text-gray-500">
                                Nhận thông báo về đơn hàng của bạn
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={notifications.emailOrder}
                              onChange={() => handleNotificationChange("emailOrder")}
                              className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Push Notifications */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Push Notifications</h4>
                        <label className="flex items-center justify-between cursor-pointer group">
                          <div>
                            <p className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors">
                              Cập nhật đơn hàng
                            </p>
                            <p className="text-sm text-gray-500">
                              Nhận thông báo trực tiếp trên thiết bị
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifications.pushOrder}
                            onChange={() => handleNotificationChange("pushOrder")}
                            className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === "privacy" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Shield size={20} className="text-amber-600" />
                        Quyền riêng tư & Bảo mật
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Kiểm soát thông tin cá nhân của bạn
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Account Info */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Thông tin tài khoản</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-2 border-b border-gray-300">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{user.email}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-300">
                            <span className="text-gray-600">Tên đăng nhập:</span>
                            <span className="font-medium">{user.username}</span>
                          </div>
                          {/* <div className="flex justify-between py-2">
                            <span className="text-gray-600">Ngày tạo:</span>
                            <span className="font-medium">
                              {new Date(user.createdAt || "").toLocaleDateString("vi-VN")}
                            </span>
                          </div> */}
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                          <Trash2 size={18} />
                          Vùng nguy hiểm
                        </h4>
                        <p className="text-sm text-red-600 mb-4">
                          Sau khi xóa tài khoản, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn và không
                          thể khôi phục.
                        </p>
                        <button
                          onClick={() => toast.error("Tính năng đang phát triển")}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Xóa tài khoản
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
