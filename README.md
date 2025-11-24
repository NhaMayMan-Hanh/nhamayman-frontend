# 🌈 NhaMayMan-Hanh - E-commerce Gây Quỹ (Next.js & Node.js)

[![GitHub Organization](https://img.shields.io/badge/Organization-NhaMayMan--Hanh-blue.svg)](https://github.com/NhaMayMan-Hanh)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js-black.svg)](https://github.com/NhaMayMan-Hanh/frontend-repo-name)
[![Backend](https://img.shields.io/badge/Backend-Node.js%2FExpress-green.svg)](https://github.com/NhaMayMan-Hanh/backend-repo-name)

**NhaMayMan-Hanh** là một dự án thương mại điện tử chuyên bán đồ Handmade với mục tiêu gây quỹ. Dự án được xây dựng theo kiến trúc hiện đại, phân tách rõ ràng giữa Frontend (Next.js) và Backend (Node.js).

## ✨ Công nghệ Sử dụng

- **Frontend:** Next.js, Tailwind CSS, HTML.
- **Backend:** Node.js, ExpressJS, MongoDB, Zod (Data Validation), JWT (Authentication).

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

Để chạy dự án, bạn cần phải clone và setup cả hai repositories (Frontend và Backend).

### 1. Chuẩn bị Môi trường

Đảm bảo bạn đã cài đặt: **Node.js** (bao gồm npm) và **MongoDB** (Server Local hoặc Cloud Atlas).

### 2. Setup Backend (Repository: `backend-repo-name`)

1.  **Clone Repository:**
    ```bash
    git clone [https://github.com/NhaMayMan-Hanh/backend-repo-name.git](https://github.com/NhaMayMan-Hanh/backend-repo-name.git) # Thay bằng tên repo BE thực tế
    cd backend-repo-name
    ```
2.  **Cài đặt Dependencies:**
    ```bash
    npm install
    ```
3.  **Tạo file `.env`:** Tạo file `.env` và điền cấu hình như sau:
    ```dotenv
    MONGODB_URI="mongodb://127.0.0.1:27017/nhamayman"
    JWT_SECRET="something-very-secret"
    CLIENT_URL="http://localhost:3000"
    ASSET_BASE_URL="http://localhost:5000"
    PORT=5000
    ```
4.  **Khởi tạo Database (Seeding):**
    ```bash
    npm run seed
    ```
5.  **Chạy Server Backend:**
    ```bash
    npm run dev
    ```

### 3. Setup Frontend (Repository: `frontend-repo-name`)

1.  **Clone Repository:**
    ```bash
    git clone [https://github.com/NhaMayMan-Hanh/frontend-repo-name.git](https://github.com/NhaMayMan-Hanh/frontend-repo-name.git) # Thay bằng tên repo FE thực tế
    cd frontend-repo-name
    ```
2.  **Cài đặt Dependencies:**
    ```bash
    npm install
    ```
3.  **Tạo file `.env.local`:** Tạo file `.env.local` và điền cấu hình để kết nối với Backend:
    ```dotenv
    NEXT_PUBLIC_API_URL="http://localhost:5000/api" # Chú ý cổng 5000 của BE
    NEXT_PUBLIC_IMAGE_URL="http://localhost:5000"
    ```
4.  **Chạy Server Frontend:**
    ```bash
    npm run dev
    ```

Truy cập: `http://localhost:3000` để xem ứng dụng. **Lưu ý:** Cần đảm bảo server Backend (cổng 5000) đã được khởi động trước.
