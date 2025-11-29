const Loading = () => {
   return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
         <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
         </div>
      </div>
   );
};
export default Loading;
