// src/components/client/checkout/AddressForm.tsx
"use client";

import { ChevronDown } from "lucide-react";
import { useVietnamAddress } from "@hooks/useVietnamAddress";
import { useEffect } from "react";

interface AddressFormProps {
  form: any;
  setForm: (updater: (prev: any) => any) => void;
  selectedProvince: number | null;
  setSelectedProvince: (code: number | null) => void;
  selectedDistrict: number | null;
  setSelectedDistrict: (code: number | null) => void;
  selectedWard: number | null;
  setSelectedWard: (code: number | null) => void;
}

export default function AddressForm({
  form,
  setForm,
  selectedProvince,
  setSelectedProvince,
  selectedDistrict,
  setSelectedDistrict,
  selectedWard,
  setSelectedWard,
}: AddressFormProps) {
  const { provinces, districts, wards, loading, loadDistricts, loadWards } = useVietnamAddress();

  // THÊM HÀM updateField VÀO ĐÂY!!!
  const updateField = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  // Tự động chọn tỉnh từ form.tinh_thanh
  useEffect(() => {
    if (!form.tinh_thanh || provinces.length === 0) return;

    const cleanName = form.tinh_thanh.replace(/^(Tỉnh|Thành phố)\s+/i, "");
    const matched = provinces.find((p) => p.name === cleanName || p.name === form.tinh_thanh);

    if (matched && selectedProvince !== matched.code) {
      setSelectedProvince(matched.code);
      loadDistricts(matched.code);
    }
  }, [form.tinh_thanh, provinces]);

  // Tự động chọn quận/huyện
  useEffect(() => {
    if (!form.quan_huyen || districts.length === 0) return;

    const matched = districts.find((d) => d.name === form.quan_huyen);
    if (matched && selectedDistrict !== matched.code) {
      setSelectedDistrict(matched.code);
      loadWards(matched.code);
    }
  }, [form.quan_huyen, districts]);

  // Tự động chọn phường/xã
  useEffect(() => {
    if (!form.phuong_xa || wards.length === 0) return;

    const matched = wards.find((w) => w.name === form.phuong_xa);
    if (matched && selectedWard !== matched.code) {
      setSelectedWard(matched.code);
    }
  }, [form.phuong_xa, wards]);

  const handleProvinceChange = (code: number, name: string) => {
    setSelectedProvince(code);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setForm((prev) => ({
      ...prev,
      tinh_thanh: name,
      quan_huyen: "",
      phuong_xa: "",
    }));
    loadDistricts(code);
  };

  const handleDistrictChange = (code: number, name: string) => {
    setSelectedDistrict(code);
    setSelectedWard(null);
    setForm((prev) => ({ ...prev, quan_huyen: name, phuong_xa: "" }));
    loadWards(code);
  };

  const handleWardChange = (code: number, name: string) => {
    setSelectedWard(code);
    setForm((prev) => ({ ...prev, phuong_xa: name }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-orange-600 mb-6 border-b-2 border-orange-600 pb-3 inline-block">
        Thông tin giao hàng
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Họ tên */}
        <div>
          <label className="block font-semibold mb-2">Họ và tên *</label>
          <input
            type="text"
            value={form.ho_ten}
            onChange={(e) => updateField("ho_ten", e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 outline-none transition"
            placeholder="Nguyễn Văn A"
          />
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="block font-semibold mb-2">Số điện thoại *</label>
          <input
            type="tel"
            value={form.dien_thoai}
            onChange={(e) =>
              updateField("dien_thoai", e.target.value.replace(/\D/g, "").slice(0, 11))
            }
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 outline-none transition"
            placeholder="0901234567"
          />
        </div>

        {/* Email */}
        <div className="md:col-span-2">
          <label className="block font-semibold mb-2">Email (không bắt buộc)</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 outline-none transition"
            placeholder="email@example.com"
          />
        </div>

        {/* TỈNH/THÀNH */}
        <div className="relative">
          <label className="block font-semibold mb-2">Tỉnh/Thành phố *</label>
          <select
            value={selectedProvince || ""}
            onChange={(e) => {
              const code = Number(e.target.value);
              const p = provinces.find((x) => x.code === code);
              if (p) handleProvinceChange(code, p.name);
            }}
            disabled={loading}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 appearance-none focus:border-orange-600 outline-none bg-white"
          >
            <option value="">-- Chọn Tỉnh/Thành --</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-12 text-gray-400 pointer-events-none" />
        </div>

        {/* QUẬN/HUYỆN */}
        <div className="relative">
          <label className="block font-semibold mb-2">Quận/Huyện *</label>
          <select
            value={selectedDistrict || ""}
            onChange={(e) => {
              const code = Number(e.target.value);
              const d = districts.find((x) => x.code === code);
              if (d) handleDistrictChange(code, d.name);
            }}
            disabled={!selectedProvince || loading}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 appearance-none focus:border-orange-600 outline-none bg-white"
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
          <ChevronDown className="absolute right-3 top-12 text-gray-400 pointer-events-none" />
        </div>

        {/* PHƯỜNG/XÃ */}
        <div className="relative">
          <label className="block font-semibold mb-2">Phường/Xã *</label>
          <select
            value={selectedWard || ""}
            onChange={(e) => {
              const code = Number(e.target.value);
              const w = wards.find((x) => x.code === code);
              if (w) handleWardChange(code, w.name);
            }}
            disabled={!selectedDistrict || loading}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 appearance-none focus:border-orange-600 outline-none bg-white"
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
          <ChevronDown className="absolute right-3 top-12 text-gray-400 pointer-events-none" />
        </div>

        {/* Địa chỉ chi tiết */}
        <div>
          <label className="block font-semibold mb-2">Số nhà, đường *</label>
          <input
            type="text"
            value={form.dia_chi_chi_tiet}
            onChange={(e) => updateField("dia_chi_chi_tiet", e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 outline-none transition"
            placeholder="123 Nguyễn Huệ"
          />
        </div>

        {/* Ghi chú */}
        <div className="md:col-span-2">
          <label className="block font-semibold mb-2">Ghi chú đơn hàng</label>
          <textarea
            rows={3}
            value={form.ghi_chu}
            onChange={(e) => updateField("ghi_chu", e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-600 outline-none transition resize-none"
            placeholder="Giao giờ hành chính, để trước cửa..."
          />
        </div>
      </div>

      {/* Preview địa chỉ */}
      {(form.dia_chi_chi_tiet || form.phuong_xa || form.quan_huyen || form.tinh_thanh) && (
        <div className="mt-6 p-4 bg-orange-50 border border-orange-300 rounded-xl">
          <p className="font-medium text-orange-900">Địa chỉ giao hàng:</p>
          <p className="font-bold text-orange-800">
            {[form.dia_chi_chi_tiet, form.phuong_xa, form.quan_huyen, form.tinh_thanh]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
