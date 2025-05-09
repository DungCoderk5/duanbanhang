'use client';
import { useState, useEffect } from "react";
// import { form } from "motion/react-client";
import { div } from "motion/react-client";
import UploadImage from "./uploadImage";
import handleThemSanPham from "./handlethemSanPham";
import { ILoai } from "@/app/(client)/components/cautrucdata";

export default function ThemLoai() {
    const sp = { name: "", img: "", price: 0, discount_price: 0, description: "", category_id: 0, stock: 0, hot: false }
    const [loai, setLoai] = useState<ILoai[]>([]); // Để lưu các danh mục sản phẩm
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/loai"); // API để lấy danh mục sản phẩm
                const data = await res.json();
                setLoai(data);
            } catch (err) {
                console.error("Lỗi khi tải danh mục sản phẩm:", err);
            }
        };

        fetchCategories();
    }, []);
    return (
        <div className="form-tt">
            <h2 className="!text-left">Thêm sản phẩm</h2>
            <form className="" action={handleThemSanPham}>
                <div className="mb-4">
                    {/* <label htmlFor="name" className="block text-lg font-semibold text-[#081028]">Name</label> */}
                    <input
                        type="text"
                        name="name"
                        id="name"
                        className=""
                        required
                        placeholder="Nhập tên sản phẩm"
                    />
                </div>

                <div className="mb-4">
                    {/* <label htmlFor="parent_id" className="block text-lg font-semibold text-[#081028]">Parent ID (optional)</label> */}
                    <UploadImage name="img" />
                    <input type="hidden" name="img" />
                </div>

                <div className="mb-4">
                    {/* <label htmlFor="name" className="block text-lg font-semibold text-[#081028]">Name</label> */}
                    <input
                        type="number"
                        name="price"
                        id="price"
                        className=""
                        required
                        placeholder="Nhập giá sản phẩm"
                    />
                </div>

                <div className="mb-4">
                    {/* <label htmlFor="name" className="block text-lg font-semibold text-[#081028]">Name</label> */}
                    <input
                        type="number"
                        name="discount_price"
                        id="discount_price"
                        className=""
                        required
                        placeholder="Nhập giá km sản phẩm"
                    />
                </div>

                <div className="mb-4">
                    {/* <label htmlFor="name" className="block text-lg font-semibold text-[#081028]">Name</label> */}
                    <input
                        type="text"
                        name="description"
                        id="description"
                        className=""
                        required
                        placeholder="Nhập mô tả sản phẩm"
                    />
                </div>

                <div className="mb-4 text-left">
                    {/* <label htmlFor="name" className="block text-lg font-semibold text-[#081028]">Name</label> */}
                    <select className="bg-amber-500" name="category_id" id="category_id">
                        <option value="">Chọn danh mục</option>
                        {loai.map((category) => (
                            <option key={category.category_id} value={category.category_id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    {/* <label htmlFor="name" className="block text-lg font-semibold text-[#081028]">Name</label> */}
                    <input
                        type="number"
                        name="stock"
                        id="stock"
                        className=""
                        required
                        placeholder="Nhập số lượng tồn hàng sản phẩm"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="name" className="block text-lg font-semibold text-white text-left">Độ hot</label>
                    <input
                        type="checkbox"
                        name="hot"
                        id="hot"
                        className=""
                    />
                </div>

                <div className="m-3 flex justify-center">
                    <button
                        type="submit"
                        className="bg-[#081028] text-white px-6 py-3 rounded-lg shadow-lg hover:bg-[#0a1530] focus:outline-none focus:ring-2 focus:ring-[#081028] transition duration-300"
                    >
                        Thêm
                    </button>
                </div>
            </form>
        </div>

    );
}