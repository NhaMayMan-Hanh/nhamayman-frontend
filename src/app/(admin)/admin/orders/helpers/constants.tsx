// constants.ts
import { OrderStatus, PaymentMethod, OrderAction } from "../types";
import {
   AlertCircle,
   CheckCircle2,
   Truck,
   Package,
   XCircle,
   LucideIcon,
} from "lucide-react";

export const STATUS_CONFIG: Record<
   OrderStatus,
   {
      label: string;
      color: string;
      bg: string;
      icon: LucideIcon;
   }
> = {
   pending: {
      label: "Chờ xác nhận",
      color: "text-amber-700 bg-amber-100",
      bg: "bg-amber-100",
      icon: AlertCircle,
   },
   confirmed: {
      label: "Đã xác nhận",
      color: "text-blue-700 bg-blue-100",
      bg: "bg-blue-100",
      icon: CheckCircle2,
   },
   shipped: {
      label: "Đang giao",
      color: "text-purple-700 bg-purple-100",
      bg: "bg-purple-100",
      icon: Truck,
   },
   delivered: {
      label: "Đã giao",
      color: "text-green-700 bg-green-100",
      bg: "bg-green-100",
      icon: Package,
   },
   cancelled: {
      label: "Đã hủy",
      color: "text-red-700 bg-red-100",
      bg: "bg-red-100",
      icon: XCircle,
   },
};

// Payment methods
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
   cod: "Thanh toán khi nhận hàng (COD)",
   online: "Thanh toán online",
   chuyen_khoan: "Chuyển khoản ngân hàng",
};

// Action to status mapping
export const STATUS_ACTION_MAP: Record<OrderAction, OrderStatus> = {
   confirm: "confirmed",
   ship: "shipped",
   deliver: "delivered",
   cancel: "cancelled",
};

// Action messages for toast notifications
export const ACTION_MESSAGES: Record<
   OrderAction,
   {
      loading: string;
      success: string;
      error: string;
   }
> = {
   confirm: {
      loading: "Đang xác nhận đơn hàng...",
      success: "Xác nhận đơn hàng thành công!",
      error: "Xác nhận đơn hàng thất bại",
   },
   ship: {
      loading: "Đang cập nhật trạng thái giao hàng...",
      success: "Đã chuyển sang trạng thái đang giao!",
      error: "Cập nhật trạng thái thất bại",
   },
   deliver: {
      loading: "Đang cập nhật trạng thái giao hàng...",
      success: "Đơn hàng đã được giao thành công!",
      error: "Cập nhật trạng thái thất bại",
   },
   cancel: {
      loading: "Đang hủy đơn hàng...",
      success: "Đã hủy đơn hàng",
      error: "Hủy đơn hàng thất bại",
   },
};

// Status flow order (for reference)
export const STATUS_FLOW: OrderStatus[] = [
   "pending",
   "confirmed",
   "shipped",
   "delivered",
   "cancelled",
];

export const STATUS_UPDATE_MESSAGES: Record<OrderStatus, string> = {
   pending: "Đã chuyển về trạng thái chờ xác nhận",
   confirmed: "Đã xác nhận đơn hàng thành công!",
   shipped: "Đơn hàng đang được giao!",
   delivered: "Đơn hàng đã được giao thành công!",
   cancelled: "Đã hủy đơn hàng",
};
