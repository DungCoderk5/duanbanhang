"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import '../sccc.css';
import Link from "next/link";
import { ILoai, IReview } from "@/app/(client)/components/cautrucdata";

export default function Sanpham({ id }: { id: number }) {
    const [categories, setCategories] = useState<IReview[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedIds, setSelectedIds] = useState<number[]>([]); // 🆕 Quản lý các checkbox được chọn
    const router = useRouter();

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/admin/comments');
            const data = await response.json();
            setCategories(data.comments);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const toggleCheckbox = (categoryId: number) => {
        setSelectedIds((prevSelected) =>
            prevSelected.includes(categoryId)
                ? prevSelected.filter((id) => id !== categoryId)
                : [...prevSelected, categoryId]
        );
    };

    const hamXoa = async (categoryId: number) => {
        if (!selectedIds.includes(categoryId)) {
            alert("Vui lòng chọn checkbox trước khi xóa!");
            return;
        }

        if (!confirm("Bạn có chắc chắn muốn xóa không?")) return;

        try {
            const res = await fetch(`http://localhost:3000/api/admin/comments/${categoryId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                alert("Xóa thành công!");
                fetchCategories(); // Làm mới danh sách
                setSelectedIds((prev) => prev.filter((id) => id !== categoryId));
            } else {
                const data = await res.json();
                alert(data.message || "Xóa thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi xóa:", error);
            alert("Có lỗi xảy ra khi xóa.");
        }
    };

    const xoaNhieuLoai = async () => {
        if (selectedIds.length === 0) {
            alert("Vui lòng chọn ít nhất một loại để xóa.");
            return;
        }

        if (!confirm("Bạn có chắc chắn muốn xóa những loại đã chọn?")) return;

        try {
            const res = await fetch(`http://localhost:3000/api/admin/xoanhieuloai`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedIds }),
            });

            if (res.ok) {
                alert("Xóa thành công!");
                fetchCategories(); // Làm mới danh sách
                setSelectedIds([]); // Bỏ chọn các checkbox
            } else {
                const data = await res.json();
                alert(data.message || "Xóa thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi xóa:", error);
            alert("Có lỗi xảy ra khi xóa.");
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="cards-3">
            <div className="table-card-head">
                <div className="head-left">
                    <h2>Comment</h2>
                </div>
                <div className="head-right">
                    <div className="input">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input type="text" placeholder="Search for" />
                    </div>
                    <div className="calendar">
                        <p>Jan 2025</p>
                        <i className="fa-solid fa-calendar-day"></i>
                    </div>
                    <button><Link href="/admin/loai/them">Create comment</Link></button>
                    <button
                        onClick={xoaNhieuLoai}
                        className="btn-delete-selected"
                        disabled={selectedIds.length === 0}
                    >
                        Xóa các loại đã chọn
                    </button>
                </div>
            </div>
            <div className="table-card-body">
                <table style={{ width: "100%" }}>
                    <thead>
                        <tr>
                            <th>
                                <div className="flex">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === categories.length && categories.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                // Chọn tất cả
                                                setSelectedIds(categories.map((c) => c.review_id));
                                            } else {
                                                // Bỏ chọn tất cả
                                                setSelectedIds([]);
                                            }
                                        }}
                                    />
                                    <p>ID</p>
                                </div>
                            </th>
                            <th>
                                <div className="flex">
                                    <i className="fa-solid fa-user"></i>
                                    <p>Name</p>
                                </div>
                            </th>
                            <th>
                                <div className="flex">
                                    <i className="fa-solid fa-calendar-day"></i>
                                    <p>Rating</p>
                                </div>
                            </th>
                            <th>
                                <div className="flex">
                                    <i className="fa-solid fa-calendar-day"></i>
                                    <p>Comment</p>
                                </div>
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.review_id}>
                                <td>
                                    <div className="flex">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(category.review_id)}
                                            onChange={() => toggleCheckbox(category.review_id)}
                                        />
                                        <p>#{category.review_id}</p>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <p className="name" style={{ margin: "0", padding: "0" }}>
                                            {category.review_user.name}
                                        </p>
                                        <p style={{ margin: "0", padding: "0", color: "#AEB9E1" }} className="email">
                                            {category.review_user.email}</p>
                                    </div>
                                </td>
                                <td>
                                    {Array.from({ length: 5 }, (_, index) => {
                                        return (
                                            <span key={index}>
                                                {index < category.rating ? "⭐" : "☆"}
                                            </span>
                                        );
                                    })}
                                </td>
                                <td>{category.comment}</td>
                                <td>
                                    <Link href={`/admin/loai/${category.review_id}`}>
                                        <i className="fa-solid fa-pen"></i>
                                    </Link>

                                    <button onClick={() => hamXoa(category.review_id)}>
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
