"use client";

import { useAuth } from "@contexts/AuthContext";
import apiRequest from "@lib/api";
import { useState } from "react";

export default function FeedbackForm() {
   const [submitted, setSubmitted] = useState(false);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const { user } = useAuth();

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!user) {
         setError("Vui lòng đăng nhập để gửi feedback!");
         return;
      }

      setLoading(true);
      setError(null);

      const formData = new FormData(e.currentTarget);
      const data = {
         email: formData.get("email") || null,
         message: formData.get("message"),
         userId: user.id,
      };
      try {
         await apiRequest.post("/client/feedback", data);
         setSubmitted(true);
         e.currentTarget?.reset();
         setTimeout(() => {
            setSubmitted(false);
         }, 3000);
      } catch (err: any) {
         setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại!");
      } finally {
         setLoading(false);
      }
   };

   return (
      <section className="mt-20 bg-gray-50 rounded-xl p-8 md:p-12">
         <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Gửi ý kiến đóng góp của bạn
         </h2>
         {user && (
            <div className="max-w-2xl mx-auto mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
               <p className="text-sm text-blue-800">
                  Bạn đang đăng nhập với email: <strong>{user.email}</strong>
                  <br />
                  Chúng tôi sẽ thông báo khi admin phản hồi feedback của bạn.
               </p>
            </div>
         )}

         <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            {!user && (
               <div>
                  <label
                     htmlFor="email"
                     className="block text-sm font-medium text-gray-700 mb-2"
                  >
                     Email (tùy chọn)
                  </label>
                  <input
                     type="email"
                     id="email"
                     name="email"
                     disabled={loading}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition disabled:bg-gray-100"
                     placeholder="you@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                     Hoặc{" "}
                     <a
                        href="/login"
                        className="text-amber-600 hover:underline"
                     >
                        đăng nhập
                     </a>{" "}
                     để nhận thông báo khi được phản hồi
                  </p>
               </div>
            )}

            <div>
               <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
               >
                  Ý kiến của bạn <span className="text-red-500">*</span>
               </label>
               <textarea
                  required
                  id="message"
                  name="message"
                  rows={5}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none transition disabled:bg-gray-100"
                  placeholder="Bạn thích gì? Bạn muốn cải thiện gì? Chúng tôi rất muốn nghe ý kiến từ bạn..."
               />
            </div>

            {error && (
               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
               </div>
            )}

            <button
               type="submit"
               disabled={submitted || loading}
               className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white font-semibold py-4 rounded-lg transition text-lg"
            >
               {loading
                  ? "Đang gửi..."
                  : submitted
                  ? "Đã gửi thành công! Cảm ơn bạn ❤️"
                  : "Gửi ý kiến"}
            </button>
         </form>

         <p className="text-center text-gray-600 mt-6 text-sm">
            Ý kiến của bạn giúp chúng mình ngày càng tốt hơn!
         </p>
      </section>
   );
}
