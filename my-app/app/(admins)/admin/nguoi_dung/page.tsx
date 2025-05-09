'use client';
import { useState, useEffect } from 'react';
import { IUser } from '@/app/(client)/components/cautrucdata';
import '../sccc.css';
import { useRouter } from 'next/navigation';
export default function nguoidung() {
    const router = useRouter();
    const [user, setUser] = useState<IUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [updatingUserIds, setUpdatingUserIds] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    // const router = useRouter();user
    const handleStatusChange = async (
        e: React.ChangeEvent<HTMLSelectElement>, // Kiểu của sự kiện onChange
        userId: number // Kiểu của userId là number
    ) => {
        const newStatus = e.target.value === "locked" ? true : false; // Chuyển giá trị từ "locked"/"active" thành boolean

        try {
            const res = await fetch(`http://localhost:3000/api/user/update-status/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await res.json();
            if (res.ok) {
                console.log(data.message);
                // router.refresh();
            } else {
                console.error(data.message); // Thông báo lỗi
            }
            setUser((prevUsers) => {
                return prevUsers.map((user) =>
                    user.user_id === userId ? { ...user, status: newStatus } : user
                );
            });
        } catch (error) {
            console.error("Lỗi khi thay đổi trạng thái:", error);
        }
    };
    const handleRoleChange = async (
        e: React.ChangeEvent<HTMLSelectElement>,
        userId: number
    ) => {
        const newRole = e.target.value as "customer" | "admin"; // ✅ ép kiểu
        setUpdatingUserIds((prev) => [...prev, userId]); // ⏳ Bắt đầu loading

        try {
            const res = await fetch(`http://localhost:3000/api/user/update-role/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });

            const data = await res.json();
            if (res.ok) {
                console.log(data.message);
                setUser((prevUsers) =>
                    prevUsers.map((user) =>
                        user.user_id === userId ? { ...user, role: newRole } : user
                    )
                );
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("Lỗi khi thay đổi vai trò:", error);
        } finally {
            setTimeout(() => {
                setUpdatingUserIds((prev) => prev.filter((id) => id !== userId));
            }, 800);
        }
    };



    const fetchCategories = async (page=1) => {
        try {
            const response = await fetch(`http://localhost:3000/api/nguoidung?page=${page}&limit=10`);
            const data = await response.json();
            setUser(data.data);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories(currentPage);
    }, [currentPage]);
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    const toggleCheckbox = (userId: number) => {
        setSelectedIds((prevSelected) =>
            prevSelected.includes(userId)
                ? prevSelected.filter((id) => id !== userId)
                : [...prevSelected, userId]
        );
    };



    if (loading) {
        return <div>Loading...</div>;
    }
    return (
        <div className="cards-3" >
            <div className="table-card-head">
                <div className="head-left">
                    <h2>User</h2>
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
                    {/* <button>Creat order</button> */}
                </div>
            </div>
            <div className="table-card-body">
                <table style={{ width: "100%," }}>
                    <thead>
                        <tr>
                            <th>
                                <div className="flex">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === user.length && user.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                // Chọn tất cả
                                                setSelectedIds(user.map((c) => c.user_id));
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
                                <div className="flex"><i className="fa-solid fa-user"></i>
                                    <p>Name</p>
                                </div>
                            </th>
                            <th>
                                <div className="flex"><i className="fa-solid fa-calendar-day"></i>
                                    <p>Created_at</p>
                                </div>
                            </th>
                            <th>
                                <div className="flex"><i className="fa-solid fa-square-check"></i>
                                    <p>Status</p>
                                </div>
                            </th>
                            <th>
                                <div className="flex"><i className="fa-solid fa-location-dot"></i>
                                    <p>Address</p>
                                </div>
                            </th>
                            <th>
                                <div className="flex"><i className="fa-solid fa-location-dot"></i>
                                    <p>Role</p>
                                </div>
                            </th>
                            {/* <th>Total</th> */}
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {user.map((users) => (
                            <tr key={users.user_id}>
                                <td>
                                    <div className="flex">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(users.user_id)}
                                            onChange={() => toggleCheckbox(users.user_id)}
                                        />
                                        <p>#{users.user_id}</p>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <p style={{ margin: "0", padding: "0" }} className="name">
                                            {users.name || "Dũng nè"}
                                        </p>
                                        <p style={{ margin: "0", padding: "0", color: "#AEB9E1" }} className="email">
                                            {users.email || "contact@henryjoseph.com"}
                                        </p>
                                    </div>
                                </td>
                                <td>{new Date(users.created_at).toLocaleDateString('vi')}</td>
                                <td>
                                    <div className={users.status ? "canceled" : "delivered"}>
                                        <select
                                            value={users.status ? "locked" : "active"} // Giá trị mặc định là "locked" nếu status là true, nếu không thì "active"
                                            onChange={(e) => handleStatusChange(e, users.user_id)} // Gọi hàm xử lý khi chọn thay đổi
                                            className="status-dropdown"

                                        >
                                            <option value="active">🧩Kích hoạt</option>
                                            <option value="locked">📌Khóa</option>
                                        </select>
                                    </div>
                                </td>

                                <td style={{ flexWrap: "wrap", width: "200px" }}>{users.addresses?.[0]?.address || "Vô gia cư"}</td>
                                <td style={{ flexWrap: "wrap", width: "200px" }}>
                                    <div className="flex" style={{ alignItems: "center", gap: "6px" }}>
                                        <select
                                            value={users.role}
                                            onChange={(e) => handleRoleChange(e, users.user_id)}
                                            className="status-dropdown"
                                            disabled={updatingUserIds.includes(users.user_id)} // 🛑 disable khi đang loading
                                        >
                                            <option value="customer">👤 Customer</option>
                                            <option value="admin">🛠️ Admin</option>
                                        </select>
                                        {updatingUserIds.includes(users.user_id) && (
                                            <span className="spinner" style={{ fontSize: "12px" }}>⏳</span>
                                        )}
                                    </div>
                                </td>

                                <td>
                                    <i className="fa-solid fa-eye"></i>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
                <div className="pagination">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <span className="flex items-center">Page {currentPage} / {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}