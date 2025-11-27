// components/ToastContainer.tsx
"use client";
import { useState, useEffect } from "react";

declare global {
   interface Window {
      showToast?: (
         message: string,
         type?: "success" | "error" | "loading"
      ) => string;

      updateToast?: (
         id: string,
         message: string,
         type: "success" | "error" | "loading"
      ) => void;
   }
}

export function ToastContainer() {
   const [toasts, setToasts] = useState<
      { id: string; message: string; type: "success" | "error" | "loading" }[]
   >([]);

   useEffect(() => {
      window.showToast = (
         message: string,
         type: "success" | "error" | "loading" = "success"
      ) => {
         const id = crypto.randomUUID();
         setToasts((prev) => [...prev, { id, message, type }]);

         if (type !== "loading") {
            setTimeout(() => {
               setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 3500);
         }

         return id;
      };

      window.updateToast = (
         id: string,
         message: string,
         type: "success" | "error" | "loading" // ✅ Thêm "loading"
      ) => {
         setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, message, type } : t))
         );

         // Chỉ tự động đóng nếu không phải loading
         if (type !== "loading") {
            setTimeout(() => {
               setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 3000);
         }
      };
   }, []);

   if (toasts.length === 0) return null;

   return (
      <div className="fixed top-4 right-4 z-100 space-y-3">
         {toasts.map((toast) => (
            <div
               key={toast.id}
               className={`flex items-center gap-3 min-w-80 max-w-sm px-5 py-4 rounded-xl shadow-xl text-white transform transition-all duration-300 animate-slide-in-right ${
                  toast.type === "success"
                     ? "bg-green-600"
                     : toast.type === "error"
                     ? "bg-red-600"
                     : "bg-blue-600"
               }`}
            >
               {/* icon */}
               <div className="shrink-0">
                  {toast.type === "success" && (
                     <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                     >
                        <path
                           fillRule="evenodd"
                           d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                           clipRule="evenodd"
                        />
                     </svg>
                  )}

                  {toast.type === "error" && (
                     <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                     >
                        <path
                           fillRule="evenodd"
                           d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                           clipRule="evenodd"
                        />
                     </svg>
                  )}

                  {toast.type === "loading" && (
                     <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
               </div>

               <p className="text-sm font-medium flex-1">{toast.message}</p>

               {/* close btn */}
               <button
                  className="opacity-70 hover:opacity-100"
                  onClick={() =>
                     setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                  }
               >
                  <svg
                     className="w-5 h-5"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                     />
                  </svg>
               </button>
            </div>
         ))}
      </div>
   );
}
