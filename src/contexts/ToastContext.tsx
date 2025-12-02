"use client";
import {
   createContext,
   useContext,
   useState,
   useCallback,
   ReactNode,
   useRef,
   useEffect,
} from "react";
import { CheckCircle2, XCircle, Loader2, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "loading" | "info";

interface Toast {
   id: string;
   message: string;
   type: ToastType;
   duration?: number;
   isExiting?: boolean; // ✅ Flag để trigger fade-out
}

interface ToastContextType {
   showToast: (message: string, type?: ToastType, duration?: number) => string;
   updateToast: (
      id: string,
      message: string,
      type: ToastType,
      duration?: number
   ) => void;
   hideToast: (id: string) => void;
   success: (message: string, duration?: number) => string;
   error: (message: string, duration?: number) => string;
   loading: (message: string) => string;
   info: (message: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const DEFAULT_DURATIONS: Record<ToastType, number | undefined> = {
   success: 3500,
   error: 4000,
   info: 3500,
   loading: undefined,
};

const EXIT_ANIMATION_DURATION = 300; // ✅ Thời gian fade-out

export function ToastProvider({ children }: { children: ReactNode }) {
   const [toasts, setToasts] = useState<Toast[]>([]);
   const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

   useEffect(() => {
      return () => {
         timersRef.current.forEach((timer) => clearTimeout(timer));
         timersRef.current.clear();
      };
   }, []);

   // ✅ Hàm remove với animation
   const removeToast = useCallback((id: string) => {
      // Bước 1: Đánh dấu isExiting = true → trigger animation
      setToasts((prev) =>
         prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
      );

      // Bước 2: Sau 300ms animation xong, xóa khỏi DOM
      setTimeout(() => {
         setToasts((prev) => prev.filter((t) => t.id !== id));
      }, EXIT_ANIMATION_DURATION);
   }, []);

   const showToast = useCallback(
      (
         message: string,
         type: ToastType = "success",
         duration?: number
      ): string => {
         const id = crypto.randomUUID();
         const finalDuration =
            duration !== undefined ? duration : DEFAULT_DURATIONS[type];

         setToasts((prev) => [
            ...prev,
            { id, message, type, duration: finalDuration, isExiting: false },
         ]);

         if (finalDuration) {
            const timer = setTimeout(() => {
               removeToast(id); // ✅ Dùng removeToast
               timersRef.current.delete(id);
            }, finalDuration);
            timersRef.current.set(id, timer);
         }

         return id;
      },
      [removeToast]
   );

   const updateToast = useCallback(
      (id: string, message: string, type: ToastType, duration?: number) => {
         const finalDuration =
            duration !== undefined ? duration : DEFAULT_DURATIONS[type];

         const oldTimer = timersRef.current.get(id);
         if (oldTimer) {
            clearTimeout(oldTimer);
            timersRef.current.delete(id);
         }

         setToasts((prev) =>
            prev.map((t) =>
               t.id === id
                  ? {
                       ...t,
                       message,
                       type,
                       duration: finalDuration,
                       isExiting: false,
                    }
                  : t
            )
         );

         if (finalDuration) {
            const timer = setTimeout(() => {
               removeToast(id); // ✅ Dùng removeToast
               timersRef.current.delete(id);
            }, finalDuration);
            timersRef.current.set(id, timer);
         }
      },
      [removeToast]
   );

   const hideToast = useCallback(
      (id: string) => {
         const timer = timersRef.current.get(id);
         if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
         }
         removeToast(id); // ✅ Dùng removeToast
      },
      [removeToast]
   );

   const success = useCallback(
      (message: string, duration?: number) => {
         return showToast(message, "success", duration);
      },
      [showToast]
   );

   const error = useCallback(
      (message: string, duration?: number) => {
         return showToast(message, "error", duration);
      },
      [showToast]
   );

   const loading = useCallback(
      (message: string) => {
         return showToast(message, "loading");
      },
      [showToast]
   );

   const info = useCallback(
      (message: string, duration?: number) => {
         return showToast(message, "info", duration);
      },
      [showToast]
   );

   const value = {
      showToast,
      updateToast,
      hideToast,
      success,
      error,
      loading,
      info,
   };

   return (
      <ToastContext.Provider value={value}>
         {children}
         <ToastContainer toasts={toasts} onClose={hideToast} />
      </ToastContext.Provider>
   );
}

export function useToast() {
   const context = useContext(ToastContext);
   if (!context) {
      throw new Error("useToast must be used within ToastProvider");
   }
   return context;
}

const TOAST_STYLES: Record<ToastType, { bg: string; icon: ReactNode }> = {
   success: {
      bg: "bg-green-600",
      icon: <CheckCircle2 className="w-6 h-6" />,
   },
   error: {
      bg: "bg-red-600",
      icon: <XCircle className="w-6 h-6" />,
   },
   loading: {
      bg: "bg-blue-600",
      icon: <Loader2 className="w-6 h-6 animate-spin" />,
   },
   info: {
      bg: "bg-blue-500",
      icon: <Info className="w-6 h-6" />,
   },
};

function ToastContainer({
   toasts,
   onClose,
}: {
   toasts: Toast[];
   onClose: (id: string) => void;
}) {
   if (toasts.length === 0) return null;

   return (
      <div className="fixed top-4 right-4 z-100 space-y-3 pointer-events-none">
         {toasts.map((toast) => {
            const style = TOAST_STYLES[toast.type];
            return (
               <div
                  key={toast.id}
                  className={`
                     pointer-events-auto flex items-center gap-3 
                     min-w-80 max-w-sm px-5 py-4 rounded-xl shadow-xl text-white
                     transition-all duration-300 ease-out
                     ${style.bg}
                     ${
                        toast.isExiting
                           ? "opacity-0 translate-x-full scale-95" // ✅ Fade out mượt
                           : "opacity-100 translate-x-0 scale-100" // ✅ Fade in
                     }
                  `}
                  style={{
                     // ✅ Inline animation cho slide-in lần đầu
                     animation: toast.isExiting
                        ? "none"
                        : "slideIn 0.3s ease-out",
                  }}
               >
                  <div className="shrink-0">{style.icon}</div>
                  <p className="text-sm font-medium flex-1 leading-relaxed">
                     {toast.message}
                  </p>
                  <button
                     className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                     onClick={() => onClose(toast.id)}
                     aria-label="Đóng thông báo"
                  >
                     <X className="w-5 h-5" />
                  </button>
               </div>
            );
         })}

         {/* ✅ Inline keyframes animation */}
         <style jsx>{`
            @keyframes slideIn {
               from {
                  transform: translateX(100%);
                  opacity: 0;
               }
               to {
                  transform: translateX(0);
                  opacity: 1;
               }
            }
         `}</style>
      </div>
   );
}
