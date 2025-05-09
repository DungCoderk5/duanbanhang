import "./css1.css";
import "./sccc.css";
import Link from "next/link";
import AdminGuard from "@/app/(client)/components/AdminGuard ";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="vi">
  <body className="bg-[#f3f4f6]">
    <div className="w-full m-auto">
     
    <div className="sidebar">
        <h2>Dashdark X</h2>
        <ul>
            <li><a href="/admin" className="">Dashboard</a></li>
            <li><a href="/admin/nguoi_dung">Quản lý người dùng</a></li>
            <li><a href="/admin/loai">Quản lý loại hàng</a></li>
            <li><a href="/admin/san_pham">Quản lý sản phẩm</a></li>
            <li><a href="/admin/binh_luan">Quản lý bình luận</a></li>
            <li><a href="#">Authentication</a></li>
            <li><a href="/">Quay về web</a></li>
        </ul>
    </div>
      <main className="main-content">{children}</main>
      <AdminGuard>
      <div>
        <h1 className="text-2xl font-bold">👑 Quản lý admin</h1>
        {/* Nội dung trang admin ở đây */}
      </div>
    </AdminGuard>
    </div>
  </body>
</html>
)}
