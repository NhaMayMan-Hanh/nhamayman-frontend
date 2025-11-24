"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@contexts/AuthContext";
import Image from "next/image";
import toast from "react-hot-toast";
import ProfileSidebar from "@components/client/profile/ProfileSidebar";

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  username: string;
  email: string;
  role: string;
  phone: string;
  address: {
    tinh_thanh: string;
    quan_huyen: string;
    phuong_xa: string;
    dia_chi_chi_tiet: string;
  };
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    address: {
      tinh_thanh: "",
      quan_huyen: "",
      phuong_xa: "",
      dia_chi_chi_tiet: "",
    },
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/client/users/profile", {
          credentials: "include",
        });
        if (!res.ok) {
          if (res.status === 401) {
            toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
            router.push("/login");
            return;
          }
          throw new Error("Lỗi khi lấy thông tin profile");
        }
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
          setFormData({
            name: data.data.name,
            username: data.data.username,
            email: data.data.email,
            phone: data.data.phone || "",
            address: {
              tinh_thanh: data.data.address?.tinh_thanh || "",
              quan_huyen: data.data.address?.quan_huyen || "",
              phuong_xa: data.data.address?.phuong_xa || "",
              dia_chi_chi_tiet: data.data.address?.dia_chi_chi_tiet || "",
            },
          });
        } else {
          throw new Error(data.message || "Lỗi không xác định");
        }
      } catch (error) {
        toast.error((error as Error).message);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setErrors({});

    try {
      const res = await fetch("http://localhost:5000/api/client/users/profile", {
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
          toast.error(data.message || "Cập nhật thất bại");
          return;
        }
        throw new Error(data.message || "Cập nhật thất bại");
      }

      toast.success("Cập nhật thành công");
      setProfile(data.data);
      setEditing(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (!profile) {
    return <div className="text-center py-8">Không tìm thấy thông tin</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Menu */}
          <ProfileSidebar activePath="/profile" />

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Thông tin cơ bản</h2>
              <Image
                className="w-32 h-32 rounded-full mx-auto mb-4"
                src={profile.avatar || "/img/default-avatar.jpg"}
                alt={profile.name}
                width={128}
                height={128}
              />
              {editing ? (
                <div onSubmit={handleUpdate}>
                  {/* Thông tin cơ bản */}
                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold border-b pb-2">Thông tin cá nhân</h3>

                    <div>
                      <label className="block text-sm font-medium mb-1">Họ và tên</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          errors.name ? "border-red-500" : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          errors.username ? "border-red-500" : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.username && (
                        <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="0901234567"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Địa chỉ */}
                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold border-b pb-2">Địa chỉ</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Tỉnh/Thành phố</label>
                        <input
                          type="text"
                          value={formData.address.tinh_thanh}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, tinh_thanh: e.target.value },
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="Hồ Chí Minh"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Quận/Huyện</label>
                        <input
                          type="text"
                          value={formData.address.quan_huyen}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, quan_huyen: e.target.value },
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="Quận 1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Phường/Xã</label>
                        <input
                          type="text"
                          value={formData.address.phuong_xa}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, phuong_xa: e.target.value },
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="Phường Bến Nghé"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Số nhà, đường</label>
                        <input
                          type="text"
                          value={formData.address.dia_chi_chi_tiet}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, dia_chi_chi_tiet: e.target.value },
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="123 Nguyễn Huệ"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdate}
                      disabled={updateLoading}
                      className={`px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors ${
                        updateLoading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {updateLoading ? "Đang cập nhật..." : "Cập nhật"}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Thông tin cơ bản - View Mode */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Thông tin cá nhân</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <p>
                        <strong>Tên:</strong> {profile.name}
                      </p>
                      <p>
                        <strong>Tài khoản:</strong> {profile.username}
                      </p>
                      <p>
                        <strong>Email:</strong> {profile.email}
                      </p>
                      <p>
                        <strong>Số điện thoại:</strong>{" "}
                        {profile.phone || <span className="text-gray-400">Chưa cập nhật</span>}
                      </p>
                      <p>
                        <strong>Role:</strong>{" "}
                        {profile.role === "admin" ? "Quản trị viên" : "Khách hàng"}
                      </p>
                      <p>
                        <strong>Tham gia:</strong>{" "}
                        {new Date(profile.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  {/* Địa chỉ - View Mode */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Địa chỉ</h3>
                    {profile.address?.tinh_thanh ? (
                      <p className="text-gray-700">
                        {profile.address.dia_chi_chi_tiet &&
                          `${profile.address.dia_chi_chi_tiet}, `}
                        {profile.address.phuong_xa && `${profile.address.phuong_xa}, `}
                        {profile.address.quan_huyen && `${profile.address.quan_huyen}, `}
                        {profile.address.tinh_thanh}
                      </p>
                    ) : (
                      <p className="text-gray-400 italic">Chưa cập nhật địa chỉ</p>
                    )}
                  </div>

                  <button
                    onClick={() => setEditing(true)}
                    className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    Chỉnh sửa hồ sơ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
