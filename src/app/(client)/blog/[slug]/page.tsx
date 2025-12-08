"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import apiRequest from "@lib/api/index";
import getErrorMessage from "@utils/getErrorMessage";
import { Loading } from "@components/common/Loading";
import { toast } from "react-hot-toast";
import type { ExtendedBlog } from "../type";
import type { ApiResponse } from "@app/(client)/types";
import { useAuth } from "@contexts/AuthContext";
import { CommentItem } from "./CommentItem";

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  const [blog, setBlog] = useState<ExtendedBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [lastLikeTime, setLastLikeTime] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    parentPath: string[];
    userName: string;
  } | null>(null);

  const hasLiked = user && blog?.likedBy?.some((id) => id.toString() === user.id.toString());

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const result = await apiRequest.get<ApiResponse<ExtendedBlog>>(`/client/blogs/${slug}`, {
          noAuth: true,
        });
        if (result.success) {
          setBlog(result.data);
        } else {
          setError(result.message || "Lỗi không xác định");
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const handleLike = async () => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để thích bài viết nhé ❤️");
      return;
    }
    if (isLiking || !blog) return;

    // Debounce: chặn click liên tục (tối thiểu 500ms giữa các lần click)
    const now = Date.now();
    if (now - lastLikeTime < 500) {
      return;
    }
    setLastLikeTime(now);

    const previousBlog = blog;
    const wasLiked = hasLiked;

    setBlog({
      ...blog,
      like: wasLiked ? blog.like - 1 : blog.like + 1,
      likedBy: wasLiked
        ? blog.likedBy.filter((id: any) => id.toString() !== user.id)
        : [...blog.likedBy, user.id],
    });

    setIsLiking(true);

    try {
      const result = await apiRequest.post<ApiResponse<ExtendedBlog>>(
        `/client/blogs/${blog._id}/like`,
        {
          blogId: blog._id,
          userId: user.id,
        },
        { noAuth: false }
      );
      if (result.success) {
        setBlog(result.data);
        toast.success(wasLiked ? "Đã bỏ thích" : "Đã thích bài viết!");
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setBlog(previousBlog);
      toast.error("Không thể thích bài viết, thử lại nhé!");
      console.error("Like failed:", err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để bình luận!");
      return;
    }
    if (!commentText.trim()) {
      toast.error("Nội dung bình luận không được để trống!");
      return;
    }
    if (!blog) return;

    setIsSubmitting(true);

    try {
      const result = await apiRequest.post<ApiResponse<ExtendedBlog>>(
        `/client/blogs/${blog._id}/comments`,
        {
          content: commentText.trim(),
          parentPath: replyingTo?.parentPath || [],
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
        },
        { noAuth: false }
      );

      console.log("=== SUCCESS ===");
      console.log("Response:", result);

      if (result.success) {
        setBlog(result.data);
        setCommentText("");
        setReplyingTo(null);
        toast.success("Đã đăng bình luận!");
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error("=== COMMENT ERROR ===");
      console.error("Error object:", err);
      console.error("Error message:", getErrorMessage(err));
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (parentPath: string[], userName: string) => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để trả lời!");
      return;
    }
    setReplyingTo({ parentPath, userName });
    setCommentText(`@${userName} `);
    document.getElementById("comment-input")?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setCommentText("");
  };

  const scrollToComments = () => {
    document.getElementById("comments-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const renderHeartIcon = (size: number = 6) => (
    <Heart
      className={`w-${size} h-${size} transition-all group-hover:scale-110`}
      fill={hasLiked ? "#ec4899" : "none"}
      stroke={hasLiked ? "#ec4899" : "currentColor"}
      strokeWidth={hasLiked ? 2.5 : 1.8}
    />
  );

  const formatTime = (date: Date | string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diff = now.getTime() - commentDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <Loading message="Chờ chút xíu..." size="md" />
      </div>
    );
  }

  const totalComments = blog?.comments
    ? blog.comments.reduce((total, comment) => {
        let count = 1;
        if (comment.replies) {
          count += comment.replies.length;
          comment.replies.forEach((reply) => {
            if (reply.replies) count += reply.replies.length;
          });
        }
        return total + count;
      }, 0)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {error && <div className="text-center py-8 text-red-500">Lỗi: {error}</div>}

      {blog && (
        <div className="relative flex gap-8">
          {/* Left Sidebar */}
          <div className="hidden lg:block w-20 shrink-0">
            <div className="sticky top-24 flex flex-col items-center gap-6">
              {/* Like Button */}
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex flex-col items-center gap-2 transition-colors disabled:opacity-50 group cursor-pointer ${
                  hasLiked ? "text-pink-500" : "text-gray-600 hover:text-pink-500"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all group-hover:scale-110 ${
                    hasLiked ? "bg-pink-50" : "bg-gray-100 group-hover:bg-pink-50"
                  }`}
                >
                  {renderHeartIcon()}
                </div>
                <span className="text-sm font-semibold">{blog.like || 0}</span>
              </button>

              {/* Comment Button */}
              <button
                onClick={scrollToComments}
                className="flex flex-col items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-all group-hover:scale-110">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold">{totalComments}</span>
              </button>

              {/* Share Button */}
              <button className="flex flex-col items-center gap-2 text-gray-600 hover:text-green-500 transition-colors group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-green-50 flex items-center justify-center transition-all group-hover:scale-110">
                  <Share2 className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold">0</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center max-w-4xl">
            <h1 className="text-3xl font-bold mb-4">{blog.name}</h1>
            <p className="text-gray-600 mb-6">{blog.description}</p>
            <div
              className="prose max-w-none mb-12 w-full"
              dangerouslySetInnerHTML={{ __html: blog.content || "" }}
            />

            {/* Like & Stats lớn */}
            <div className="w-full border-t border-gray-200 pt-8 mb-8">
              <span className="text-gray-600 font-medium mb-4 inline-block">
                Bạn thấy bài viết này hữu ích?
              </span>
              <div className="flex items-center gap-8">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center gap-3 transition-colors disabled:opacity-50 group cursor-pointer ${
                    hasLiked ? "text-pink-500" : "text-gray-700 hover:text-pink-500"
                  }`}
                >
                  {renderHeartIcon(7)}
                  <span className="text-2xl font-semibold">{blog.like || 0}</span>
                  <span className="text-lg text-gray-500">Lượt thích</span>
                </button>

                <div className="flex items-center gap-3 text-gray-500">
                  <MessageCircle className="w-7 h-7" />
                  <span className="text-2xl font-semibold">{totalComments}</span>
                  <span className="text-lg">Bình luận</span>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="w-full" id="comments-section">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6" /> Bình luận ({totalComments})
              </h2>

              {/* Comment Input */}
              {user ? (
                <div className="mb-8 bg-gray-50 rounded-lg p-4">
                  {replyingTo && (
                    <div className="mb-3 flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
                      <span className="text-sm text-blue-600">
                        Đang trả lời @{replyingTo.userName}
                      </span>
                      <button
                        onClick={cancelReply}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <textarea
                        id="comment-input"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Viết bình luận của bạn..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={handleSubmitComment}
                          disabled={isSubmitting || !commentText.trim()}
                          className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? "Đang đăng..." : "Đăng bình luận"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8 bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-600">Đăng nhập để bình luận nhé!</p>
                  <Link
                    href="/login"
                    className="inline-block mt-3 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                  >
                    Đăng nhập ngay
                  </Link>
                </div>
              )}

              {/* Danh sách bình luận */}
              <div className="space-y-6">
                {blog.comments && blog.comments.length > 0 ? (
                  blog.comments.map((comment) => (
                    <CommentItem
                      key={comment._id}
                      comment={comment}
                      onReply={handleReply}
                      formatTime={formatTime}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
