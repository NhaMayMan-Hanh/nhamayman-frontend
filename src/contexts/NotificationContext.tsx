"use client";
import {
   createContext,
   useContext,
   useState,
   useEffect,
   ReactNode,
} from "react";
import { useAuth } from "@contexts/AuthContext";
import apiRequest from "@lib/api";

interface Notification {
   _id: string;
   userId?: string | null;
   email?: string | null;
   type: string;
   title: string;
   message: string;
   relatedId?: string;
   relatedModel?: "Feedback" | "Order" | "Promotion";
   link?: string;
   metadata?: {
      // Feedback metadata
      feedbackMessage?: string;
      adminResponse?: string;

      // Order metadata
      orderStatus?: string;
      previousStatus?: string;
      updatedBy?: string;
      cancelledBy?: string;
      trackingNumber?: string;
      cancelReason?: string;

      // Promotion metadata
      discount?: string;
      validUntil?: string;

      // Other metadata
      [key: string]: any;
   };
   isRead: boolean;
   createdAt: string;
}

interface NotificationContextType {
   notifications: Notification[];
   hasUnreadNotification: boolean;
   unreadCount: number;
   loading: boolean;
   refreshNotifications: () => Promise<void>;
   markAsRead: (notificationId: string) => Promise<void>;
   markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
   undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
   const [notifications, setNotifications] = useState<Notification[]>([]);
   const [loading, setLoading] = useState(false);
   const { user } = useAuth();

   const fetchNotifications = async () => {
      if (!user?.id) {
         setNotifications([]);
         return;
      }
      try {
         setLoading(true);
         const response: any = await apiRequest.get("/client/notification");
         if (response.success && response.data) {
            const userNotifications = response.data.filter(
               (notification: Notification) => notification.userId === user.id
            );
            setNotifications(userNotifications);
         }
      } catch (error) {
         console.error("Error fetching notifications:", error);
      } finally {
         setLoading(false);
      }
   };

   const markAsRead = async (notificationId: string) => {
      try {
         await apiRequest.patch(`/client/notification/${notificationId}/read`, {
            isRead: true,
         });

         setNotifications((prev) =>
            prev.map((notif) =>
               notif._id === notificationId ? { ...notif, isRead: true } : notif
            )
         );
      } catch (error) {
         console.error("Error marking notification as read:", error);
      }
   };

   const markAllAsRead = async () => {
      try {
         await apiRequest.patch("/client/notification/read-all");

         // Update local state
         setNotifications((prev) =>
            prev.map((notif) => ({ ...notif, isRead: true }))
         );
      } catch (error) {
         console.error("Error marking all notifications as read:", error);
      }
   };

   useEffect(() => {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
   }, [user?.id]);

   const hasUnreadNotification = notifications.some((notif) => !notif.isRead);
   const unreadCount = notifications.filter((notif) => !notif.isRead).length;

   const value: NotificationContextType = {
      notifications,
      hasUnreadNotification,
      unreadCount,
      loading,
      refreshNotifications: fetchNotifications,
      markAsRead,
      markAllAsRead,
   };

   return (
      <NotificationContext.Provider value={value}>
         {children}
      </NotificationContext.Provider>
   );
}

export function useNotifications() {
   const context = useContext(NotificationContext);
   if (context === undefined) {
      throw new Error(
         "useNotifications must be used within a NotificationProvider"
      );
   }
   return context;
}
