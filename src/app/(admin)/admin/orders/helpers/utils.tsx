// utils.ts
import { useState, useMemo, useCallback } from "react";
import { Order, OrderStatus, OrderActionModal, OrderAction } from "../types";
import { STATUS_ACTION_MAP, ACTION_MESSAGES } from "./constants";

// Date formatting
export const formatDate = (dateString: string): string => {
   const date = new Date(dateString);
   const day = date.getDate().toString().padStart(2, "0");
   const month = (date.getMonth() + 1).toString().padStart(2, "0");
   const year = date.getFullYear();
   return `${day}/${month}/${year}`;
};

export const formatDateVN = (dateString: string): string => {
   const date = new Date(dateString);
   const hours = date.getHours().toString().padStart(2, "0");
   const minutes = date.getMinutes().toString().padStart(2, "0");
   const day = date.getDate().toString().padStart(2, "0");
   const month = (date.getMonth() + 1).toString().padStart(2, "0");
   const year = date.getFullYear();
   return `${hours}:${minutes} - ${day}/${month}/${year}`;
};

export const formatCurrency = (amount: number): string => {
   return `${amount.toLocaleString("vi-VN")}₫`;
};

export const getOrderIdDisplay = (orderId: string): string => {
   return `#${orderId.slice(-8).toUpperCase()}`;
};

// Filter and sort orders
export const filterOrders = (
   orders: Order[],
   searchTerm: string,
   statusFilter: OrderStatus | "all"
): Order[] => {
   return orders
      .filter((order) => {
         if (statusFilter !== "all" && order.status !== statusFilter)
            return false;
         if (!searchTerm) return true;

         const search = searchTerm.toLowerCase();
         return (
            order._id.toLowerCase().includes(search) ||
            order.shippingAddress.fullName.toLowerCase().includes(search) ||
            order.shippingAddress.phone.includes(search) ||
            order.shippingAddress.address.toLowerCase().includes(search)
         );
      })
      .sort(
         (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
};

export const usePagination = <T,>(data: T[], itemsPerPage: number = 10) => {
   const [currentPage, setCurrentPage] = useState(1);

   const totalPages = useMemo(
      () => Math.ceil(data.length / itemsPerPage),
      [data.length, itemsPerPage]
   );

   const paginatedData = useMemo(
      () =>
         data.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
         ),
      [data, currentPage, itemsPerPage]
   );

   const goToNextPage = useCallback(() => {
      setCurrentPage((prev) => Math.min(totalPages, prev + 1));
   }, [totalPages]);

   const goToPrevPage = useCallback(() => {
      setCurrentPage((prev) => Math.max(1, prev - 1));
   }, []);

   const goToPage = useCallback(
      (page: number) => {
         setCurrentPage(Math.max(1, Math.min(totalPages, page)));
      },
      [totalPages]
   );

   return {
      currentPage,
      totalPages,
      paginatedData,
      goToNextPage,
      goToPrevPage,
      setPage: setCurrentPage,
      goToPage,
   };
};

export const useOrderActions = (
   setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
   toast: any
) => {
   const [actionLoading, setActionLoading] = useState<string | null>(null);
   const [showConfirmModal, setShowConfirmModal] =
      useState<OrderActionModal | null>(null);

   const updateOrderStatus = useCallback(
      async (orderId: string, newStatus: OrderStatus, action: OrderAction) => {
         const toastId = toast.loading(ACTION_MESSAGES[action].loading);

         try {
            setActionLoading(orderId);
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${orderId}`,
               {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({ status: newStatus }),
               }
            );

            const result = await res.json();

            if (result.success) {
               toast.updateToast(
                  toastId,
                  ACTION_MESSAGES[action].success,
                  "success"
               );
               return true;
            } else {
               toast.updateToast(
                  toastId,
                  result.message || ACTION_MESSAGES[action].error,
                  "error"
               );
               return false;
            }
         } catch (err: any) {
            toast.updateToast(toastId, "Lỗi: " + err.message, "error");
            return false;
         } finally {
            setActionLoading(null);
         }
      },
      [toast]
   );

   const handleAction = useCallback(
      (orderId: string, action: OrderAction, currentStatus: OrderStatus) => {
         setShowConfirmModal({ orderId, action, currentStatus });
      },
      []
   );

   const confirmAction = useCallback(
      async (refetchOrders: () => Promise<void>) => {
         if (!showConfirmModal) return;

         const success = await updateOrderStatus(
            showConfirmModal.orderId,
            STATUS_ACTION_MAP[showConfirmModal.action],
            showConfirmModal.action
         );

         if (success) {
            await refetchOrders();
            setShowConfirmModal(null);
         }
      },
      [showConfirmModal, updateOrderStatus]
   );

   const cancelAction = useCallback(() => {
      setShowConfirmModal(null);
   }, []);

   return {
      actionLoading,
      showConfirmModal,
      handleAction,
      confirmAction,
      cancelAction,
      updateOrderStatus,
   };
};
