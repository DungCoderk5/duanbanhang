"use server";
export default async function handleThemLoai(formData: FormData) {
  // Lấy giá trị từ formData
  let loai = {
    name: formData.get("name"),
    parent_id: formData.get("parent_id") || null,  // Nếu parent_id không có thì set thành null
  };

  // Kiểm tra nếu name là rỗng
  if (!loai.name) {
    console.error("Name is required!");
    return;
  }

  // Cấu hình request
  let opt = {
    method: "POST",
    body: JSON.stringify(loai),
    headers: { 'Content-Type': 'application/json' },
  };

  try {
    // Gửi request và xử lý phản hồi
    const res = await fetch('http://localhost:3000/api/admin/themloai', opt);

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    const data = await res.json();
    console.log("Kết quả thêm loại:", data);

  } catch (error) {
    console.error("Error occurred while adding category:", error);
  }

  console.log("Thông tin loại:", loai);
}
