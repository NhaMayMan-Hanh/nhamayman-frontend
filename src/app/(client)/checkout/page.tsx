"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@contexts/AuthContext";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CartItem, Province, District, Ward } from "./type";
import { LoadingPage } from "@components/ui/Loading";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  const [donhang, setDonhang] = useState({
    ho_ten: "",
    dien_thoai: "",
    email: "",
    tinh_thanh: "",
    quan_huyen: "",
    phuong_xa: "",
    dia_chi_chi_tiet: "",
    ghi_chu: "",
    phuong_thuc: "cod" as "cod" | "online" | "chuyen_khoan",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [giamGia, setGiamGia] = useState(0);

  // Address API
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedWard, setSelectedWard] = useState<number | null>(null);

  // Load items
  useEffect(() => {
    const saved = localStorage.getItem("checkout_items");
    if (!saved) {
      toast.error("Không có sản phẩm để thanh toán");
      router.push("/cart");
      return;
    }

    try {
      const items: CartItem[] = JSON.parse(saved);
      const validItems = items.filter(
        (i) => i._id && i.ten_sp && typeof i.gia_mua === "number" && typeof i.so_luong === "number"
      );
      if (validItems.length === 0) throw new Error();
      setCheckoutItems(validItems);
    } catch {
      toast.error("Lỗi tải giỏ hàng");
      localStorage.removeItem("checkout_items");
      router.push("/cart");
    }
  }, [router]);

  // Load provinces
  useEffect(() => {
    const loadProvinces = async () => {
      const cached = localStorage.getItem("vn_provinces");
      if (cached) {
        setProvinces(JSON.parse(cached));
        return;
      }

      try {
        setApiLoading(true);
        const res = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await res.json();
        setProvinces(data);
        localStorage.setItem("vn_provinces", JSON.stringify(data));
      } catch (err) {
        toast.error("Không tải được danh sách tỉnh/thành");
      } finally {
        setApiLoading(false);
      }
    };
    loadProvinces();
  }, []);

  // Load districts
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setSelectedDistrict(null);
      return;
    }

    const loadDistricts = async () => {
      try {
        setApiLoading(true);
        const res = await fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`);
        const data = await res.json();
        setDistricts(data.districts || []);

        // Tự động chọn quận nếu có trong donhang
        if (donhang.quan_huyen) {
          const district = data.districts?.find((d: District) => d.name === donhang.quan_huyen);
          if (district) setSelectedDistrict(district.code);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setApiLoading(false);
      }
    };
    loadDistricts();
  }, [selectedProvince, donhang.quan_huyen]);

  // Load wards
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      return;
    }

    const loadWards = async () => {
      try {
        setApiLoading(true);
        const res = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`);
        const data = await res.json();
        setWards(data.wards || []);

        if (donhang.phuong_xa) {
          const ward = data.wards?.find((w: Ward) => w.name === donhang.phuong_xa);
          if (ward) setSelectedWard(ward.code);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setApiLoading(false);
      }
    };
    loadWards();
  }, [selectedDistrict, donhang.phuong_xa]);

  // Load profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      setLoadingProfile(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/users/profile`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const u = data.data;
            setDonhang((prev) => ({
              ...prev,
              ho_ten: u.name || "",
              email: u.email || "",
              dien_thoai: u.phone || "",
              tinh_thanh: u.address?.tinh_thanh || "",
              quan_huyen: u.address?.quan_huyen || "",
              phuong_xa: u.address?.phuong_xa || "",
              dia_chi_chi_tiet: u.address?.dia_chi_chi_tiet || "",
            }));

            // Tự động chọn tỉnh nếu có
            if (u.address?.tinh_thanh && provinces.length > 0) {
              const province = provinces.find((p) => p.name === u.address.tinh_thanh);
              if (province) setSelectedProvince(province.code);
            }
          }
        }
      } catch (error) {
        console.error("Lỗi load profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    if (provinces.length > 0) fetchUserProfile();
  }, [user, provinces]);

  // Handle address change
  const handleProvinceChange = (code: number, name: string) => {
    setSelectedProvince(code);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDonhang((prev) => ({
      ...prev,
      tinh_thanh: name,
      quan_huyen: "",
      phuong_xa: "",
    }));
  };

  const handleDistrictChange = (code: number, name: string) => {
    setSelectedDistrict(code);
    setSelectedWard(null);
    setDonhang((prev) => ({
      ...prev,
      quan_huyen: name,
      phuong_xa: "",
    }));
  };

  const handleWardChange = (code: number, name: string) => {
    setSelectedWard(code);
    setDonhang((prev) => ({ ...prev, phuong_xa: name }));
  };

  // Validation
  const getError = (field: keyof typeof donhang): string => {
    if (!touched[field]) return "";
    const value = donhang[field];
    switch (field) {
      case "ho_ten":
        return !value.trim() ? "Vui lòng nhập họ tên" : "";
      case "dien_thoai":
        return !/^\d{10,11}$/.test(value) ? "SĐT không hợp lệ (10-11 số)" : "";
      case "email":
        return value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Email không hợp lệ" : "";
      case "tinh_thanh":
        return !value.trim() ? "Vui lòng chọn tỉnh/thành" : "";
      case "quan_huyen":
        return !value.trim() ? "Vui lòng chọn quận/huyện" : "";
      case "phuong_xa":
        return !value.trim() ? "Vui lòng chọn phường/xã" : "";
      case "dia_chi_chi_tiet":
        return !value.trim() ? "Vui lòng nhập số nhà, đường" : "";
      default:
        return "";
    }
  };

  const handleBlur = (field: keyof typeof donhang) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field: keyof typeof donhang, value: string) => {
    setDonhang((prev) => ({ ...prev, [field]: value }));
    if (touched[field] && value.trim()) {
      setTouched((prev) => ({ ...prev, [field]: false }));
    }
  };

  const validateAll = () => {
    const fields = [
      "ho_ten",
      "dien_thoai",
      "tinh_thanh",
      "quan_huyen",
      "phuong_xa",
      "dia_chi_chi_tiet",
    ] as const;
    const newTouched: Record<string, boolean> = {};
    fields.forEach((f) => (newTouched[f] = true));
    setTouched(newTouched);
    return fields.every((f) => !getError(f));
  };

  const tongTien = checkoutItems.reduce((sum, sp) => sum + sp.gia_mua * sp.so_luong, 0);
  const tongTienFinal = Math.max(0, tongTien - giamGia);

  const moModalXacNhan = () => {
    if (!validateAll()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (!user) {
      localStorage.setItem("checkout_pending", "true");
      router.push("/login?redirect=/checkout");
      return;
    }
    setShowConfirmModal(true);
  };

  const xacNhanDatHang = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const diaChiFull = `${donhang.dia_chi_chi_tiet}, ${donhang.phuong_xa}, ${donhang.quan_huyen}, ${donhang.tinh_thanh}`;

      const orderData = {
        items: checkoutItems.map((sp) => ({
          productId: sp._id,
          quantity: sp.so_luong,
          price: sp.gia_mua,
        })),
        total: tongTienFinal,
        shippingAddress: {
          fullName: donhang.ho_ten,
          phone: donhang.dien_thoai,
          address: diaChiFull,
          city: donhang.tinh_thanh,
          country: "Việt Nam",
        },
        paymentMethod: donhang.phuong_thuc,
        note: donhang.ghi_chu?.trim() || undefined,
        email: donhang.email?.trim() || undefined,
        discount: giamGia,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/orders`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Tạo đơn hàng thất bại");

      toast.success("Đặt hàng thành công!");
      localStorage.removeItem("checkout_items");
      localStorage.removeItem("checkout_pending");
      router.push("/thanks");
    } catch (err: any) {
      toast.error(err.message || "Lỗi hệ thống");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <LoadingPage message="Đang tải trang..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Gợi ý cập nhật profile nếu chưa có địa chỉ */}
      {user && !donhang.tinh_thanh && (
        <div className="mb-6 p-5 bg-blue-50 border border-blue-300 rounded-2xl text-center">
          <p className="text-blue-800 font-medium">
            Bạn chưa có địa chỉ mặc định.
            <Link href="/profile" className="underline font-bold ml-2">
              Cập nhật ngay tại đây
            </Link>{" "}
            để mua hàng nhanh hơn lần sau!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM */}
        <div className="lg:col-span-2 space-y-5">
          <h3 className="text-2xl font-bold text-orange-600">Thông tin đơn hàng</h3>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h5 className="text-lg font-bold text-gray-800 border-b-2 border-orange-600 pb-3 mb-5">
              Thông tin khách hàng
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Họ và tên *</label>
                <input
                  type="text"
                  value={donhang.ho_ten}
                  onChange={(e) => handleChange("ho_ten", e.target.value)}
                  onBlur={() => handleBlur("ho_ten")}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 focus:outline-none transition"
                  placeholder="Nguyễn Văn A"
                />
                {getError("ho_ten") && (
                  <p className="text-red-500 text-sm mt-1">{getError("ho_ten")}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Số điện thoại *</label>
                <input
                  type="tel"
                  value={donhang.dien_thoai}
                  onChange={(e) => handleChange("dien_thoai", e.target.value)}
                  onBlur={() => handleBlur("dien_thoai")}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 focus:outline-none transition"
                  placeholder="0901234567"
                />
                {getError("dien_thoai") && (
                  <p className="text-red-500 text-sm mt-1">{getError("dien_thoai")}</p>
                )}
              </div>

              {/* <div className="md:col-span-2">
                <label className="block font-semibold text-gray-700 mb-2">Email (tùy chọn)</label>
                <input
                  type="email"
                  value={donhang.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 focus:outline-none transition"
                  placeholder="email@example.com"
                />
                {getError("email") && (
                  <p className="text-red-500 text-sm mt-1">{getError("email")}</p>
                )}
              </div> */}

              {/* TỈNH/THÀNH */}
              <div className="relative">
                <label className="block font-semibold text-gray-700 mb-2">Tỉnh/Thành phố *</label>
                <select
                  value={selectedProvince || ""}
                  onChange={(e) => {
                    const code = Number(e.target.value);
                    const p = provinces.find((x) => x.code === code);
                    if (p) handleProvinceChange(code, p.name);
                  }}
                  onBlur={() => handleBlur("tinh_thanh")}
                  disabled={apiLoading}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 appearance-none focus:border-orange-600 focus:outline-none transition bg-white"
                >
                  <option value="">-- Chọn Tỉnh/Thành phố --</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-12 w-5 h-5 text-gray-400 pointer-events-none" />
                {getError("tinh_thanh") && (
                  <p className="text-red-500 text-sm mt-1">{getError("tinh_thanh")}</p>
                )}
              </div>

              {/* QUẬN/HUYỆN */}
              <div className="relative">
                <label className="block font-semibold text-gray-700 mb-2">Quận/Huyện *</label>
                <select
                  value={selectedDistrict || ""}
                  onChange={(e) => {
                    const code = Number(e.target.value);
                    const d = districts.find((x) => x.code === code);
                    if (d) handleDistrictChange(code, d.name);
                  }}
                  onBlur={() => handleBlur("quan_huyen")}
                  disabled={!selectedProvince || apiLoading}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 appearance-none focus:border-orange-600 focus:outline-none transition bg-white"
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
                <ChevronDown className="absolute right-3 top-12 w-5 h-5 text-gray-400 pointer-events-none" />
                {getError("quan_huyen") && (
                  <p className="text-red-500 text-sm mt-1">{getError("quan_huyen")}</p>
                )}
              </div>

              {/* PHƯỜNG/XÃ */}
              <div className="relative">
                <label className="block font-semibold text-gray-700 mb-2">Phường/Xã *</label>
                <select
                  value={selectedWard || ""}
                  onChange={(e) => {
                    const code = Number(e.target.value);
                    const w = wards.find((x) => x.code === code);
                    if (w) handleWardChange(code, w.name);
                  }}
                  onBlur={() => handleBlur("phuong_xa")}
                  disabled={!selectedDistrict || apiLoading}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 appearance-none focus:border-orange-600 focus:outline-none transition bg-white"
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
                <ChevronDown className="absolute right-3 top-12 w-5 h-5 text-gray-400 pointer-events-none" />
                {getError("phuong_xa") && (
                  <p className="text-red-500 text-sm mt-1">{getError("phuong_xa")}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Số nhà, tên đường *
                </label>
                <input
                  type="text"
                  value={donhang.dia_chi_chi_tiet}
                  onChange={(e) => handleChange("dia_chi_chi_tiet", e.target.value)}
                  onBlur={() => handleBlur("dia_chi_chi_tiet")}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 focus:outline-none transition"
                  placeholder="123 Nguyễn Huệ"
                />
                {getError("dia_chi_chi_tiet") && (
                  <p className="text-red-500 text-sm mt-1">{getError("dia_chi_chi_tiet")}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-gray-700 mb-2">Ghi chú</label>
                <textarea
                  value={donhang.ghi_chu}
                  onChange={(e) => handleChange("ghi_chu", e.target.value)}
                  rows={3}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 focus:outline-none transition"
                  placeholder="Giao giờ hành chính..."
                />
              </div>
            </div>

            {/* Preview địa chỉ */}
            {(donhang.dia_chi_chi_tiet ||
              donhang.phuong_xa ||
              donhang.quan_huyen ||
              donhang.tinh_thanh) && (
              <div className="mt-5 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <p className="font-medium text-orange-900">Địa chỉ giao hàng:</p>
                <p className="font-semibold text-orange-800">
                  {[
                    donhang.dia_chi_chi_tiet,
                    donhang.phuong_xa,
                    donhang.quan_huyen,
                    donhang.tinh_thanh,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* Phương thức thanh toán */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h5 className="text-lg font-bold text-gray-800 border-b-2 border-orange-600 pb-3 mb-5">
              Phương thức thanh toán
            </h5>
            <div className="space-y-3">
              {[
                {
                  value: "cod",
                  label: "Thanh toán khi nhận hàng (COD)",
                },
                { value: "online", label: "Momo", disabled: true },
                {
                  value: "chuyen_khoan",
                  label: "Chuyển khoản ngân hàng",
                  disabled: true,
                },
              ].map((m) => (
                <label
                  key={m.value}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${
                    donhang.phuong_thuc === m.value
                      ? "border-orange-600 bg-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="phuong_thuc"
                    value={m.value}
                    checked={donhang.phuong_thuc === m.value}
                    onChange={(e) =>
                      setDonhang({
                        ...donhang,
                        phuong_thuc: e.target.value as any,
                      })
                    }
                    disabled={m.disabled}
                    className="w-5 h-5 text-orange-600"
                  />
                  <span className={`ml-4 font-semibold ${m.disabled ? "text-gray-500" : ""}`}>
                    {m.label}
                    {m.disabled && <span className="ml-1">(đang phát triển)</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* TÓM TẮT */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <h5 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h5>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {checkoutItems.map((sp) => (
                <div
                  key={sp._id}
                  className="flex justify-between text-sm pb-3 border-b border-gray-300"
                >
                  <span className="text-gray-700">
                    {sp.ten_sp} x{sp.so_luong}
                  </span>
                  <span className="font-semibold">
                    {(sp.gia_mua * sp.so_luong).toLocaleString()}₫
                  </span>
                </div>
              ))}
            </div>
            <hr className="my-4" />
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Tạm tính:</span>
              <span className="font-semibold">{tongTien.toLocaleString()}₫</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Phí vận chuyển:</span>
              <span className="text-orange-600">Miễn phí</span>
            </div>
            <div className="flex justify-between mb-6 text-lg font-bold">
              <span>Tổng cộng:</span>
              <span className="text-orange-600 text-xl">{tongTienFinal.toLocaleString()}₫</span>
            </div>

            <button
              onClick={moModalXacNhan}
              disabled={loading || loadingProfile || apiLoading}
              className={`w-full py-4 rounded-lg font-bold transition-all shadow-lg
    ${
      loading || loadingProfile || apiLoading
        ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
        : "bg-button-g text-white cursor-pointer hover:bg-amber-600 hover:shadow-xl"
    }`}
            >
              {loading ? "Đang xử lý..." : "Hoàn tất thanh toán"}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL XÁC NHẬN */}
      {showConfirmModal && (
        <div className="fixed bg-black/40 inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-orange-600 mb-4">Xác nhận đặt hàng</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Họ tên:</strong> {donhang.ho_ten}
              </p>
              <p>
                <strong>SĐT:</strong> {donhang.dien_thoai}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {donhang.dia_chi_chi_tiet}, {donhang.phuong_xa},{" "}
                {donhang.quan_huyen}, {donhang.tinh_thanh}
              </p>
              <p className="mt-3 pt-3 border-t">
                <strong>Tổng tiền: </strong>
                <span className="text-xl text-orange-600">{tongTienFinal.toLocaleString()}₫</span>
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={xacNhanDatHang}
                disabled={loading}
                className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Đang gửi..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
