"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@contexts/AuthContext";
import Image from "next/image";
import toast from "react-hot-toast";
import ProfileSidebar from "@components/client/profile/ProfileSidebar";
import type { UserProfile, Province, District, Ward } from "./type";
import { LoadingPage } from "@components/ui/Loading";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false); // Dùng chung cho load tỉnh/huyện

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedWard, setSelectedWard] = useState<number | null>(null);

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

  // === LẤY THÔNG TIN PROFILE ===
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/users/profile`, {
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
            name: data.data.name || "",
            username: data.data.username || "",
            email: data.data.email || "",
            phone: data.data.phone || "",
            address: {
              tinh_thanh: data.data.address?.tinh_thanh || "",
              quan_huyen: data.data.address?.quan_huyen || "",
              phuong_xa: data.data.address?.phuong_xa || "",
              dia_chi_chi_tiet: data.data.address?.dia_chi_chi_tiet || "",
            },
          });

          // Tự động chọn tỉnh/huyện/phường nếu đã có dữ liệu
          if (data.data.address?.tinh_thanh) {
            const province = provinces.find((p) => p.name === data.data.address.tinh_thanh);
            if (province) setSelectedProvince(province.code);
          }
        }
      } catch (error) {
        toast.error("Không thể tải thông tin cá nhân");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, provinces]);

  // === LOAD TỈNH/THÀNH ===
  useEffect(() => {
    const loadProvinces = async () => {
      const cached = localStorage.getItem("vn_provinces");
      if (cached) {
        const data = JSON.parse(cached);
        setProvinces(data);
        return;
      }

      try {
        setApiLoading(true);
        const response = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await response.json();
        setProvinces(data);
        localStorage.setItem("vn_provinces", JSON.stringify(data));
      } catch (error) {
        console.error("Error loading provinces:", error);
        toast.error("Không tải được danh sách tỉnh/thành");
      } finally {
        setApiLoading(false);
      }
    };

    loadProvinces();
  }, []);

  // === LOAD QUẬN/HUYỆN ===
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setSelectedDistrict(null);
      return;
    }

    const loadDistricts = async () => {
      try {
        setApiLoading(true);
        const response = await fetch(
          `https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`
        );
        const data = await response.json();
        setDistricts(data.districts || []);

        // Nếu có địa chỉ cũ → tự động chọn quận
        if (formData.address.quan_huyen) {
          const district = data.districts?.find(
            (d: District) => d.name === formData.address.quan_huyen
          );
          if (district) setSelectedDistrict(district.code);
        }
      } catch (error) {
        console.error("Error loading districts:", error);
      } finally {
        setApiLoading(false);
      }
    };

    loadDistricts();
  }, [selectedProvince, formData.address.quan_huyen]);

  // === LOAD PHƯỜNG/XÃ ===
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard(null);
      return;
    }

    const loadWards = async () => {
      try {
        setApiLoading(true);
        const response = await fetch(
          `https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`
        );
        const data = await response.json();
        setWards(data.wards || []);

        // Tự động chọn phường nếu có
        if (formData.address.phuong_xa) {
          const ward = data.wards?.find((w: Ward) => w.name === formData.address.phuong_xa);
          if (ward) setSelectedWard(ward.code);
        }
      } catch (error) {
        console.error("Error loading wards:", error);
      } finally {
        setApiLoading(false);
      }
    };

    loadWards();
  }, [selectedDistrict, formData.address.phuong_xa]);

  // === XỬ LÝ THAY ĐỔI ĐỊA CHỈ ===
  const handleProvinceChange = (code: number, name: string) => {
    setSelectedProvince(code);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);

    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        tinh_thanh: name,
        quan_huyen: "",
        phuong_xa: "",
      },
    }));
  };

  const handleDistrictChange = (code: number, name: string) => {
    setSelectedDistrict(code);
    setSelectedWard(null);
    setWards([]);

    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        quan_huyen: name,
        phuong_xa: "",
      },
    }));
  };

  const handleWardChange = (code: number, name: string) => {
    setSelectedWard(code);
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, phuong_xa: name },
    }));
  };

  // === CẬP NHẬT PROFILE ===
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/users/profile`, {
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
        }
        toast.error(data.message || "Cập nhật thất bại");
        return;
      }

      toast.success("Cập nhật thông tin thành công!");
      setProfile(data.data);
      setEditing(false);
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingPage message="Đang tải trang..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">Không tìm thấy thông tin người dùng</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <ProfileSidebar activePath="/profile" />

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-6">Thông tin cá nhân</h2>

              <div className="flex justify-center mb-6">
                <Image
                  className="w-32 h-32 rounded-full object-cover border-4 border-amber-100"
                  src={profile.avatar || "/img/default-avatar.jpg"}
                  alt={profile.name}
                  width={128}
                  height={128}
                />
              </div>

              {editing ? (
                <form onSubmit={handleUpdate} className="space-y-6">
                  {/* Thông tin cơ bản */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Thông tin cá nhân</h3>
                    {["name", "username", "email", "phone"].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium mb-1 capitalize">
                          {field === "name"
                            ? "Họ và tên"
                            : field === "username"
                            ? "Tên đăng nhập"
                            : field === "email"
                            ? "Email"
                            : "Số điện thoại"}
                        </label>
                        <input
                          type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                          value={(formData as any)[field]}
                          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                            errors[field] ? "border-red-500" : "border-gray-300"
                          }`}
                          required={field !== "phone"}
                        />
                        {errors[field] && (
                          <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Địa chỉ */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Địa chỉ nhận hàng</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tỉnh/Thành */}
                      <div className="relative">
                        <label className="block text-sm font-medium mb-2">Tỉnh/Thành phố *</label>
                        <select
                          value={selectedProvince || ""}
                          onChange={(e) => {
                            const code = Number(e.target.value);
                            const province = provinces.find((p) => p.code === code);
                            if (province) handleProvinceChange(code, province.name);
                          }}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-amber-500 bg-white"
                          disabled={apiLoading}
                        >
                          <option value="">-- Chọn Tỉnh/Thành phố --</option>
                          {provinces.map((p) => (
                            <option key={p.code} value={p.code}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-10 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>

                      {/* Quận/Huyện */}
                      <div className="relative">
                        <label className="block text-sm font-medium mb-2">Quận/Huyện *</label>
                        <select
                          value={selectedDistrict || ""}
                          onChange={(e) => {
                            const code = Number(e.target.value);
                            const district = districts.find((d) => d.code === code);
                            if (district) handleDistrictChange(code, district.name);
                          }}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-amber-500 bg-white"
                          disabled={!selectedProvince || apiLoading}
                        >
                          <option value="">
                            {selectedProvince ? "-- Chọn Quận/Huyện --" : "-- Chọn Tỉnh trước --"}
                          </option>
                          {districts.map((d) => (
                            <option key={d.code} value={d.code}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-10 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>

                      {/* Phường/Xã */}
                      <div className="relative">
                        <label className="block text-sm font-medium mb-2">Phường/Xã *</label>
                        <select
                          value={selectedWard || ""}
                          onChange={(e) => {
                            const code = Number(e.target.value);
                            const ward = wards.find((w) => w.code === code);
                            if (ward) handleWardChange(code, ward.name);
                          }}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-amber-500 bg-white"
                          disabled={!selectedDistrict || apiLoading}
                        >
                          <option value="">
                            {selectedDistrict ? "-- Chọn Phường/Xã --" : "-- Chọn Quận trước --"}
                          </option>
                          {wards.map((w) => (
                            <option key={w.code} value={w.code}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-10 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>

                      {/* Địa chỉ chi tiết */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Số nhà, tên đường *
                        </label>
                        <input
                          type="text"
                          value={formData.address.dia_chi_chi_tiet}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              address: { ...prev.address, dia_chi_chi_tiet: e.target.value },
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                          placeholder="Ex: 123 Đường Láng"
                        />
                      </div>
                    </div>

                    {/* Preview địa chỉ */}
                    {(formData.address.dia_chi_chi_tiet ||
                      formData.address.phuong_xa ||
                      formData.address.quan_huyen ||
                      formData.address.tinh_thanh) && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm font-medium text-amber-800 mb-1">Địa chỉ đầy đủ:</p>
                        <p className="text-amber-900 font-medium">
                          {[
                            formData.address.dia_chi_chi_tiet,
                            formData.address.phuong_xa,
                            formData.address.quan_huyen,
                            formData.address.tinh_thanh,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Nút hành động */}
                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={updateLoading || apiLoading}
                      className="px-8 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-70 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                      {updateLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              ) : (
                /* View Mode */
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold border-b border-gray-200 pb-2 mb-4">
                      Thông tin cá nhân
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                      <p>
                        <strong>Họ tên:</strong> {profile.name}
                      </p>
                      <p>
                        <strong>Tài khoản:</strong> {profile.username}
                      </p>
                      <p>
                        <strong>Email:</strong> {profile.email}
                      </p>
                      <p>
                        <strong>Số điện thoại:</strong> {profile.phone || "Chưa cập nhật"}
                      </p>
                      <p>
                        <strong>Vai trò:</strong>{" "}
                        {profile.role === "admin" ? "Quản trị viên" : "Khách hàng"}
                      </p>
                      <p>
                        <strong>Tham gia:</strong>{" "}
                        {new Date(profile.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold border-b border-gray-200 pb-2 mb-4">
                      Địa chỉ nhận hàng mặc định
                    </h3>
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
                    className="px-8 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
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
