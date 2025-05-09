
export default async function handleSuaSanPham(formData: FormData) {
    // Lấy giá trị từ formData
    let sp = {
      product_id: formData.get("id"),
      name: formData.get("name"),
      img: formData.get("img") || null,
      price: formData.get("price"),
      discount_price: formData.get("discount_price"),
      description: formData.get("description"),
      category_id: formData.get("category_id"),
      stock: formData.get("stock"),
      hot: formData.get("hot") === "1" ? true : false,  // Kiểm tra xem "hot" có phải là "1" hay không
    };
  
    // Kiểm tra thông tin formData
    console.log("FormData:", sp);  // Đảm bảo formData có đầy đủ giá trị
  
    // Kiểm tra nếu name là rỗng
    if (!sp.name) {
      console.error("Name is required!");
      return;
    }
  
    // Cấu hình request
    let opt = {
      method: "PUT",  // Chuyển thành PUT vì chúng ta đang sửa dữ liệu
      body: JSON.stringify(sp),
      headers: { 'Content-Type': 'application/json' },
    };
  
    try {
      // Gửi request và xử lý phản hồi
      const res = await fetch(`http://localhost:3000/api/admin/suasanpham/${sp.product_id}`, opt);
  
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
  
      const data = await res.json();
      console.log("Kết quả sửa sản phẩm:", data);
  
    } catch (error) {
      console.error("Error occurred while updating product:", error);
    }
  
    console.log("Thông tin sản phẩm sửa:", sp);
  }
  