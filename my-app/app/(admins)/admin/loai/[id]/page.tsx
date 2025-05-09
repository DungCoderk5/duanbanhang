"use client"
import { useEffect, useState } from "react";
import handleSuaLoai from "../them/handleSuaLoai";
import { useRouter } from "next/navigation";
export default function SuaLoai({ params }: { params: { id: number } }) {
    const [loai, setLoai] = useState({
        id: params.id,
        name: "",
        parent_id: 0 as number | null,
    });
    const router = useRouter();

    useEffect(() => {
        const fetchLoaiDetails = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/loai/${params.id}`);
                const data = await res.json();
                setLoai({
                    id: data.category_id,
                    name: data.name,
                    parent_id: data.parent_id || null,
                });
            } catch (error) {
                console.error("Error fetching category details:", error);
            }
        };
        fetchLoaiDetails();
    }, [params.id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoai((prev) => ({
            ...prev,
            [name]: name === "parent_id" ? (value ? Number(value) : null) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Create a FormData object
        const formData = new FormData();
        formData.append("id", String(loai.id));
        formData.append("name", loai.name);
        formData.append("parent_id", loai.parent_id ? String(loai.parent_id) : "");

        // Pass FormData to handleSuaLoai
        handleSuaLoai(formData);
        router.refresh();

    };

    return (
        <div className="form-tt">
            <h2 className="!text-left">Sửa loại</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <input
                        type="text"
                        name="name"
                        id="name"
                        className=""
                        required
                        placeholder="Nhập tên loại"
                        value={loai.name}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        name="parent_id"
                        id="parent_id"
                        className=""
                        placeholder="Nhập ID loại cha (không bắt buộc)"
                        value={loai.parent_id || ""}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="m-3 flex justify-center">
                    <button
                        type="submit"
                        className="bg-[#081028] text-white px-6 py-3 rounded-lg shadow-lg hover:bg-[#0a1530] focus:outline-none focus:ring-2 focus:ring-[#081028] transition duration-300"
                    >
                        Cập nhật
                    </button>
                </div>
            </form>
        </div>
    );
}
