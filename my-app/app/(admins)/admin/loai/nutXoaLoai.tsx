"use client";
import { useRouter } from "next/navigation";

export default function XoaSP({ id }: { id: number }) {
  const router = useRouter();

  const hamXoa = async () => {
    if (!confirm("Xóa sản phẩm này?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/admin/xoaloai/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Làm mới danh sách sản phẩm
        router.refresh();
        alert("Xóa sản phẩm thành công!");
      } else {
        const data = await res.json();
        alert(data.message || "Xóa sản phẩm thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      alert("Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại.");
    }
  };

  return (
    <button onClick={hamXoa}>
      <i className="fa-solid fa-trash"></i>
    </button>
  );
}
