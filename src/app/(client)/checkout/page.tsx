"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@contexts/CartContext";
import { useAuth } from "@contexts/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";

interface CartItem {
  _id: string;
  ten_sp: string;
  gia_mua: number;
  hinh: string;
  so_luong: number;
  giam_gia_sp?: number;
}

interface CheckoutData {
  success: boolean;
  data: any;
  message?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const { user } = useAuth();

  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [donhang, setDonhang] = useState({
    ho_ten: user?.name || "",
    dien_thoai: "",
    email: user?.email || "",
    tinh_thanh: "",
    quan_huyen: "",
    phuong_xa: "",
    dia_chi_chi_tiet: "",
    ghi_chu: "",
    phuong_thuc: "cod" as "cod" | "online" | "chuyen_khoan",
  });

  const [maGiamGia, setMaGiamGia] = useState("");
  const [giamGia, setGiamGia] = useState(0);
  const [phiVanChuyen] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // === LOAD GIỎ HÀNG ===
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
        (item) =>
          item._id &&
          item.ten_sp &&
          typeof item.gia_mua === "number" &&
          typeof item.so_luong === "number"
      );
      if (validItems.length === 0) throw new Error("Dữ liệu không hợp lệ");
      setCheckoutItems(validItems);
    } catch (err) {
      toast.error("Lỗi tải giỏ hàng. Vui lòng thử lại.");
      localStorage.removeItem("checkout_items");
      router.push("/cart");
    }
  }, [router]);

  // === TÍNH TOÁN ===
  const tongTien = checkoutItems.reduce((sum, sp) => {
    const gia = Number(sp.gia_mua) || 0;
    const sl = Number(sp.so_luong) || 0;
    return sum + gia * sl;
  }, 0);

  const tongTienFinal = Math.max(0, tongTien - giamGia + phiVanChuyen);

  // === VALIDATION ===
  const validateField = (field: keyof typeof donhang, value: string) => {
    const err: Record<string, string> = {};
    if (field === "ho_ten" && !value.trim()) err.ho_ten = "Vui lòng nhập họ tên";
    if (field === "dien_thoai" && !/^\d{10,11}$/.test(value))
      err.dien_thoai = "SĐT không hợp lệ (10-11 số)";
    if (field === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      err.email = "Email không hợp lệ";
    if (field === "tinh_thanh" && !value.trim()) err.tinh_thanh = "Nhập tỉnh/thành phố";
    if (field === "quan_huyen" && !value.trim()) err.quan_huyen = "Nhập quận/huyện";
    if (field === "phuong_xa" && !value.trim()) err.phuong_xa = "Nhập phường/xã";
    if (field === "dia_chi_chi_tiet" && !value.trim())
      err.dia_chi_chi_tiet = "Nhập số nhà, đường...";
    setErrors((prev) => ({ ...prev, ...err }));
    return Object.keys(err).length === 0;
  };

  const validateAll = () => {
    const required = [
      "ho_ten",
      "dien_thoai",
      "tinh_thanh",
      "quan_huyen",
      "phuong_xa",
      "dia_chi_chi_tiet",
    ] as const;
    let isValid = true;
    required.forEach((f) => {
      if (!validateField(f, donhang[f])) isValid = false;
    });
    return isValid;
  };

  // === MÃ GIẢM GIÁ ===
  const apDungMaGiamGia = () => {
    if (maGiamGia.trim().toUpperCase() === "GIAM10") {
      const discount = Math.floor(tongTien * 0.1);
      setGiamGia(discount);
      toast.success(`Giảm ${discount.toLocaleString()}₫ thành công!`);
    } else {
      toast.error("Mã giảm giá không hợp lệ");
    }
  };

  // === XÁC NHẬN ĐẶT HÀNG ===
  const moModalXacNhan = () => {
    if (!validateAll()) {
      toast.error("Vui lòng điền đầy đủ và đúng thông tin");
      return;
    }

    if (!user) {
      localStorage.setItem("checkout_pending", "true");
      router.push("/auth/login?redirect=/checkout");
      return;
    }

    setShowConfirmModal(true);
  };

  // === GỌI API THẬT: http://localhost:5000/api/client/orders ===
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

      const res = await fetch("http://localhost:5000/api/client/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data: CheckoutData = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Tạo đơn hàng thất bại");
      }

      toast.success("Đặt hàng thành công! Đơn hàng sẽ được xử lý sớm.");
      localStorage.removeItem("checkout_items");
      localStorage.removeItem("checkout_pending");
      clearCart();
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
        <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <>
      <div className="px-[9%] max-w-[100%] mx-auto py-8">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* === FORM === */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-6 text-orange-600">Hoàn tất đơn hàng</h3>

            {/* Thông tin khách hàng */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-5">
              <h5 className="text-lg font-bold text-gray-800 border-b-2 border-orange-600 pb-3 mb-5">
                Thông tin khách hàng
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Họ và tên *</label>
                  <input
                    type="text"
                    value={donhang.ho_ten}
                    onChange={(e) => setDonhang({ ...donhang, ho_ten: e.target.value })}
                    onBlur={() => validateField("ho_ten", donhang.ho_ten)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 focus:outline-none transition"
                    placeholder="Nguyễn Văn A"
                  />
                  {errors.ho_ten && <p className="text-red-500 text-sm mt-1">{errors.ho_ten}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Số điện thoại *</label>
                  <input
                    type="tel"
                    value={donhang.dien_thoai}
                    onChange={(e) => setDonhang({ ...donhang, dien_thoai: e.target.value })}
                    onBlur={() => validateField("dien_thoai", donhang.dien_thoai)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 focus:outline-none transition"
                    placeholder="0901234567"
                  />
                  {errors.dien_thoai && <p className="text-red-500 text-sm mt-1">{errors.dien_thoai}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-2">
                    Email <span className="text-gray-500 text-sm">(tùy chọn)</span>
                  </label>
                  <input
                    type="email"
                    value={donhang.email}
                    onChange={(e) => setDonhang({ ...donhang, email: e.target.value })}
                    onBlur={() => validateField("email", donhang.email)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 focus:outline-none transition"
                    placeholder="email@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* === ĐỊA CHỈ NHẬP TAY === */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Tỉnh/Thành phố *</label>
                  <input
                    type="text"
                    value={donhang.tinh_thanh}
                    onChange={(e) => setDonhang({ ...donhang, tinh_thanh: e.target.value })}
                    onBlur={() => validateField("tinh_thanh", donhang.tinh_thanh)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 focus:outline-none transition"
                    placeholder="Hà Nội"
                  />
                  {errors.tinh_thanh && <p className="text-red-500 text-sm mt-1">{errors.tinh_thanh}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Quận/Huyện *</label>
                  <input
                    type="text"
                    value={donhang.quan_huyen}
                    onChange={(e) => setDonhang({ ...donhang, quan_huyen: e.target.value })}
                    onBlur={() => validateField("quan_huyen", donhang.quan_huyen)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 focus:outline-none transition"
                    placeholder="Hoàn Kiếm"
                  />
                  {errors.quan_huyen && <p className="text-red-500 text-sm mt-1">{errors.quan_huyen}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Phường/Xã *</label>
                  <input
                    type="text"
                    value={donhang.phuong_xa}
                    onChange={(e) => setDonhang({ ...donhang, phuong_xa: e.target.value })}
                    onBlur={() => validateField("phuong_xa", donhang.phuong_xa)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 focus:outline-none transition"
                    placeholder="Hàng Bạc"
                  />
                  {errors.phuong_xa && <p className="text-red-500 text-sm mt-1">{errors.phuong_xa}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Số nhà, đường... *</label>
                  <input
                    type="text"
                    value={donhang.dia_chi_chi_tiet}
                    onChange={(e) => setDonhang({ ...donhang, dia_chi_chi_tiet: e.target.value })}
                    onBlur={() => validateField("dia_chi_chi_tiet", donhang.dia_chi_chi_tiet)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 focus:outline-none transition"
                    placeholder="123 Đường ABC"
                  />
                  {errors.dia_chi_chi_tiet && (
                    <p className="text-red-500 text-sm mt-1">{errors.dia_chi_chi_tiet}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-2">Ghi chú</label>
                  <textarea
                    value={donhang.ghi_chu}
                    onChange={(e) => setDonhang({ ...donhang, ghi_chu: e.target.value })}
                    rows={3}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 focus:outline-none transition"
                    placeholder="Giao giờ hành chính..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Mã giảm giá */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-5">
              <h5 className="text-lg font-bold text-gray-800 border-b-2 border-orange-600 pb-3 mb-5">
                Mã giảm giá
              </h5>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={maGiamGia}
                  onChange={(e) => setMaGiamGia(e.target.value)}
                  placeholder="Nhập mã"
                  className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 focus:outline-none transition"
                />
                <button
                  onClick={apDungMaGiamGia}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition"
                >
                  Áp dụng
                </button>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-5">
              <h5 className="text-lg font-bold text-gray-800 border-b-2 border-orange-600 pb-3 mb-5">
                Phương thức thanh toán
              </h5>
              <div className="space-y-3">
                {[
                  { value: "cod", label: "Thanh toán khi nhận hàng (COD)" },
                  { value: "online", label: "Momo" },
                  { value: "chuyen_khoan", label: "Chuyển khoản ngân hàng" },
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
                        setDonhang({ ...donhang, phuong_thuc: e.target.value as any })
                      }
                      className="w-5 h-5 text-orange-600"
                    />
                    <div className="ml-4">
                      <strong>{m.label}</strong>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Link href="/cart" className="text-orange-600 hover:underline font-semibold">
              Quay lại giỏ hàng
            </Link>
          </div>

          {/* === TÓM TẮT === */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h5 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h5>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {checkoutItems.map((sp) => (
                  <div
                    key={sp._id}
                    className="flex justify-between text-sm pb-3 border-b border-dashed"
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
              <div className="flex justify-between mb-3">
                <span className="text-gray-600">Giảm giá:</span>
                <span className="text-orange-600">-{giamGia.toLocaleString()}₫</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="text-orange-600">Miễn phí</span>
              </div>
              <div className="flex justify-between mb-6 text-lg font-bold">
                <span>Tổng cộng:</span>
                <span className="text-orange-600 text-xl">
                  {tongTienFinal.toLocaleString()}₫
                </span>
              </div>

              <button
                onClick={moModalXacNhan}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Hoàn tất thanh toán"}
              </button>
            </div>
          </div>
        </section>

        {/* === MODAL XÁC NHẬN === */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-orange-600 mb-4">Xác nhận đặt hàng</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Họ tên:</strong> {donhang.ho_ten}
                </p>
                <p>
                  <strong>SĐT:</strong> {donhang.dien_thoai}
                </p>
                <p>
                  <strong>Email:</strong> {donhang.email || "(Không có)"}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {donhang.dia_chi_chi_tiet}, {donhang.phuong_xa},{" "}
                  {donhang.quan_huyen}, {donhang.tinh_thanh}
                </p>
                <p className="mt-3 pt-3 border-t">
                  <strong>Tổng tiền: </strong>
                  <span className="text-xl text-orange-600">
                    {tongTienFinal.toLocaleString()}₫
                  </span>
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={xacNhanDatHang}
                  disabled={loading}
                  className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition disabled:opacity-50"
                >
                  {loading ? "Đang gửi..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}