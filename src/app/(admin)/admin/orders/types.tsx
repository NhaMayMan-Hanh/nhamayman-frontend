// types/order.ts

export interface Product {
   _id: string;
   name: string;
   description: string;
   price: number;
   category: string;
   image: string;
   stock: number;
}

export interface OrderItem {
   productId:
      | string
      | { _id: string; name: string; price: number; image: string }
      | null;
   quantity: number;
   price: number;
   _id: string;
   productDetails?: Product | null;
}

export interface ShippingAddress {
   fullName: string;
   phone: string;
   address: string;
   city: string;
   country: string;
}

export type OrderStatus =
   | "pending"
   | "confirmed"
   | "shipped"
   | "delivered"
   | "cancelled";
export type PaymentMethod = "cod" | "online" | "chuyen_khoan";

export interface Order {
   _id: string;
   userId: string;
   items: OrderItem[];
   total: number;
   status: OrderStatus;
   paymentMethod: PaymentMethod;
   shippingAddress: ShippingAddress;
   createdAt: string;
   updatedAt: string;
}

export interface ApiResponse<T = any> {
   success: boolean;
   data: T;
   message?: string;
}

// Utility types
export type OrderAction = "confirm" | "ship" | "deliver" | "cancel" | "delete";
export interface OrderActionModal {
   orderId: string;
   action: OrderAction;
   currentStatus: OrderStatus;
}
