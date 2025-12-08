"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import apiRequest from "@lib/api/index";
import toast from "react-hot-toast";
import { ApiResponse } from "@app/(client)/types";
import Image from "next/image";

interface Comment {
  _id: string;
  content: string;
  username: string;
  avatar?: string;
  createdAt: string;
}

interface CommentSectionProps {
  productId: string;
}

export default function CommentSection({ productId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [productId]);

  const fetchComments = async () => {
    try {
      const res = await apiRequest.get<ApiResponse<Comment[]>>(
        `/client/comments/product/${productId}`,
        { noAuth: true }
      );
      if (res.success) {
        setComments(res.data);
      }
    } catch (error) {
      console.error("Lỗi tải bình luận:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để bình luận");
      return;
    }

    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest.post<ApiResponse<Comment>>("/client/comments", {
        productId,
        content,
      });

      if (res.success) {
        toast.success("Bình luận thành công!");
        setContent("");
        fetchComments();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể gửi bình luận");
    } finally {
      setLoading(false);
    }
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 5);

  return (
    <div className="mt-16 border-t pt-10">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold">Bình luận</h2>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
          {comments.length} bình luận
        </span>
      </div>

      {/* Form bình luận */}
      <div className="bg-gray-50 rounded-xl p-6 mb-10">
        <div className="flex gap-4">
          <Image
            width={20}
            height={20}
            src="/img/default-avatar.jpg"
            alt="Avatar"
            className="w-7 h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/img/default-avatar.jpg";
            }}
          />
          <div className="flex-1 space-y-4">
            <textarea
              placeholder={user ? "Chia sẻ suy nghĩ của bạn về sản phẩm này..." : "Xin chào bạn"}
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!user}
            />
            <div className="flex justify-end">
              <button
                onClick={handleSubmitComment}
                disabled={!user || loading || !content.trim()}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? "Đang gửi..." : "Gửi bình luận"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {!user && (
        <div className="bg-blue-50 rounded-xl p-6 mb-2 text-center">
          <p className="text-blue-700 mb-3">Bạn cần đăng nhập để bình luận</p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5m0 0l-5-5m5 5H3"
              />
            </svg>
            Đăng nhập
          </a>
        </div>
      )}

      {/* Danh sách bình luận */}
      <div className="space-y-6">
        {displayedComments.map((comment) => (
          <div key={comment._id} className="flex gap-4 pb-6 border-b last:border-0 border-gray-300">
            <div className="w-12 h-12 rounded-full  border bg-gray-50 shrink-0 overflow-hidden">
              <Image
                width={20}
                height={20}
                src={comment.avatar || "/img/default-avatar.jpg"}
                alt={comment.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/img/default-avatar.jpg";
                }}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{comment.username}</h4>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-gray-700 leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Nút xem thêm */}
      {comments.length > 5 && !showAllComments && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowAllComments(true)}
            className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
          >
            Xem thêm bình luận ({comments.length - 5})
          </button>
        </div>
      )}

      {comments.length === 0 && (
        <p className="text-center text-gray-500 py-8">Chưa có bình luận nào</p>
      )}
    </div>
  );
}
