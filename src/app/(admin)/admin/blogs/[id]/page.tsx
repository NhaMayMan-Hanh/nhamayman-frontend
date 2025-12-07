"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
   ArrowLeft,
   Calendar,
   Heart,
   MessageCircle,
   Trash2,
   User,
   Eye,
} from "lucide-react";
import Image from "next/image";
import Loading from "@components/admin/Loading";
import ErrorState from "@components/admin/ErrorState";
import apiRequest from "@lib/api";

interface Comment {
   user: string;
   userName: string;
   userAvatar: string;
   content: string;
   likes: number;
   likedBy: string[];
   isDeleted: boolean;
   replies: Comment[];
   createdAt: string;
   _id: string;
}

interface BlogData {
   _id: string;
   name: string;
   img: string;
   slug: string;
   like: number;
   likedBy: string[];
   description: string;
   content: string;
   comments: Comment[];
   createdAt: string;
   updatedAt: string;
}

interface BlogDetailResponse {
   success: boolean;
   message: string;
   data: BlogData;
}

const BlogDetailAdmin = () => {
   const params = useParams();
   const router = useRouter();
   const id = params?.id as string;

   const [blog, setBlog] = useState<BlogData | null>(null);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);
   const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
      null
   );
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
   const [activeTab, setActiveTab] = useState<"content" | "comments">(
      "content"
   );

   const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
         year: "numeric",
         month: "long",
         day: "numeric",
         hour: "2-digit",
         minute: "2-digit",
      });
   };

   const fetchBlogDetail = useCallback(async () => {
      try {
         setLoading(true);
         setError(null);
         const data = await apiRequest.get<BlogDetailResponse>(
            `/admin/blogs/${id}`
         );
         if (data.success) {
            setBlog(data.data);
         } else {
            setError(data.message || "Không tìm thấy bài viết");
         }
      } catch (err: any) {
         setError(err.message || "Lỗi khi tải bài viết");
         console.error("Fetch blog detail error:", err);
      } finally {
         setLoading(false);
      }
   }, [id]);

   useEffect(() => {
      if (id) {
         fetchBlogDetail();
      }
   }, [id, fetchBlogDetail]);

   const handleDeleteClick = (commentId: string) => {
      setCommentToDelete(commentId);
      setShowDeleteModal(true);
   };

   const handleDeleteComment = async () => {
      if (!commentToDelete) return;

      setDeletingCommentId(commentToDelete);
      try {
         await apiRequest.delete(
            `/admin/blogs/${id}/comments/${commentToDelete}`
         );
         alert("Xóa bình luận thành công!");
         fetchBlogDetail();
      } catch (err: any) {
         alert(err.message || "Có lỗi khi xóa bình luận");
      } finally {
         setDeletingCommentId(null);
         setShowDeleteModal(false);
         setCommentToDelete(null);
      }
   };

   const countTotalComments = (comments: Comment[]): number => {
      let count = 0;
      comments.forEach((comment) => {
         if (!comment.isDeleted) {
            count++;
            if (comment.replies && comment.replies.length > 0) {
               count += countTotalComments(comment.replies);
            }
         }
      });
      return count;
   };

   const renderComment = (comment: Comment, depth: number = 0) => {
      if (comment.isDeleted) return null;

      return (
         <div
            key={comment._id}
            className={`${
               depth > 0 ? "ml-12 border-l-2 border-gray-200 pl-4" : ""
            } mb-4`}
         >
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
               <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                     <Image
                        src={comment.userAvatar || "/img/default-avatar.jpg"}
                        alt={comment.userName}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                     />
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <h4 className="font-semibold text-gray-900">
                              {comment.userName}
                           </h4>
                           <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                              {comment.user.substring(0, 8)}
                           </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                           {formatDate(comment.createdAt)}
                        </p>
                        <p className="text-gray-700 wrap-break-word">
                           {comment.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                           <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {comment.likes} lượt thích
                           </span>
                           {comment.replies && comment.replies.length > 0 && (
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                 <MessageCircle className="w-4 h-4" />
                                 {comment.replies.length} phản hồi
                              </span>
                           )}
                        </div>
                     </div>
                  </div>
                  <button
                     onClick={() => handleDeleteClick(comment._id)}
                     disabled={deletingCommentId === comment._id}
                     className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                     title="Xóa bình luận"
                  >
                     <Trash2 className="w-5 h-5" />
                  </button>
               </div>
            </div>

            {comment.replies && comment.replies.length > 0 && (
               <div className="mt-2">
                  {comment.replies.map((reply) =>
                     renderComment(reply, depth + 1)
                  )}
               </div>
            )}
         </div>
      );
   };

   if (loading) {
      return <Loading />;
   }

   if (error || !blog) {
      return (
         <ErrorState
            title="Không tìm thấy bài viết"
            message="Bài blog bạn đang tìm không tồn tại hoặc đã bị xóa."
            buttonText="Quay lại danh sách blog"
            redirect="/admin/blogs"
         />
      );
   }

   const totalComments = countTotalComments(blog.comments);

   return (
      <div className="min-h-screen bg-gray-50 p-6">
         <div>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
               <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
               >
                  <ArrowLeft className="w-5 h-5" />
                  Quay lại
               </button>

               <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span>ID: {blog._id}</span>
               </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
               <div className="bg-white rounded-lg shadow p-6 border-l-4 border-pink-500">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-sm text-gray-600 mb-1">
                           Tổng lượt thích
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                           {blog.like}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                           {blog.likedBy.length} người thích
                        </p>
                     </div>
                     <div className="p-3 bg-pink-100 rounded-full">
                        <Heart className="w-8 h-8 text-pink-600" />
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-sm text-gray-600 mb-1">
                           Tổng bình luận
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                           {totalComments}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                           {blog.comments.length} bình luận gốc
                        </p>
                     </div>
                     <div className="p-3 bg-blue-100 rounded-full">
                        <MessageCircle className="w-8 h-8 text-blue-600" />
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-sm text-gray-600 mb-1">Ngày tạo</p>
                        <p className="text-lg font-bold text-gray-900">
                           {formatDate(blog.createdAt).split(",")[0]}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                           Cập nhật: {formatDate(blog.updatedAt).split(",")[0]}
                        </p>
                     </div>
                     <div className="p-3 bg-green-100 rounded-full">
                        <Calendar className="w-8 h-8 text-green-600" />
                     </div>
                  </div>
               </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-t-lg shadow-md border-b">
               <div className="flex">
                  <button
                     onClick={() => setActiveTab("content")}
                     className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                        activeTab === "content"
                           ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                           : "text-gray-600 hover:bg-gray-50"
                     }`}
                  >
                     Nội dung bài viết
                  </button>
                  <button
                     onClick={() => setActiveTab("comments")}
                     className={`flex-1 px-6 py-4 font-semibold transition-colors relative ${
                        activeTab === "comments"
                           ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                           : "text-gray-600 hover:bg-gray-50"
                     }`}
                  >
                     Bình luận
                     {totalComments > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                           {totalComments}
                        </span>
                     )}
                  </button>
               </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-b-lg shadow-md p-6">
               {activeTab === "content" ? (
                  <div>
                     {/* Blog Header */}
                     <div className="mb-8">
                        <img
                           src={blog.img}
                           alt={blog.name}
                           className="w-full h-[400px] object-cover rounded-lg mb-6"
                        />
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                           {blog.name}
                        </h1>
                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                           <span className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {formatDate(blog.createdAt)}
                           </span>
                           <span className="px-3 py-1 bg-gray-100 rounded-full font-medium">
                              Slug: {blog.slug}
                           </span>
                        </div>
                        <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded">
                           <p className="text-lg text-gray-700 italic">
                              {blog.description}
                           </p>
                        </div>
                     </div>

                     {/* Blog Content */}
                     <div className="border-t pt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                           Nội dung chi tiết
                        </h2>
                        <div
                           className="prose prose-lg max-w-none
                              prose-headings:font-bold prose-headings:text-gray-900
                              prose-p:text-gray-700 prose-p:leading-relaxed
                              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                              prose-img:rounded-lg prose-img:shadow-md
                              prose-ul:list-disc prose-ol:list-decimal
                              prose-li:text-gray-700"
                           dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                     </div>
                  </div>
               ) : (
                  <div>
                     <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <MessageCircle className="w-6 h-6 text-blue-600" />
                        Quản lý bình luận ({totalComments})
                     </h2>

                     {blog.comments.length === 0 ? (
                        <div className="text-center py-12">
                           <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                           <p className="text-gray-500 text-lg">
                              Chưa có bình luận nào
                           </p>
                        </div>
                     ) : (
                        <div className="space-y-2">
                           {blog.comments.map((comment) =>
                              renderComment(comment)
                           )}
                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>

         {/* Delete Confirmation Modal */}
         {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">
                     Xác nhận xóa bình luận
                  </h3>
                  <p className="text-gray-600 mb-6">
                     Bạn có chắc chắn muốn xóa bình luận này? Hành động này
                     không thể hoàn tác.
                  </p>
                  <div className="flex justify-end space-x-3">
                     <button
                        onClick={() => {
                           setShowDeleteModal(false);
                           setCommentToDelete(null);
                        }}
                        disabled={deletingCommentId !== null}
                        className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                     >
                        Hủy
                     </button>
                     <button
                        onClick={handleDeleteComment}
                        disabled={deletingCommentId !== null}
                        className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
                     >
                        {deletingCommentId ? "Đang xóa..." : "Xóa"}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default BlogDetailAdmin;
