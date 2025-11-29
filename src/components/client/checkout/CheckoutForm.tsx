"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@contexts/AuthContext";
import toast from "react-hot-toast";
import apiRequest from "@lib/api/index";
import { createOrder } from "@services/orderService";
import AddressForm from "./AddressForm";
import PaymentMethod from "./PaymentMethod";
import CheckoutSummary from "./CheckoutSummary";
import ConfirmOrderModal from "./ConfirmOrderModal";
import type { CartItem } from "@app/(client)/checkout/type";

interface CheckoutFormProps {
  initialItems: CartItem[];
}

export default function CheckoutForm({ initialItems }: CheckoutFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [items] = useState<CartItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
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

  // THÊM 6 STATE NÀY!!!
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedWard, setSelectedWard] = useState<number | null>(null);

  const total = items.reduce((sum, i) => sum + i.gia_mua * i.so_luong, 0);

  // Load profile
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const res = await apiRequest.get<any>("/client/users/profile");
        if (res.success && res.data) {
          const u = res.data;
          const addr = u.address || {};
          setForm((prev) => ({
            ...prev,
            ho_ten: u.name || "",
            dien_thoai: u.phone || "",
            email: u.email || "",
            tinh_thanh: addr.tinh_thanh || "",
            quan_huyen: addr.quan_huyen || "",
            phuong_xa: addr.phuong_xa || "",
            dia_chi_chi_tiet: addr.dia_chi_chi_tiet || "",
          }));
        }
      } catch (err) {
        console.warn("Không tải được profile:", err);
      }
    };
    loadProfile();
  }, [user]);

  const handleConfirm = () => {
    const required = [
      "ho_ten",
      "dien_thoai",
      "tinh_thanh",
      "quan_huyen",
      "phuong_xa",
      "dia_chi_chi_tiet",
    ];
    const missing = required.find((f) => !form[f as keyof typeof form]?.trim());
    if (missing) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }
    if (!user) {
      localStorage.setItem("checkout_pending", "true");
      router.push("/login?redirect=/checkout");
      return;
    }
    setShowModal(true);
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const fullAddress = [form.dia_chi_chi_tiet, form.phuong_xa, form.quan_huyen, form.tinh_thanh]
        .filter(Boolean)
        .join(", ");

      await createOrder({
        items: items.map((i) => ({
          productId: i._id,
          quantity: i.so_luong,
          price: i.gia_mua,
        })),
        total,
        shippingAddress: {
          fullName: form.ho_ten,
          phone: form.dien_thoai,
          address: fullAddress,
          city: form.tinh_thanh,
          country: "Việt Nam",
        },
        paymentMethod: form.phuong_thuc,
        note: form.ghi_chu || undefined,
        email: form.email || undefined,
      });

      toast.success("Đặt hàng thành công!");
      localStorage.removeItem("checkout_items");
      router.push("/thanks");
    } catch (err: any) {
      toast.error(err.message || "Đặt hàng thất bại");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* TRUYỀN ĐỦ 8 PROPS VÀO ĐÂY */}
          <AddressForm
            form={form}
            setForm={setForm}
            selectedProvince={selectedProvince}
            setSelectedProvince={setSelectedProvince}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            selectedWard={selectedWard}
            setSelectedWard={setSelectedWard}
          />
          <PaymentMethod
            value={form.phuong_thuc}
            onChange={(v) => setForm((prev) => ({ ...prev, phuong_thuc: v }))}
          />
        </div>

        <div className="lg:col-span-1">
          <CheckoutSummary
            items={items}
            total={total}
            onConfirm={handleConfirm}
            loading={loading}
          />
        </div>
      </div>

      <ConfirmOrderModal
        open={showModal}
        onClose={() => setShowModal(false)}
        form={form}
        items={items}
        total={total}
        onConfirm={handlePlaceOrder}
        loading={loading}
      />
    </>
  );
}
