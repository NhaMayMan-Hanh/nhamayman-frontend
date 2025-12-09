"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import apiRequest from "@lib/api/index";
import toast from "react-hot-toast";
import { ApiResponse } from "@app/(client)/types";

interface Review {
  _id: string;
  rating: number;
  content: string;
  username: string;
  createdAt: string;
}

interface ReviewSectionProps {
  productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0 });
  const [canReview, setCanReview] = useState(false);
  const [canReviewMessage, setCanReviewMessage] = useState("");
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchStats();
    if (user) {
      checkCanReview();
      fetchMyReview();
    }
  }, [productId, user]);

  const fetchReviews = async () => {
    try {
      const res = await apiRequest.get<ApiResponse<{ reviews: Review[] }>>(
        `/client/reviews/product/${productId}`,
        { noAuth: true }
      );
      if (res.success) {
        setReviews(res.data.reviews);
      }
    } catch (error) {
      console.error("Lỗi tải đánh giá:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiRequest.get<ApiResponse<{ avgRating: number; totalReviews: number }>>(
        `/client/reviews/product/${productId}/stats`,
        { noAuth: true }
      );
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Lỗi tải thống kê:", error);
    }
  };

  const checkCanReview = async () => {
    try {
      const res = await apiRequest.get<ApiResponse<{ canReview: boolean; reason?: string }>>(
        `/client/reviews/product/${productId}/can-review`
      );
      if (res.success) {
        setCanReview(res.data.canReview);
        setCanReviewMessage(res.data.reason || "");
      }
    } catch (error) {
      console.error("Lỗi kiểm tra quyền đánh giá:", error);
    }
  };

  const fetchMyReview = async () => {
    try {
      const res = await apiRequest.get<ApiResponse<Review>>(
        `/client/reviews/product/${productId}/my-review`
      );
      if (res.success && res.data) {
        setMyReview(res.data);
      }
    } catch (error) {
      // User chưa có review
    }
  };

  const handleSubmitReview = async () => {
    if (!content.trim() || content.length < 10) {
      toast.error("Nội dung đánh giá phải có ít nhất 10 ký tự");
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest.post<ApiResponse<any>>("/client/reviews", {
        productId,
        rating,
        content,
      });

      if (res.success) {
        toast.success("Đánh giá thành công!");
        setContent("");
        setRating(5);
        fetchReviews();
        fetchStats();
        fetchMyReview();
        setCanReview(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể gửi đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="mt-16 border-t pt-10">
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
        <h2 className="text-2xl font-bold">Đánh giá sản phẩm</h2>
        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
          {stats.avgRating.toFixed(1)} ⭐ ({stats.totalReviews} đánh giá)
        </span>
      </div>

      {/* Form đánh giá */}
      {user && (
        <div className="bg-gray-50 rounded-xl p-6 mb-10">
          {myReview ? (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium">✓ Bạn đã đánh giá sản phẩm này</p>
              <div className="mt-4 flex justify-center gap-1">
                {[...Array(myReview.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <p className="mt-2 text-gray-700">{myReview.content}</p>
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 border-2 shrink-0" />
                <div className="flex-1">
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-2">Đánh giá của bạn</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          disabled={!canReview}
                          className="focus:outline-none disabled:cursor-not-allowed"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating ? "fill-amber-500 text-amber-500" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    placeholder={
                      canReview
                        ? "Chia sẻ cảm nhận của bạn về sản phẩm này..."
                        : canReviewMessage || "Bạn cần mua sản phẩm trước khi đánh giá"
                    }
                    className="w-full h-20 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={!canReview}
                  />

                  <div className="flex flex-wrap justify-between items-center mt-4">
                    {!canReview && (
                      <p className="text-sm text-amber-600 font-medium">{canReviewMessage}</p>
                    )}
                    <button
                      onClick={handleSubmitReview}
                      disabled={!canReview || loading || !content.trim()}
                      className="ml-auto mt-2 px-4 py-2 md:px-8 text-sm md:text-base md:py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                      {loading ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* {!user && (
        <div className="bg-blue-50 rounded-xl p-6 mb-10 text-center">
          <p className="text-blue-700">
            Vui lòng{" "}
            <a href="/login" className="underline font-medium">
              đăng nhập
            </a>{" "}
            để đánh giá sản phẩm
          </p>
        </div>
      )} */}

      {/* Danh sách đánh giá */}
      <div className="space-y-6">
        {displayedReviews.map((review) => (
          <div key={review._id} className="flex gap-4 pb-6 border-b last:border-0">
            <div className="w-12 h-12 rounded-full bg-gray-200 border shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{review.username}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-amber-500">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-gray-700 leading-relaxed">{review.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Nút xem thêm */}
      {reviews.length > 3 && !showAllReviews && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowAllReviews(true)}
            className="px-8 py-3 border-2 border-amber-600 text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition"
          >
            Xem thêm đánh giá ({reviews.length - 3})
          </button>
        </div>
      )}

      {reviews.length === 0 && (
        <p className="text-center text-gray-500 py-4">Chưa có đánh giá nào</p>
      )}
    </div>
  );
}
