"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Category, Product, ProductFormData, ApiResponse } from "../../types";
import { useToast } from "@contexts/ToastContext";
import Loading from "@components/admin/Loading";
import ErrorState from "@components/admin/ErrorState";
import apiRequest from "@lib/api";
export default function EditProductPage() {
   const router = useRouter();
   const params = useParams();
   const id = params.id as string;
   const toast = useToast();
   const [categories, setCategories] = useState<Category[]>([]);
   const [product, setProduct] = useState<Product | null>(null);
   const [formData, setFormData] = useState<ProductFormData>({
      name: "",
      description: "",
      detailedDescription: "",
      price: "",
      categoryName: "",
      stock: "",
   });

   const [imageFile, setImageFile] = useState<File | null>(null);
   const [imagePreview, setImagePreview] = useState<string | null>(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      const loadCategories = async () => {
         try {
            const data = await apiRequest.get<ApiResponse<Category[]>>(
               "/admin/categories"
            );
            if (data.success) {
               setCategories(data.data || []);
            } else {
               toast.error("Không thể tải danh mục");
            }
         } catch (err: any) {
            toast.error(err.message || "Lỗi kết nối server");
         }
      };
      loadCategories();
   }, []);

   const fetchProduct = async () => {
      try {
         setLoading(true);
         const result = await apiRequest.get<ApiResponse<any>>(
            `/admin/products/${id}`
         );

         if (result.success && result.data) {
            const prod = result.data.product || result.data;
            setProduct(prod);

            const categoryExists = categories.find(
               (c) => c.name === prod.category
            );
            if (!categoryExists) {
               toast.error(
                  `Cảnh báo: Danh mục "${prod.category}" không tồn tại`
               );
            }

            setFormData({
               name: prod.name,
               description: prod.description || "",
               detailedDescription: prod.detailedDescription || "",
               price: prod.price.toString(),
               categoryName: prod.category,
               stock: prod.stock.toString(),
            });
         } else {
            toast.error("Không tìm thấy sản phẩm");
            setTimeout(() => router.push("/admin/products"), 2000);
         }
      } catch (err: any) {
         toast.error(err.message || "Lỗi kết nối server");
         setTimeout(() => router.push("/admin/products"), 2000);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (!id || categories.length === 0) return;
      fetchProduct();
   }, [id, categories]);

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
         toast.error("Chỉ chấp nhận file JPG hoặc PNG");
         return;
      }

      if (file.size > 10 * 1024 * 1024) {
         toast.error("Ảnh không được quá 10MB");
         return;
      }

      setImageFile(file);
      setImagePreview(null);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (saving) return;

      if (
         !formData.name.trim() ||
         !formData.categoryName ||
         !formData.price ||
         !formData.stock
      ) {
         toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
         return;
      }

      const categoryExists = categories.find(
         (c) => c.name === formData.categoryName
      );
      if (!categoryExists) {
         toast.error("Danh mục không hợp lệ");
         return;
      }

      setSaving(true);
      const toastId = toast.loading("Đang cập nhật sản phẩm...");

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append(
         "detailedDescription",
         formData.detailedDescription.trim()
      );
      formDataToSend.append("price", formData.price);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("category", formData.categoryName);
      if (imageFile) formDataToSend.append("image", imageFile);

      try {
         const result = await apiRequest.put<ApiResponse<any>>(
            `/admin/products/${id}`,
            formDataToSend
         );

         if (result.success) {
            toast.updateToast(
               toastId,
               "Cập nhật sản phẩm thành công!",
               "success"
            );
            setTimeout(() => router.push("/admin/products"), 1500);
         } else {
            toast.updateToast(
               toastId,
               result.message || "Cập nhật thất bại",
               "error"
            );
            setSaving(false);
         }
      } catch (err: any) {
         // Thử lại không có ảnh nếu có lỗi và có file ảnh
         if (imageFile) {
            try {
               const formDataNoImage = new FormData();
               formDataNoImage.append("name", formData.name.trim());
               formDataNoImage.append(
                  "description",
                  formData.description.trim()
               );
               formDataNoImage.append(
                  "detailedDescription",
                  formData.detailedDescription.trim()
               );
               formDataNoImage.append("price", formData.price);
               formDataNoImage.append("stock", formData.stock);
               formDataNoImage.append("category", formData.categoryName);

               const result2 = await apiRequest.put<ApiResponse<any>>(
                  `/admin/products/${id}`,
                  formDataNoImage
               );

               if (result2.success) {
                  toast.updateToast(
                     toastId,
                     "Lưu thành công (ảnh không cập nhật)",
                     "info"
                  );
                  setTimeout(() => router.push("/admin/products"), 2000);
               } else {
                  toast.updateToast(
                     toastId,
                     result2.message || "Cập nhật thất bại",
                     "error"
                  );
                  setSaving(false);
               }
            } catch (err2: any) {
               toast.updateToast(
                  toastId,
                  err2.message || "Lỗi kết nối server",
                  "error"
               );
               setSaving(false);
            }
         } else {
            toast.updateToast(
               toastId,
               err.message || "Lỗi kết nối server",
               "error"
            );
            setSaving(false);
         }
      }
   };

   if (loading) return <Loading />;
   if (!product) return <ErrorState redirect="/admin/products" />;

   return (
      <div className="min-h-screen bg-gray-50 p-6">
         <div>
            <div className="mb-8 flex justify-between items-center">
               <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                     Chỉnh sửa sản phẩm
                  </h1>
                  <p className="text-gray-600">
                     Cập nhật thông tin sản phẩm "{product.name}"
                  </p>
               </div>
               <Link
                  href="/admin/products"
                  className="px-6 py-3 border rounded-xl hover:bg-gray-50 transition"
               >
                  Quay lại
               </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
               <form
                  onSubmit={handleSubmit}
                  className="grid lg:grid-cols-3 gap-8"
               >
                  {/* Cột ảnh */}
                  <div>
                     <label className="block text-sm font-semibold mb-4">
                        Ảnh sản phẩm
                     </label>

                     <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                           Ảnh hiện tại
                        </p>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                           <Image
                              src={product.image}
                              alt={product.name}
                              width={400}
                              height={400}
                              className="w-full h-64 object-cover rounded-lg"
                              onError={(e) => {
                                 e.currentTarget.src =
                                    "/img/fallback/no-image.jpg";
                              }}
                           />
                        </div>
                     </div>

                     <div>
                        <p className="text-sm text-gray-600 mb-2">
                           Ảnh mới (nếu muốn thay đổi)
                        </p>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition h-64">
                           {imagePreview ? (
                              <div className="relative h-full">
                                 <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    width={400}
                                    height={400}
                                    className="w-full h-full object-cover rounded-xl"
                                 />
                                 <button
                                    type="button"
                                    onClick={() => {
                                       setImageFile(null);
                                       setImagePreview(null);
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                                 >
                                    <svg
                                       className="w-4 h-4"
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
                           ) : (
                              <label className="flex flex-col items-center justify-center h-full text-gray-500 cursor-pointer">
                                 <svg
                                    className="w-16 h-16 mb-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                 >
                                    <path
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                       strokeWidth={2}
                                       d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                 </svg>
                                 <p className="text-sm mb-1">
                                    Click để chọn ảnh mới
                                 </p>
                                 <p className="text-xs text-gray-400">
                                    JPG, PNG - Tối đa 10MB
                                 </p>
                                 <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    disabled={saving}
                                 />
                              </label>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Form thông tin */}
                  <div className="lg:col-span-2 space-y-6">
                     <div className="grid md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-medium mb-2">
                              Tên sản phẩm{" "}
                              <span className="text-red-500">*</span>
                           </label>
                           <input
                              type="text"
                              value={formData.name}
                              onChange={(e) =>
                                 setFormData({
                                    ...formData,
                                    name: e.target.value,
                                 })
                              }
                              required
                              disabled={saving}
                              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium mb-2">
                              Danh mục <span className="text-red-500">*</span>
                           </label>
                           <select
                              value={formData.categoryName}
                              onChange={(e) =>
                                 setFormData({
                                    ...formData,
                                    categoryName: e.target.value,
                                 })
                              }
                              required
                              disabled={saving}
                              className="w-full px-4 py-2.5 border rounded-lg outline-none"
                           >
                              <option value="">-- Chọn danh mục --</option>
                              {categories.map((cat) => (
                                 <option key={cat._id} value={cat.name}>
                                    {cat.name}
                                 </option>
                              ))}
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium mb-2">
                              Giá bán (₫){" "}
                              <span className="text-red-500">*</span>
                           </label>
                           <input
                              type="number"
                              min="0"
                              value={formData.price}
                              onChange={(e) =>
                                 setFormData({
                                    ...formData,
                                    price: e.target.value,
                                 })
                              }
                              required
                              disabled={saving}
                              className="w-full px-4 py-2.5 border rounded-lg outline-none"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium mb-2">
                              Tồn kho <span className="text-red-500">*</span>
                           </label>
                           <input
                              type="number"
                              min="0"
                              value={formData.stock}
                              onChange={(e) =>
                                 setFormData({
                                    ...formData,
                                    stock: e.target.value,
                                 })
                              }
                              required
                              disabled={saving}
                              className="w-full px-4 py-2.5 border rounded-lg outline-none"
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-medium mb-2">
                           Mô tả ngắn <span className="text-red-500">*</span>
                        </label>
                        <textarea
                           rows={3}
                           value={formData.description}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 description: e.target.value,
                              })
                           }
                           required
                           disabled={saving}
                           className="w-full px-4 py-2.5 border rounded-lg resize-none outline-none"
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium mb-2">
                           Mô tả chi tiết (tùy chọn)
                        </label>
                        <textarea
                           rows={5}
                           value={formData.detailedDescription}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 detailedDescription: e.target.value,
                              })
                           }
                           disabled={saving}
                           className="w-full px-4 py-2.5 border rounded-lg resize-none font-mono text-sm outline-none"
                        />
                     </div>

                     <div className="flex justify-end gap-4 pt-6 border-t">
                        <Link
                           href="/admin/products"
                           className="px-8 py-3 border rounded-xl hover:bg-gray-50 transition"
                        >
                           Hủy bỏ
                        </Link>
                        <button
                           type="submit"
                           disabled={saving}
                           className="px-10 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3"
                        >
                           {saving && (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           )}
                           {saving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                     </div>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
}
