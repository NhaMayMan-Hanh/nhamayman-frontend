// components/admin/OrderActionButtons.tsx
import { Eye, Check, X, Truck, CheckCircle } from "lucide-react";
import { Order, OrderAction } from "../types";

interface OrderActionButtonsProps {
   order: Order;
   actionLoading: string | null;
   onView: () => void;
   onAction: (
      orderId: string,
      action: OrderAction,
      currentStatus: Order["status"]
   ) => void;
}

interface ActionButton {
   action: OrderAction;
   icon: typeof Eye;
   colorClass: string;
   title: string;
}

const ACTION_BUTTONS: Record<Order["status"], ActionButton[]> = {
   pending: [
      {
         action: "confirm",
         icon: Check,
         colorClass: "text-green-600 hover:bg-green-50",
         title: "Xác nhận đơn",
      },
      {
         action: "cancel",
         icon: X,
         colorClass: "text-red-600 hover:bg-red-50",
         title: "Hủy đơn",
      },
   ],
   confirmed: [
      {
         action: "ship",
         icon: Truck,
         colorClass: "text-purple-600 hover:bg-purple-50",
         title: "Chuyển sang đang giao",
      },
      {
         action: "cancel",
         icon: X,
         colorClass: "text-red-600 hover:bg-red-50",
         title: "Hủy đơn",
      },
   ],
   shipped: [
      {
         action: "deliver",
         icon: CheckCircle,
         colorClass: "text-green-600 hover:bg-green-50",
         title: "Đánh dấu đã giao",
      },
   ],
   delivered: [],
   cancelled: [],
};

export default function OrderActionButtons({
   order,
   actionLoading,
   onView,
   onAction,
}: OrderActionButtonsProps) {
   const buttons = ACTION_BUTTONS[order.status];
   const isLoading = actionLoading === order._id;

   return (
      <div className="flex items-center justify-center gap-2">
         <button
            onClick={onView}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
            title="Xem chi tiết"
         >
            <Eye className="w-5 h-5" />
         </button>
         {buttons.map(({ action, icon: Icon, colorClass, title }) => (
            <button
               key={action}
               onClick={() => onAction(order._id, action, order.status)}
               disabled={isLoading}
               className={`p-2 rounded-lg transition-all disabled:opacity-50 cursor-pointer ${colorClass}`}
               title={title}
            >
               <Icon className="w-5 h-5" />
            </button>
         ))}
      </div>
   );
}
