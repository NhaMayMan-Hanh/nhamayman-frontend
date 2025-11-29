import apiRequest from "@lib/api/index";
import toast from "react-hot-toast";

export interface CreateOrderData {
  items: { productId: string; quantity: number; price: number }[];
  total: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  paymentMethod: "cod" | "online" | "chuyen_khoan";
  note?: string;
  email?: string;
  discount?: number;
}

export const createOrder = async (data: CreateOrderData) => {
  const res = await apiRequest.post<{ success: boolean; data: any; message?: string }>(
    "/client/orders",
    data
  );

  if (!res.success) throw new Error(res.message || "Tạo đơn hàng thất bại");
  return res.data;
};
