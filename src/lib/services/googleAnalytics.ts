// services/googleAnalytics.ts
import ReactGA from "react-ga4";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Lấy GA ID từ env
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "";

// Khởi tạo GA nếu chạy trên trình duyệt
if (typeof window !== "undefined" && GA_MEASUREMENT_ID) {
  ReactGA.initialize(GA_MEASUREMENT_ID);
}

// services/googleAnalytics.ts
export const trackAddToCart = (item: any, quantity = 1) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "add_to_cart",
    ecommerce: {
      items: [{ ...item, quantity }],
    },
  });
};

export const trackRemoveFromCart = (item: any) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "remove_from_cart",
    ecommerce: { items: [item] },
  });
};

export const trackUpdateCart = (item: any, quantity: number) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "update_cart",
    ecommerce: { items: [{ ...item, quantity }] },
  });
};

export const trackViewItem = (item: any) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "view_item",
    ecommerce: { items: [item] },
  });
};

export const trackLogin = () => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "login" });
};

export const trackBeginCheckout = (checkoutData: any) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "begin_checkout",
    ...checkoutData,
  });
};
