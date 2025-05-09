# Dự án Bán Hàng

Dự án bán hàng sử dụng **React**, **Next.js** cho frontend và **Node.js** với **Express** cho backend.

## Mô Tả

Dự án này là một ứng dụng bán hàng online cho phép người dùng xem và mua sản phẩm. Ứng dụng sử dụng **React** và **Next.js** cho phần giao diện người dùng, giúp tối ưu hiệu suất và SEO. **Node.js** và **Express** được sử dụng cho phần backend để xử lý các yêu cầu API và quản lý cơ sở dữ liệu.

## Các Thành Phần Chính

- **Frontend**: 
  - **React**: Thư viện JavaScript cho giao diện người dùng.
  - **Next.js**: Framework cho React, hỗ trợ SSR (Server-Side Rendering) và SSG (Static Site Generation).
  
- **Backend**:
  - **Node.js**: Môi trường chạy JavaScript cho backend.
  - **Express**: Framework giúp xây dựng API nhanh chóng và dễ dàng.
  
- **Cơ sở dữ liệu**:
  - Có thể sử dụng MongoDB hoặc MySQL tùy vào yêu cầu dự án.

## Cài Đặt và Chạy Dự Án

### Cài Đặt Frontend

1. Clone repository:

   ```bash
   git clone https://github.com/username/duanbanhang.git
   cd duanbanhang/frontend
2. Cài đặt các dependencies:
    ```bash
    npm install
4. Chạy ứng dụng:
    ```bash
    npm run dev
Ứng dụng sẽ chạy ở địa chỉ: http://localhost:3000

### Cài Đặt Backend
1. Chuyển đến thư mục backend:
     ```bash
      cd duanbanhang/backend
2. Cài đặt các dependencies:
     ```bash
    npm install
3. Chạy server:
     ```bash
    npm start
Server sẽ chạy ở địa chỉ: http://localhost:5000

 ### Các Tính Năng Chính
 #### Frontend:

Trang chủ hiển thị danh sách sản phẩm.

Trang chi tiết sản phẩm.

Giỏ hàng và thanh toán.

#### Backend:

API để lấy danh sách sản phẩm.

API để xử lý đơn hàng và thanh toán.

Xác thực người dùng (nếu có).

Các Công Nghệ Sử Dụng
React

Next.js

Node.js

Express

MongoDB / MySQL

Các Câu Lệnh Hữu Ích
Chạy frontend: npm run dev (Frontend chạy trên port 3000)

Chạy backend: npm start (Backend chạy trên port 5000)
