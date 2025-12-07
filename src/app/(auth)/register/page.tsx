"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
   const router = useRouter();
   const [formData, setFormData] = useState({
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
   });
   const [loading, setLoading] = useState(false);
   const [errors, setErrors] = useState<{ [key: string]: string }>({});
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setErrors({});

      if (formData.password !== formData.confirmPassword) {
         setErrors({ confirmPassword: "Mật khẩu xác nhận không khớp" });
         setLoading(false);
         return;
      }

      try {
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/client/auth/register`,
            {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(formData),
            }
         );

         const data = await res.json();

         if (!res.ok || !data.success) {
            // Handle specific errors từ Zod
            if (data.errors && Array.isArray(data.errors)) {
               const fieldErrors: { [key: string]: string } = {};
               data.errors.forEach(
                  (err: { field: string; message: string }) => {
                     fieldErrors[err.field] = err.message;
                  }
               );
               setErrors(fieldErrors);
               toast.error(data.message || "Đăng ký thất bại");
               return;
            }
            throw new Error(data.message || "Đăng ký thất bại");
         }

         toast.success(data.message || "Đăng ký thành công");
         setFormData({
            name: "",
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
         });
         router.push("/login");
      } catch (error) {
         toast.error((error as Error).message);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="max-w-md mx-auto py-4 px-4 relative">
         <div className="bg-white rounded-lg shadow-md py-3 px-8">
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
               Đăng ký
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="block mb-1 font-medium text-gray-700">
                     Họ và tên:
                  </label>
                  <input
                     type="text"
                     placeholder="Họ và tên"
                     value={formData.name}
                     onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                     }
                     className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                     }`}
                     required
                  />
                  {errors.name && (
                     <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
               </div>

               <div>
                  <label className="block mb-1 font-medium text-gray-700">
                     Tài khoản:
                  </label>
                  <input
                     type="text"
                     placeholder="Tài khoản"
                     autoComplete="username"
                     value={formData.username}
                     onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                     }
                     className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.username ? "border-red-500" : "border-gray-300"
                     }`}
                     required
                  />
                  {errors.username && (
                     <p className="text-red-500 text-sm mt-1">
                        {errors.username}
                     </p>
                  )}
               </div>

               <div>
                  <label className="block mb-1 font-medium text-gray-700 ">
                     Email:
                  </label>
                  <input
                     type="email"
                     placeholder="Email"
                     autoComplete="email"
                     value={formData.email}
                     onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                     }
                     className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                     }`}
                     required
                  />
                  {errors.email && (
                     <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
               </div>

               <div>
                  <label className="block mb-1 font-medium text-gray-700">
                     Mật khẩu:
                  </label>
                  <div className="relative">
                     <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mật khẩu"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={(e) =>
                           setFormData({
                              ...formData,
                              password: e.target.value,
                           })
                        }
                        className={`w-full pr-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                           errors.password
                              ? "border-red-500"
                              : "border-gray-300"
                        }`}
                        required
                     />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[38%] text-gray-500 hover:text-gray-700 cursor-pointer"
                     >
                        {showPassword ? (
                           <EyeOff size={20} />
                        ) : (
                           <Eye size={20} />
                        )}
                     </button>
                  </div>
                  {errors.password && (
                     <p className="text-red-500 text-sm mt-1">
                        {errors.password}
                     </p>
                  )}
               </div>

               <div>
                  <label className="block mb-1 font-medium text-gray-700">
                     Nhập lại mật khẩu:
                  </label>
                  <div className="relative">
                     <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu"
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                           setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                           })
                        }
                        className={`w-full pr-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                           errors.confirmPassword
                              ? "border-red-500"
                              : "border-gray-300"
                        }`}
                        required
                     />
                     <button
                        type="button"
                        onClick={() =>
                           setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-[38%] text-gray-500 hover:text-gray-700 cursor-pointer"
                     >
                        {showConfirmPassword ? (
                           <EyeOff size={20} />
                        ) : (
                           <Eye size={20} />
                        )}
                     </button>
                  </div>
                  {errors.confirmPassword && (
                     <p className="text-red-500 text-sm mt-1">
                        {errors.confirmPassword}
                     </p>
                  )}
               </div>

               <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer ${
                     loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
               >
                  {loading ? "Đang đăng ký..." : "Đăng ký"}
               </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
               Đã có tài khoản?{" "}
               <Link href="/login" className="text-amber-500 hover:underline">
                  Đăng nhập
               </Link>
            </p>
         </div>
      </div>
   );
}
