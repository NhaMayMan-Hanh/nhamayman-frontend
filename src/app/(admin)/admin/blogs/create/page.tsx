"use client";

import { useState, useRef, ChangeEvent, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
   ArrowLeft,
   Save,
   Upload,
   X,
   Loader2,
   Eye,
   ImageIcon,
} from "lucide-react";
import type { BlogFormData, BlogCreateResponse } from "../types";
import { generateSlug } from "@components/admin/helpers/generateSlug";
import { useToast } from "@contexts/ToastContext";
import apiRequest from "@lib/api";
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
const CreateBlogs = () => {
   const router = useRouter();
   const fileInputRef = useRef<HTMLInputElement>(null);
   const toast = useToast();

   const [formData, setFormData] = useState<BlogFormData>({
      name: "",
      slug: "",
      description: "",
      content: "",
      img: null,
   });
   const [editorContent, setEditorContent] = useState<string>("");
   const [imagePreview, setImagePreview] = useState<string>("");
   const [loading, setLoading] = useState<boolean>(false);
   const [showPreview, setShowPreview] = useState<boolean>(false);
   const handleInputChange = useCallback(
      (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      },
      []
   );
   const handleImageChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
         const file = e.target.files?.[0];
         if (!file) return;

         if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước ảnh quá lớn (tối đa 5MB)");
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
      },
      [toast]
   );

   const removeImage = useCallback(() => {
      setFormData((prev) => ({ ...prev, img: null }));
      setImagePreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
   }, []);

   // Cập nhật nội dung từ CKEditor
   const handleEditorUpdate = useCallback((content: string) => {
      setEditorContent(content);
   }, []);

   // Submit form
   const handleSubmit = useCallback(
      async (e: FormEvent<HTMLFormElement>) => {
         e.preventDefault();

         if (!formData.name.trim())
            return toast.error("Vui lòng nhập tiêu đề bài viết");
         if (!formData.description.trim())
            return toast.error("Vui lòng nhập mô tả ngắn");
         if (!editorContent.trim())
            return toast.error("Vui lòng nhập nội dung bài viết");
         if (!formData.img) return toast.error("Vui lòng chọn ảnh đại diện");
         const toastId = toast.loading("Đang tạo bài viết mới...");
         const submitData = new FormData();
         submitData.append("name", formData.name);
         submitData.append("slug", formData.slug);
         submitData.append("description", formData.description);
         submitData.append("content", editorContent);
         submitData.append("img", formData.img as File);
         try {
            setLoading(true);
            const data = await apiRequest.post<BlogCreateResponse>(
               "/admin/blogs",
               submitData
            );
            if (data.success) {
               toast.updateToast(
                  toastId,
                  "Tạo bài viết thành công!",
                  "success"
               );
               setTimeout(() => router.push("/admin/blogs"), 800);
            } else {
               toast.updateToast(
                  toastId,
                  data.message || "Tạo bài viết thất bại",
                  "error"
               );
            }
         } catch (err: any) {
            toast.updateToast(
               toastId,
               err.message || "Lỗi kết nối server",
               "error"
            );
            console.error("Create blog error:", err);
         } finally {
            setLoading(false);
         }
      },
      [formData, editorContent, toast, router]
   );
   const togglePreview = useCallback(() => {
      setShowPreview((prev) => !prev);
   }, []);
   return (
      <div className="min-h-screen bg-gray-50">
         {/* Header */}
         <div className="bg-white shadow-sm sticky top-0 z-10">
            <div className="px-4 py-4 flex items-center justify-between">
               <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition disabled:opacity-50"
                  disabled={loading}
               >
                  <ArrowLeft className="w-5 h-5" />
                  Quay lại
               </button>
               <h1 className="text-xl font-bold text-gray-900">
                  Tạo bài viết mới
               </h1>
               <div className="w-20" />
            </div>
         </div>

         <div className="px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Form chính */}
               <div className="lg:col-span-2">
                  <form onSubmit={handleSubmit} className="space-y-6">
                     {/* Tiêu đề */}
                     <div className="bg-white rounded-2xl shadow-sm p-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Tiêu đề bài viết{" "}
                           <span className="text-red-500">*</span>
                        </label>
                        <input
                           type="text"
                           name="name"
                           value={formData.name}
                           onChange={handleInputChange}
                           placeholder="Nhập tiêu đề bài viết..."
                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition"
                           disabled={loading}
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
                     <div className="bg-white rounded-2xl shadow-sm p-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Mô tả ngắn <span className="text-red-500">*</span>
                        </label>
                        <textarea
                           name="description"
                           value={formData.description}
                           onChange={handleInputChange}
                           rows={3}
                           placeholder="Nhập mô tả ngắn về bài viết..."
                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none resize-none transition"
                           disabled={loading}
                        />
                        <p className="mt-2 text-sm text-gray-500">
                           {formData.description.length} ký tự
                        </p>
                     </div>

                     {/* Nội dung với CKEditor */}
                     <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                           <label className="text-sm font-semibold text-gray-700">
                              Nội dung bài viết{" "}
                              <span className="text-red-500">*</span>
                           </label>
                           <button
                              type="button"
                              onClick={togglePreview}
                              className="flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700 transition"
                           >
                              <Eye className="w-4 h-4" />
                              {showPreview ? "Chỉnh sửa" : "Xem trước"}
                           </button>
                        </div>

                        {!showPreview ? (
                           <div className="ckeditor-wrapper">
                              <CkEditor
                                 editorData={editorContent}
                                 setEditorData={setEditorContent}
                                 handleOnUpdate={handleEditorUpdate}
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
                           Sử dụng thanh công cụ để định dạng văn bản, thêm hình
                           ảnh, liên kết, danh sách và bảng
                        </p>
                     </div>

                     {/* Nút tạo */}
                     <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-linear-to-r from-pink-600 to-purple-600 text-white py-4 rounded-xl font-semibold transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                     >
                        {loading ? (
                           <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Đang tạo bài viết...
                           </>
                        ) : (
                           <>
                              <Save className="w-5 h-5" />
                              Tạo bài viết mới
                           </>
                        )}
                     </button>
                  </form>
               </div>

               {/* Ảnh đại diện */}
               <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                     <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Ảnh đại diện <span className="text-red-500">*</span>
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
                              PNG, JPG, GIF • Tối đa 5MB • Khuyến nghị 800x400px
                           </p>
                           <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              disabled={loading}
                           />
                        </div>
                     ) : (
                        <div className="relative group">
                           <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-64 object-cover rounded-xl shadow-md"
                           />
                           <button
                              type="button"
                              onClick={removeImage}
                              disabled={loading}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition opacity-0 group-hover:opacity-100 shadow-lg"
                           >
                              <X className="w-4 h-4" />
                           </button>
                           <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={loading}
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
                              disabled={loading}
                           />
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
         </div>
      </div>
   );
};

export default CreateBlogs;
