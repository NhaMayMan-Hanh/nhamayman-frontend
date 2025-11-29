import React from "react";
import { useRouter } from "next/navigation";

interface ErrorStateProps {
   title?: string;
   message?: string;
   buttonText?: string;
   redirect?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
   title = "Có lỗi xảy ra",
   message = "Không thể tải dữ liệu.",
   buttonText = "Quay lại",
   redirect = "/",
}) => {
   const router = useRouter();

   return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
         <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
               onClick={() => router.push(redirect)}
               className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-300 hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-blue-300 cursor-pointer"
            >
               {buttonText}
            </button>
         </div>
      </div>
   );
};

export default ErrorState;
