"use client";

import { useState } from "react";

export default function FeedbackForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    console.log("Feedback:", {
      email: formData.get("email"),
      message: formData.get("message"),
    });

    setSubmitted(true);
    setTimeout(() => {
      e.currentTarget.reset();
      setSubmitted(false);
    }, 3000);
  };

  return (
    <section className="mt-20 bg-gray-50 rounded-xl p-8 md:p-12">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
        Gửi ý kiến đóng góp của bạn
      </h2>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email (tùy chọn)
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Ý kiến của bạn <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            id="message"
            name="message"
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none transition"
            placeholder="Bạn thích gì? Bạn muốn cải thiện gì? Chúng tôi rất muốn nghe ý kiến từ bạn..."
          />
        </div>

        <button
          type="submit"
          disabled={submitted}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white font-semibold py-4 rounded-lg transition text-lg"
        >
          {submitted ? "Đã gửi thành công! Cảm ơn bạn ❤️" : "Gửi ý kiến"}
        </button>
      </form>

      <p className="text-center text-gray-600 mt-6 text-sm">
        Ý kiến của bạn giúp chúng mình ngày càng tốt hơn!
      </p>
    </section>
  );
}
