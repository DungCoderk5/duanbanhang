"use client";

import { useState, useEffect } from "react";
import { ISanPham } from "../components/cautrucdata";
import Show1SP from "../components/Show1SP";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const tu_khoa = searchParams.get("tu_khoa") || "";
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = 4;

    const [spArr, setSpArr] = useState<ISanPham[]>([]);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/timkiem/${tu_khoa}/${page}`);
                const data = await res.json();

                console.log("Dữ liệu API nhận được:", data);

                const sanPhamList = Array.isArray(data.data) ? data.data : [];
                setSpArr(sanPhamList);

                console.log("Dữ liệu spArr sau khi cập nhật:", sanPhamList);

                const total = Number(data.total) || 0;
                setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            }
        };
        fetchData();
    }, [tu_khoa, page]);

    // Hàm tạo danh sách trang hợp lý
    const renderPagination = () => {
        let pages: (number | string)[] = [];
        const maxPagesToShow = 5;

        if (totalPages <= 7) {
            // Nếu tổng số trang nhỏ hơn hoặc bằng 7, hiển thị tất cả
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            pages.push(1); // Trang đầu tiên

            if (page > maxPagesToShow) {
                pages.push("...");
            }

            let start = Math.max(2, page - 2);
            let end = Math.min(totalPages - 1, page + 2);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }

            if (page < totalPages - (maxPagesToShow - 1)) {
                pages.push("...");
            }

            pages.push(totalPages); // Trang cuối cùng
        }

        console.log("Danh sách trang sau khi xử lý:", pages);

        return pages.map((p, index) =>
            p === "..." ? (
                <span key={`dot-${index}`} className="flex items-center gap-1 px-3 py-2 text-gray-950">
                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                </span>
            ) : (
                <Link key={`page-${p}`} href={`/tim_kiem?tu_khoa=${tu_khoa}&page=${p}`}>
                    <button
                        className={`px-3 py-2 mx-1 rounded-full ${page === p ? "bg-blue-500 text-white" : "bg-gray-300 hover:bg-gray-400"
                            }`}
                    >
                        {p}
                    </button>
                </Link>
            )
        );
    };


    return (
        <div className="container mx-auto p-4">
            <div className="container1">

                <div className="timkiem">
                    <h2 className="bg-emerald-50 p-2 my-2 text-[1.2em] uppercase">
                        Kết quả tìm kiếm theo từ khóa "{tu_khoa}"
                    </h2>
                    <div className="container mx-auto">

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
                            {spArr.length > 0 ? (
                                spArr.map((sp: ISanPham) => <Show1SP key={sp.product_id} sp={sp} />)
                            ) : (
                                <p className="col-span-3 text-center text-gray-500">Không tìm thấy sản phẩm nào.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Điều hướng phân trang */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                    {page > 1 && (
                        <Link href={`/tim_kiem?tu_khoa=${tu_khoa}&page=${page - 1}`}>
                            <button className="rounded-full px-4 py-2 bg-gray-300 hover:bg-gray-400 ">
                                <i className="fa-solid fa-chevron-left"></i>              </button>
                        </Link>
                    )}

                    {renderPagination()}

                    {page < totalPages && (
                        <Link href={`/tim_kiem?tu_khoa=${tu_khoa}&page=${page + 1}`}>
                            <button className="rounded-full px-4 py-2 bg-gray-300 hover:bg-gray-400 ">
                                <i className="fa-solid fa-chevron-right"></i>              </button>
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
