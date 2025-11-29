"use client";

import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
   ArrowLeft,
   Save,
   Upload,
   X,
   Loader2,
   Eye,
   Trash2,
   ImageIcon,
} from "lucide-react";

import type {
   BlogData,
   BlogFormData,
   BlogDetailResponse,
   BlogUpdateResponse,
} from "../../types";
import Loading from "@components/admin/Loading";
import { generateSlug } from "@components/admin/helpers/generateSlug";
import DeleteConfirmModal from "@components/admin/DeleteModal";
import { useToast } from "@contexts/ToastContext";
import ErrorState from "@components/admin/ErrorState";
import apiRequest from "@lib/api";

// Tải CKEditor động
const CkEditor = dynamic(() => import("@components/admin/CKEditor"), {
   ssr: false,
   loading: () => (
      <div className="w-full h-[400px] border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
         <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-600 border-t-transparent mb-2"></div>
            <p className="text-sm text-gray-600">Đang tải trình soạn thảo...</p>
         </div>
      </div>
   ),
});

const EditBlog = () => {
   const params = useParams();
   const router = useRouter();
   const id = params?.id as string;
   const fileInputRef = useRef<HTMLInputElement>(null);
   const toast = useToast();

   const [formData, setFormData] = useState<BlogFormData>({
      name: "",
      slug: "",
      description: "",
      content: "",
      img: null,
   });

   const [originalBlog, setOriginalBlog] = useState<BlogData | null>(null);
   const [editorContent, setEditorContent] = useState<string>("");
   const [imagePreview, setImagePreview] = useState<string>("");
   const [submitting, setSubmitting] = useState<boolean>(false);
   const [fetchLoading, setFetchLoading] = useState<boolean>(true);
   const [showPreview, setShowPreview] = useState<boolean>(false);
   const [imageChanged, setImageChanged] = useState<boolean>(false);
   const [showDeleteModal, setShowDeleteModal] = useState(false);

   useEffect(() => {
      if (id) fetchBlogDetail();
   }, [id]);

   const fetchBlogDetail = async () => {
      try {
         setFetchLoading(true);
         const data = await apiRequest.get<BlogDetailResponse>(
            `/admin/blogs/${id}`
         );

         if (data.success && data.data) {
            const blog = data.data;
            setOriginalBlog(blog);
            setFormData({
               name: blog.name,
               slug: blog.slug,
               description: blog.description,
               content: blog.content,
               img: null,
            });
            setEditorContent(blog.content);
            setImagePreview(blog.img || "/default-img.png");
         } else {
            toast.error(data.message || "Không tìm thấy bài viết");
            setTimeout(() => router.push("/admin/blogs"), 2000);
         }
      } catch (err: any) {
         toast.error(err.message || "Lỗi khi tải bài viết");
         setTimeout(() => router.push("/admin/blogs"), 2000);
      } finally {
         setFetchLoading(false);
      }
   };

   const handleInputChange = (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
   ) => {
      const { name, value } = e.target;
      if (name === "name") {
         setFormData((prev) => ({
            ...prev,
            name: value,
            slug: generateSlug(value),
         }));
      } else {
         setFormData((prev) => ({ ...prev, [name]: value }));
      }
   };

   const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
         toast.error("Ảnh quá lớn (tối đa 5MB)");
         return;
      }
      if (!file.type.startsWith("image/")) {
         toast.error("File không phải là ảnh");
         return;
      }

      setFormData((prev) => ({ ...prev, img: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setImageChanged(true);
   };

   const removeImage = () => {
      setFormData((prev) => ({ ...prev, img: null }));
      setImagePreview(originalBlog?.img || "/default-img.png");
      setImageChanged(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
   };

   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!formData.name.trim())
         return toast.error("Tiêu đề không được để trống");
      if (!formData.description.trim())
         return toast.error("Mô tả ngắn không được để trống");
      if (!editorContent.trim())
         return toast.error("Nội dung bài viết không được để trống");

      if (submitting) return;
      setSubmitting(true);

      const toastId = toast.loading("Đang cập nhật bài viết...");

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("slug", formData.slug);
      submitData.append("description", formData.description);
      submitData.append("content", editorContent);
      if (formData.img instanceof File) {
         submitData.append("img", formData.img);
      }

      try {
         const data = await apiRequest.put<BlogUpdateResponse>(
            `/admin/blogs/${id}`,
            submitData
         );

         if (data.success) {
            toast.updateToast(
               toastId,
               "Cập nhật bài viết thành công!",
               "success"
            );
            // Không setSubmitting(false), giữ nút disable cho đến khi redirect
            setTimeout(() => router.push("/admin/blogs"), 1500);
         } else {
            toast.updateToast(
               toastId,
               data.message || "Cập nhật thất bại",
               "error"
            );
            setSubmitting(false);
         }
      } catch (err: any) {
         toast.updateToast(
            toastId,
            err.message || "Lỗi kết nối server",
            "error"
         );
         console.error("Update blog error:", err);
         setSubmitting(false);
      }
   };

   const confirmDelete = async () => {
      if (submitting) return;
      setSubmitting(true);

      const toastId = toast.loading("Đang xóa bài viết...");

      try {
         const data = await apiRequest.delete<{
            success: boolean;
            message?: string;
         }>(`/admin/blogs/${id}`);

         if (data.success) {
            toast.updateToast(toastId, "Xóa bài viết thành công!", "success");
            setShowDeleteModal(false);
            // Không setSubmitting(false), giữ disable cho đến khi redirect
            setTimeout(() => router.push("/admin/blogs"), 1500);
         } else {
            toast.updateToast(toastId, data.message || "Xóa thất bại", "error");
            setSubmitting(false);
         }
      } catch (err: any) {
         toast.updateToast(
            toastId,
            err.message || "Lỗi kết nối server",
            "error"
         );
         setSubmitting(false);
      }
   };

   if (fetchLoading) return <Loading />;

   if (!originalBlog) {
      return (
         <ErrorState
            title="Không tìm thấy bài viết"
            message="Bài blog bạn đang tìm không tồn tại hoặc đã bị xóa."
            buttonText="Quay lại danh sách blog"
            redirect="/admin/blogs"
         />
      );
   }

   return (
      <>
         <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
               <div className="px-4 py-4 flex items-center justify-between">
                  <button
                     onClick={() => router.back()}
                     className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition disabled:opacity-50"
                     disabled={submitting}
                  >
                     <ArrowLeft className="w-5 h-5" />
                     Quay lại
                  </button>
                  <h1 className="text-xl font-bold text-gray-900">
                     Chỉnh sửa bài viết
                  </h1>
                  <button
                     onClick={() => setShowDeleteModal(true)}
                     disabled={submitting}
                     className="flex items-center gap-2 text-red-600 hover:text-red-700 transition disabled:opacity-50"
                  >
                     <Trash2 className="w-5 h-5" />
                     <span className="hidden sm:inline">Xóa</span>
                  </button>
               </div>
            </div>

            <div className="px-4 py-8">
               {/* Info */}
               <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg text-sm text-blue-700">
                  <p>
                     <strong>Ngày tạo:</strong>{" "}
                     {new Date(originalBlog.createdAt).toLocaleString("vi-VN")}
                  </p>
                  <p>
                     <strong>Cập nhật lần cuối:</strong>{" "}
                     {new Date(originalBlog.updatedAt).toLocaleString("vi-VN")}
                  </p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Grid layout cho Tiêu đề, Mô tả và Ảnh */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     {/* Tiêu đề và Mô tả */}
                     <div className="lg:col-span-2 space-y-6">
                        {/* Tiêu đề */}
                        <div className="bg-white rounded-2xl p-6">
                           <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Tiêu đề bài viết{" "}
                              <span className="text-red-500">*</span>
                           </label>
                           <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Nhập tiêu đề..."
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition"
                              disabled={submitting}
                           />
                           {formData.slug && (
                              <p className="mt-2 text-xs text-gray-500">
                                 Slug:{" "}
                                 <span className="font-mono text-pink-600">
                                    {formData.slug}
                                 </span>
                              </p>
                           )}
                        </div>

                        {/* Mô tả ngắn */}
                        <div className="bg-white rounded-2xl p-6">
                           <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Mô tả ngắn <span className="text-red-500">*</span>
                           </label>
                           <textarea
                              name="description"
                              value={formData.description}
                              onChange={handleInputChange}
                              rows={3}
                              placeholder="Nhập mô tả ngắn..."
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none resize-none transition"
                              disabled={submitting}
                           />
                           <p className="mt-2 text-sm text-gray-500">
                              {formData.description.length} ký tự
                           </p>
                        </div>
                     </div>

                     {/* Ảnh đại diện */}
                     <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 lg:sticky lg:top-24">
                           <label className="block text-sm font-semibold text-gray-700 mb-4">
                              Ảnh đại diện
                           </label>

                           {!imagePreview ? (
                              <div
                                 onClick={() => fileInputRef.current?.click()}
                                 className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition group"
                              >
                                 <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4 group-hover:text-pink-600 transition" />
                                 <p className="text-sm font-medium text-gray-700 mb-2">
                                    Nhấp để tải ảnh lên
                                 </p>
                                 <p className="text-xs text-gray-500">
                                    PNG, JPG, GIF • Tối đa 5MB • Khuyến nghị
                                    800x400px
                                 </p>
                                 <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    disabled={submitting}
                                 />
                              </div>
                           ) : (
                              <div className="relative group">
                                 <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-64 object-cover rounded-xl shadow-md"
                                 />
                                 {imageChanged && (
                                    <button
                                       type="button"
                                       onClick={removeImage}
                                       disabled={submitting}
                                       className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition opacity-0 group-hover:opacity-100 shadow-lg"
                                    >
                                       <X className="w-4 h-4" />
                                    </button>
                                 )}
                                 <button
                                    type="button"
                                    onClick={() =>
                                       fileInputRef.current?.click()
                                    }
                                    disabled={submitting}
                                    className="absolute bottom-2 right-2 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition opacity-0 group-hover:opacity-100 flex items-center gap-1 shadow-lg"
                                 >
                                    <Upload className="w-4 h-4" />
                                    Đổi ảnh
                                 </button>
                                 <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    disabled={submitting}
                                 />
                              </div>
                           )}

                           {imageChanged && (
                              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                 <p className="text-xs text-yellow-800">
                                    Ảnh mới sẽ được cập nhật khi bạn lưu
                                 </p>
                              </div>
                           )}

                           <div className="mt-6 space-y-3 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                 <span className="text-pink-600">✓</span>
                                 <span>Kích thước khuyến nghị: 800x400px</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className="text-pink-600">✓</span>
                                 <span>Định dạng: JPG, PNG, GIF</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className="text-pink-600">✓</span>
                                 <span>Dung lượng tối đa: 5MB</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* CKEditor - Full Width */}
                  <div className="bg-white rounded-2xl p-6">
                     <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-semibold text-gray-700">
                           Nội dung bài viết{" "}
                           <span className="text-red-500">*</span>
                        </label>
                        <button
                           type="button"
                           onClick={() => setShowPreview(!showPreview)}
                           className="flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700 transition"
                        >
                           <Eye className="w-4 h-4" />
                           {showPreview ? "Ẩn xem trước" : "Xem trước"}
                        </button>
                     </div>

                     {!showPreview ? (
                        <div className="ckeditor-wrapper">
                           <CkEditor
                              editorData={editorContent}
                              setEditorData={setEditorContent}
                              handleOnUpdate={(content) =>
                                 setEditorContent(content)
                              }
                           />
                        </div>
                     ) : (
                        <div
                           className="w-full min-h-[400px] px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 prose prose-sm max-w-none overflow-auto"
                           dangerouslySetInnerHTML={{
                              __html: editorContent,
                           }}
                        />
                     )}

                     <p className="mt-4 text-sm text-gray-500">
                        Sử dụng thanh công cụ để định dạng, chèn ảnh, bảng, liên
                        kết...
                     </p>
                  </div>

                  {/* Nút lưu */}
                  <button
                     type="submit"
                     disabled={submitting}
                     className="w-full bg-linear-to-r from-pink-600 to-purple-600 text-white py-4 rounded-xl font-semibold transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                  >
                     {submitting ? (
                        <>
                           <Loader2 className="w-5 h-5 animate-spin" />
                           Đang cập nhật...
                        </>
                     ) : (
                        <>
                           <Save className="w-5 h-5" />
                           Cập nhật bài viết
                        </>
                     )}
                  </button>
               </form>
            </div>
         </div>

         {/* Modal Xóa */}
         <DeleteConfirmModal
            open={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
            title="Xóa bài viết vĩnh viễn"
            message="Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác."
            entityName={originalBlog.name}
            details={
               <>
                  <p className="mt-2 text-xs text-gray-600">
                     Slug:{" "}
                     <span className="font-medium">{originalBlog.slug}</span>
                  </p>
                  <p className="text-xs text-gray-600">
                     Ngày tạo:{" "}
                     {new Date(originalBlog.createdAt).toLocaleDateString(
                        "vi-VN"
                     )}
                  </p>
                  {originalBlog.description && (
                     <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                        "{originalBlog.description}"
                     </p>
                  )}
               </>
            }
            confirmText={submitting ? "Đang xóa..." : "Xóa vĩnh viễn"}
            cancelText="Hủy"
         />
      </>
   );
};

export default EditBlog;
