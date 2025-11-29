const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

class ApiRequest {
   private async request<T>(
      endpoint: string,
      options: RequestInit & {
         noAuth?: boolean; // chỉ dùng khi gọi API public như login, register
         params?: Record<string, any>;
      } = {}
   ): Promise<T> {
      const { noAuth = false, params, ...fetchOptions } = options;

      let url = `${BASE_URL}${endpoint}`;

      // Thêm query params nếu có
      if (params) {
         const searchParams = new URLSearchParams();
         Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
               searchParams.append(key, String(value));
            }
         });
         const searchParamsString = searchParams.toString();

         if (searchParams) {
            url += `?${searchParamsString}`;
         }
      }

      // Quan trọng nhất: luôn bật credentials trừ khi noAuth = true
      const shouldSendCredentials = !noAuth;

      try {
         const response = await fetch(url, {
            ...fetchOptions,
            credentials: shouldSendCredentials ? "include" : "omit",
            headers: {
               // Chỉ set Content-Type khi gửi JSON
               ...(fetchOptions.body instanceof FormData
                  ? {}
                  : { "Content-Type": "application/json" }),
               ...fetchOptions.headers,
            },
            body:
               fetchOptions.body && !(fetchOptions.body instanceof FormData)
                  ? JSON.stringify(fetchOptions.body)
                  : fetchOptions.body,
         });

         // Xử lý 401: tự động logout hoặc redirect login
         if (response.status === 401) {
            // Nếu là trang admin hoặc cần login
            if (typeof window !== "undefined") {
               window.location.href = "/login?expired=1";
            }
            throw new Error("Phiên đăng nhập hết hạn");
         }

         if (!response.ok) {
            let errorMessage = "Lỗi máy chủ";
            try {
               const errorData =
                  response.status === 204 ? null : await response.json();
               errorMessage = errorData?.message || errorMessage;
            } catch {
               // ignore
            }
            throw new Error(errorMessage);
         }

         // 204 No Content
         if (response.status === 204) return null as T;

         return await response.json();
      } catch (error: any) {
         if (error.name === "TypeError" && error.message.includes("fetch")) {
            throw new Error("Không thể kết nối đến server");
         }
         throw error;
      }
   }

   // Public methods
   get<T>(endpoint: string, options?: { params?: any; noAuth?: boolean }) {
      return this.request<T>(endpoint, { ...options, method: "GET" });
   }

   post<T>(endpoint: string, body?: any, options?: { noAuth?: boolean }) {
      return this.request<T>(endpoint, { ...options, method: "POST", body });
   }

   put<T>(endpoint: string, body?: any, options?: { noAuth?: boolean }) {
      return this.request<T>(endpoint, { ...options, method: "PUT", body });
   }

   patch<T>(endpoint: string, body?: any, options?: { noAuth?: boolean }) {
      return this.request<T>(endpoint, { ...options, method: "PATCH", body });
   }

   delete<T>(endpoint: string, options?: { noAuth?: boolean }) {
      return this.request<T>(endpoint, { ...options, method: "DELETE" });
   }
}

const apiRequest = new ApiRequest();

export default apiRequest;
