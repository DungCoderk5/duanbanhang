"use client";
import { useState, useEffect } from "react";
import { IDonHang, IUser, IAddress, Province, District, Ward } from "../components/cautrucdata";
import Swal from "sweetalert2";
import AvatarUpload from "./uploadimg/page";
import Link from "next/link";
import "../style/account.css";
import { tr } from "motion/react-client";
export default function CheckAuth() {
    const [user, setUser] = useState<IUser | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"info" | "orders" | "orderdetail" | "changespass" | "addressuser">("info");
    const [donhang, setDonhang] = useState<IDonHang[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<IDonHang | null>(null);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [voucherCode, setVoucherCode] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [finalTotals, setFinalTotals] = useState<{ [key: string]: number }>({});
    const [addresses, setAddresses] = useState<IAddress[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [company, setCompany] = useState("");
    const [address, setAddress] = useState("");
    const [nation, setNation] = useState("");
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async () => {
        const res = await fetch(`http://localhost:3000/api/user/${user?.user_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok) {
            alert("Cập nhật thành công");
            setEditMode(false);
            // cập nhật lại thông tin user nếu cần
        } else {
            alert(data.message || "Có lỗi xảy ra");
        }
    };
    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/p/")
            .then((res) => res.json())
            .then((data) => setProvinces(data));
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
                .then((res) => res.json())
                .then((data) => setDistricts(data.districts));
        } else {
            setDistricts([]);
            setWards([]);
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
                .then((res) => res.json())
                .then((data) => setWards(data.wards));
        } else {
            setWards([]);
        }
    }, [selectedDistrict]);
    const applyVoucher = async (orderTotal: number, voucherCode: string): Promise<number> => {
        try {
            const response = await fetch('http://localhost:3000/api/voucher/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: voucherCode, order_total: orderTotal }) // Correctly pass voucherCode
            });

            const data = await response.json();

            if (!data.success) {
                setErrorMessage(data.message); // Show error message if voucher is invalid
                return orderTotal; // Return original total if voucher is invalid
            } else {
                setErrorMessage(""); // Clear error message if voucher is valid
                return data.final_total; // Return the final total after applying voucher
            }
        } catch (error) {
            setErrorMessage("Error applying voucher");
            console.error(error);
            return orderTotal; // Return original total in case of error
        }
    };
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem("token"); // hoặc lấy từ cookies
        if (!token) {
            setMessage("Vui lòng đăng nhập trước!");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/api/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                    confirmPassword,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                Swal.fire("Thành công", data.message, "success");
                setTimeout(() => {
                    localStorage.removeItem('token');
                    window.location.href = "/dang_nhap";
                }, 600);

            }
            else {
                Swal.fire("Lỗi", data.message, "error");
            }
        } catch (err) {
            console.log(err);

            Swal.fire("Lỗi tè le", "Lỗi máu chủ", "error");
        }
    };
    const fetchOrders = async (userId: number) => {
        try {
            const res = await fetch(`http://localhost:3000/api/donhang/user/${userId}`);
            const data = await res.json();
            if (res.ok) {
                setDonhang(data.donhang);
            } else {
                setMessage(data.thong_bao);
            }
        } catch (error) {
            console.error("Lỗi lấy đơn hàng:", error);
        }
    };

    const handleHuyDonHang = async (cart_id: string | number) => {
        const confirmHuy = window.confirm("Bạn có chắc muốn huỷ đơn hàng này?");
        if (!confirmHuy) return;

        try {
            const res = await fetch('http://localhost:3000/api/huy-don-hang', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart_id }),
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.thong_bao);
                if (user?.user_id) {
                    fetchOrders(user.user_id); // Gọi lại để cập nhật danh sách đơn hàng
                }
            }
            else {
                alert(data.thong_bao || "Huỷ đơn hàng thất bại.");
            }
        } catch (error) {
            console.error("Lỗi huỷ đơn:", error);
            alert("Đã có lỗi xảy ra.");
        }
    };

    useEffect(() => {
        const updateFinalTotals = async () => {
            const updatedTotals: { [key: string]: number } = {};
            for (const order of donhang) {
                const orderTotal = order.cartitem.reduce((total: number, item: any) => {
                    const price = item.product?.discount_price || 0;
                    const quantity = item.quantity || 1;
                    return total + (price * quantity);
                }, 0);
                const voucherCode = order.voucher || ""; // Access voucher for the current order

                const finalTotal = await applyVoucher(orderTotal, voucherCode);
                updatedTotals[order.cart_id] = finalTotal; // Save the final total for this order
            }
            setFinalTotals(updatedTotals); // Update state with final totals
        };

        updateFinalTotals();
    }, [donhang, voucherCode]);
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token"); // Lấy token từ localStorage

            if (!token) {
                setMessage("Chưa đăng nhập!");
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("http://localhost:3000/api/check-auth", {
                    method: "GET",
                    credentials: "include", // Gửi cookie nếu có
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`, // Gửi token từ localStorage
                    },
                });

                const data = await res.json();

                if (res.ok) {
                    setUser(data.user);
                    fetchOrders(data.user.user_id); // Gọi API lấy đơn hàng
                    fetchAddresses(data.user.user_id);     // Lấy địa chỉ (đã truyền user_id đúng)

                } else {
                    setMessage(data.message);
                    localStorage.removeItem("token"); // Xóa token nếu không hợp lệ
                }
            } catch (error) {
                setMessage("Lỗi kết nối đến server!");
                console.error("Lỗi kết nối:", error);
            } finally {
                setLoading(false);
            }
        };


        // Apply voucher to each order and update the final total


        const fetchAddresses = async (userId: number) => {
            try {
                const res = await fetch(`http://localhost:3000/api/diachi/${userId}`);
                const data = await res.json();
                setAddresses(data.dia_chi); // Gán dữ liệu vào state
            } catch (err) {
                console.error("Lỗi khi lấy địa chỉ:", err);
            }
        };

        fetchUser();
    }, []);


    return (
        <div>
            <section className="bread-crumb">
                <div className="container1">
                    <div className="rows">
                        <div className="col-xs-12">

                            <div className="breadcrumb-title"><b> Trang tài khoản</b></div>

                            <ul className="breadcrumb">

                                <li className="home">
                                    <a href="/"><span>Trang chủ</span></a>
                                    <span> / </span>
                                </li>


                                <li><strong><span> Tài khoản của {user?.name}</span></strong></li>


                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            {/* <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
            {loading ? (
                <p className="text-gray-500">Đang kiểm tra xác thực...</p>
            ) : user ? (
                <div>
                    <h2 className="text-2xl font-bold">Chào, {user.name || user.email}!</h2>
                    <p className="text-gray-700">Vai trò: {user.role || "Không xác định"}</p>
                    <p className="text-gray-700">Email: {user.email || "Không xác định"}</p>
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-red-500">{message}</p>
                    {message === "Chưa đăng nhập!" && (
                        <a
                            href="/dang_nhap"
                            className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            Đăng nhập
                        </a>
                    )}
                </div>
            )}
        </div> */}
            <div className="container1">
                {loading ? (
                    <p className="text-gray-500">Đang kiểm tra xác thực...</p>
                ) : user ? (
                    <div className="rows">

                        <div className="col-xs-12 col-sm-12 col-lg-3 col-left-ac">
                            <div className="block-account">
                                <h5 className="title-account">Trang tài khoản</h5>
                                <div className="flex justify-start items-center text-center gap-3">
                                    <AvatarUpload user={user} onAvatarChange={(newAvatar) => {
                                        setUser(prev => prev ? { ...prev, avatar: newAvatar } : null);
                                    }} />

                                    <p className="!m-0"><span style={{ verticalAlign: "middle" }}>Xin chào, {user.name}!</span></p>
                                </div>

                                <ul className="cursor-pointer">
                                    <li>
                                        <a className={`title-info ${activeTab === "info" ? "active" : ""}`}
                                            onClick={() => setActiveTab("info")}>
                                            Thông tin tài khoản
                                        </a>
                                    </li>
                                    <li>
                                        <a className={`title-info ${activeTab === "orders" ? "active" : ""}`}
                                            onClick={() => setActiveTab("orders")}>
                                            Đơn hàng của bạn
                                        </a>
                                    </li>
                                    <li>
                                        <a className={`title-info ${activeTab === "changespass" ? "active" : ""}`}
                                            onClick={() => setActiveTab("changespass")} >Đổi mật khẩu</a>
                                    </li>
                                    <li>
                                        <a className={`title-info ${activeTab === "addressuser" ? "active" : ""}`}
                                            onClick={() => setActiveTab("addressuser")}>Sổ địa chỉ ({addresses?.length || 0})</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {activeTab === "info" && (
                            <div className="col-xs-12 col-sm-12 col-lg-9 col-right-ac">
                                <h1 className="title-head margin-top-0">Thông tin tài khoản</h1>
                                <div className="form-signup name-account text-[14px]">
                                    <p><strong>Họ tên:</strong> {user.name}</p>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    <p><strong>Số điện thoại:</strong> 0{user.phone}</p>
                                    {user.addresses?.address ? (
                                        <p><strong>Địa chỉ:</strong> {user.addresses.address}</p>
                                    ) : (
                                        <p><strong>Địa chỉ:</strong> Không có địa chỉ</p>
                                    )}



                                </div>
                                <button
                                    className="button btn-edit-addr btn btn-primary btn-more text-[14px]"
                                    onClick={() => setEditMode(true)}
                                >
                                    Cập nhật thông tin tài khoản
                                </button>

                                {editMode && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-100 bg-opacity-50">
                                        <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
                                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cập nhật thông tin</h2>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        placeholder="Nhập họ tên"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="Nhập email"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                                                    <input
                                                        type="text"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        placeholder="Nhập số điện thoại"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3 mt-6">
                                                <button
                                                    onClick={handleSubmit}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition duration-200"
                                                >
                                                    Lưu
                                                </button>
                                                <button
                                                    onClick={() => setEditMode(false)}
                                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-5 py-2 rounded-lg transition duration-200"
                                                >
                                                    Hủy
                                                </button>
                                            </div>

                                            {/* Nút đóng góc trên */}
                                            <button
                                                onClick={() => setEditMode(false)}
                                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
                                                aria-label="Đóng"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                )}


                            </div>
                        )}
                        {/* Hiển thị danh sách đơn hàng */}
                        {activeTab === "orders" && (
                            <div className="col-xs-12 col-sm-12 col-lg-9 col-right-ac">
                                <h1 className="title-head margin-top-0">Đơn hàng của bạn</h1>
                                <div className="table-responsive-block" style={{ overflowX: "auto" }}>
                                    <table className="table table-cart table-order text-[14px]">
                                        <thead>
                                            <tr>
                                                <th>Đơn hàng</th>
                                                <th>Ngày</th>
                                                <th>Địa chỉ</th>
                                                <th>Giá trị đơn hàng</th>
                                                <th>TT thanh toán</th>
                                                <th>TT vận chuyển</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {donhang.length > 0 ? (
                                                donhang.map((order, index) => {
                                                    const finalTotal = finalTotals[order.cart_id]; // Get the final total from state
                                                    const shippingFee = finalTotal < 200000 ? 20000 : 0;
                                                    return (
                                                        <tr key={`${order.ma_dh}-${index}`}>
                                                            <td style={{ color: "#2F80ED" }}>
                                                                <button className="cursor-pointer">
                                                                    <span
                                                                        className="title-info"
                                                                        onClick={() => {
                                                                            setSelectedOrder(order);
                                                                            setActiveTab("orderdetail");
                                                                        }}
                                                                    >
                                                                        #{order.ma_dh}
                                                                    </span>
                                                                </button>
                                                            </td>
                                                            <td>{new Date(order.created_at).toLocaleDateString('vi')}</td>
                                                            <td>{order.user.addresses?.[0]?.address ?? "Chưa có địa chỉ"}</td>
                                                            <td>
                                                                <span className="price">
                                                                    <span>
                                                                        {finalTotal ? (finalTotal + shippingFee).toLocaleString() : "Loading..."} ₫
                                                                    </span>
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className="span_pending">
                                                                    {order.cartitem.length > 0
                                                                        ? Number(order.cartitem[0].status) === 3
                                                                            ? "Đã huỷ"
                                                                            : Number(order.cartitem[0].status) === 0
                                                                                ? "Chưa thanh toán"
                                                                                : "Đã thanh toán"
                                                                        : "Không có sản phẩm"}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className="span_">
                                                                    {order.cartitem.length > 0
                                                                        ? (Number(order.cartitem[0].status_way) === 0
                                                                            ? "Chưa vận chuyển"
                                                                            : Number(order.cartitem[0].status_way) === 1
                                                                                ? "Đang vận chuyển"
                                                                                : "Đã tới nơi")
                                                                        : "Không có sản phẩm"}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {order.cartitem.length > 0 && Number(order.cartitem[0].status) === 0 ? (
                                                                    <button
                                                                        className="text-red-500 hover:underline"
                                                                        onClick={() => handleHuyDonHang(order.cart_id)}
                                                                    >
                                                                        Huỷ đơn
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-gray-400">Không thể huỷ</span>
                                                                )}
                                                            </td>


                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="text-center">
                                                        <p>Không có đơn hàng nào.</p>
                                                    </td>
                                                </tr>
                                            )}

                                            {/* <tr>
                                                    <td colSpan={6}>
                                                        <p>Không có đơn hàng nào.</p>
                                                    </td>
                                                </tr> */}

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {/* Tab Chi tiết đơn hàng */}
                        {activeTab === "orderdetail" && selectedOrder ? (
                            (() => {
                                const finalTotal = finalTotals[selectedOrder.cart_id]; // Tính toán tổng tiền ngoài JSX
                                const shippingFee = finalTotal < 200000 ? 20000 : 0;

                                return (
                                    <div className="col-xs-12 col-sm-12 col-lg-9 col-right-ac hi">
                                        <div className="title-head clearfix">
                                            <h1>Chi tiết đơn hàng <span>#{selectedOrder.ma_dh}</span></h1>
                                            <span className="note order_date">
                                                Ngày tạo: {new Date(selectedOrder.created_at).toLocaleDateString("vi")}
                                            </span>
                                        </div>
                                        <div className="payment_status">
                                            <span className="note">Trạng thái thanh toán:</span>
                                            <i className="status_pending">
                                                <em>
                                                    <span className="span_pending" style={{ color: "red" }}>
                                                        <strong>
                                                            <em>
                                                                {selectedOrder.cartitem.length > 0
                                                                    ? Number(selectedOrder.cartitem[0].status) === 3
                                                                        ? "Đã huỷ"
                                                                        : Number(selectedOrder.cartitem[0].status) === 0
                                                                            ? "Chưa thanh toán"
                                                                            : "Đã thanh toán"
                                                                    : "Không có sản phẩm"}
                                                            </em>
                                                        </strong>
                                                    </span>
                                                </em>
                                            </i>
                                        </div>
                                        <div className="shipping_status">
                                            <span className="note">Trạng thái vận chuyển:</span>
                                            <span className="span_" style={{ color: "red" }}>
                                                <strong>
                                                    <em>
                                                        {selectedOrder.cartitem?.length > 0
                                                            ? (Number(selectedOrder.cartitem[0].status_way) === 0
                                                                ? "Chưa vận chuyển"
                                                                : Number(selectedOrder.cartitem[0].status_way) === 1
                                                                    ? "Đang vận chuyển"
                                                                    : "Đã tới nơi")
                                                            : "Không có sản phẩm"}
                                                    </em>
                                                </strong>
                                            </span>
                                        </div>

                                        <div className="ros">
                                            <div className="col-md-6 body_order">
                                                <div className="box-address">
                                                    <h2 className="title-head">Địa chỉ giao hàng</h2>
                                                    <div className="address box-des">
                                                        <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.created_at).toLocaleDateString("vi")}</p>
                                                        <p><strong>Địa chỉ:</strong> {selectedOrder.user.addresses?.[0]?.address || "Chưa có địa chỉ"}</p>
                                                        <p><strong>Giảm giá:</strong> {
                                                            finalTotal
                                                                ? (
                                                                    selectedOrder.cartitem?.reduce((total: number, item: any) => {
                                                                        const price = item.product.discount_price || item.product.price;
                                                                        return total + price * item.quantity;
                                                                    }, 0) - finalTotal
                                                                ).toLocaleString() + "₫"
                                                                : "0₫"
                                                        }</p>
                                                        <p><strong>Phí vận chuyển:</strong>{shippingFee ? shippingFee.toLocaleString('vi') : "0₫"}</p>
                                                        <p><strong>Tổng tiền:</strong> {finalTotal ? (finalTotal + shippingFee).toLocaleString() : "Loading..."} ₫</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xs-12 col-sm-12 col-md-3 body_order">
                                                <div className="box-address">
                                                    <h2 className="title-head">
                                                        Thanh toán
                                                    </h2>
                                                    <div className="box-des">
                                                        <p>
                                                            {Number(selectedOrder.payment) === 1
                                                                ? "Thanh toán bằng thẻ tín dụng"
                                                                : "Thanh toán khi giao hàng (COD)"}
                                                        </p>

                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xs-12 col-sm-12 col-md-3 body_order">
                                                <div className="box-address">
                                                    <h2 className="title-head">
                                                        Ghi chú
                                                    </h2>
                                                    <div className="box-des">
                                                        <p>
                                                            {selectedOrder?.ghi_chu || "Không có ghi chú"}

                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xs-12 col-sm-12 col-md-12">
                                                <div className="table-order">
                                                    <div className="table-responsive-block table_mobile">
                                                        <table id="order_details" className="table ">
                                                            <thead className="thead-default theborder">
                                                                <tr>
                                                                    <th>Sản phẩm</th>
                                                                    <th>Đơn giá</th>
                                                                    <th>Số lượng</th>
                                                                    <th>Thành tiền</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {selectedOrder.cartitem?.map((item: any, index: number) => (
                                                                    <tr key={item.item_id || `item-${index}`}>
                                                                        <td className="ten">
                                                                            <div className="image_order">
                                                                                <Link href={`/sp/${item.product?.product_id}`} passHref>
                                                                                    <img src={`/img/${item.product?.img}`} alt="" />
                                                                                </Link>
                                                                            </div>
                                                                            <div className="content_right">
                                                                                <Link href={`/sp/${item.product?.product_id}`} passHref>
                                                                                    {item.product?.name}
                                                                                </Link>
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            {item.product.discount_price ? item.product.discount_price : item.product.price}
                                                                        </td>
                                                                        <td>
                                                                            {item.quantity}
                                                                        </td>
                                                                        <td>
                                                                            {(item.product.discount_price * item.quantity).toLocaleString()}₫

                                                                        </td>
                                                                    </tr>

                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()
                        ) : (
                            <div></div>
                        )}

                        {/* {tab đổi mật khẩu} */}
                        {activeTab === "changespass" && (
                            <div className="col-xs-12 col-sm-12 col-lg-9 col-right-ac">
                                <h1 className="title-head margin-top-0">Đổi mật khẩu</h1>
                                <div className="col-md-6 col-12 text-[14px]">
                                    <div className="page-login">
                                        <form onSubmit={handleChangePassword} id="change_customer_password" acceptCharset="UTF-8">
                                            <input name="FormType" type="hidden" value="change_customer_password" />
                                            <p>
                                                Để đảm bảo tính bảo mật vui lòng đặt mật khẩu với ít nhất 8 kí tự
                                            </p>
                                            <div className="form-signup clearfix">
                                                <fieldset className="form-group">
                                                    <label htmlFor="oldPass">Mật khẩu cũ <span className="error">*</span></label>
                                                    <input
                                                        type="password"
                                                        id="oldPass"
                                                        required
                                                        className="form-control form-control-lg"
                                                        value={oldPassword}
                                                        onChange={(e) => setOldPassword(e.target.value)}
                                                    />                                                </fieldset>
                                                <fieldset className="form-group">
                                                    <label htmlFor="changePass">Mật khẩu mới <span className="error">*</span></label>
                                                    <input
                                                        type="password"
                                                        id="newPass"
                                                        required
                                                        className="form-control form-control-lg"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                    />                                                </fieldset>
                                                <fieldset className="form-group">
                                                    <label htmlFor="confirmPass">Xác nhận lại mật khẩu <span className="error">*</span></label>
                                                    <input
                                                        type="password"
                                                        id="confirmPass"
                                                        required
                                                        className="form-control form-control-lg"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                    />                                                </fieldset>
                                                <button type="submit" className="button btn-edit-addr btn btn-primary btn-more"><i className="hoverButton"></i>Đặt lại mật khẩu</button>
                                                {message && <p style={{ marginTop: 10 }}>{message}</p>}

                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>

                        )}
                        {activeTab === "addressuser" && (
                            <div className="col-xs-12 col-sm-12 col-lg-9 col-right-ac">
                                <h1 className="title-head margin-top-0">Danh sách địa chỉ</h1>
                                <p className="btn-row">
                                    <button className="btn-edit-addr btn btn-primary btn-more" type="button" onClick={() => setShowAddForm(true)}>
                                        Thêm địa chỉ
                                    </button>
                                </p>
                                <div className="rows total_address">
                                    {addresses?.length > 0 ? (
                                        addresses.map((item, index) => (
                                            <div
                                                key={index}
                                                id={`view_address_${item.address_id}`}
                                                className="customer_address col-xs-12 col-lg-12 col-md-12 col-xl-12 text-[14px]"
                                            >
                                                <div
                                                    className="address_info"
                                                    style={{
                                                        borderTop: "1px #ebebeb solid",
                                                        paddingTop: "16px",
                                                        marginTop: "20px",
                                                    }}
                                                >
                                                    <div className="address-group">
                                                        <div className="address form-signup">
                                                            <p>
                                                                <strong>Họ tên: </strong>
                                                                {item.address_user?.name}
                                                                {item.is_default && (
                                                                    <span className="address-default">(Địa chỉ mặc định)</span>
                                                                )}
                                                            </p>
                                                            <p>
                                                                <strong>Địa chỉ: </strong>
                                                                {item.address}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div id={`tool_address_${item.address_id}`} className="btn-address">
                                                        <p className="btn-row">
                                                            <button
                                                                className="btn-edit-addr btn btn-primary btn-edit"
                                                                type="button"
                                                            >
                                                                Chỉnh sửa địa chỉ
                                                            </button>
                                                            <button
                                                                className="hidden btn btn-dark-address btn-edit-addr btn-delete"
                                                                type="button"
                                                            >
                                                                <span>Xóa</span>
                                                            </button>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic mt-4">Chưa có địa chỉ</p>
                                    )}
                                </div>

                                {showAddForm && (
                                    <div
                                        className="modal-overlay"
                                        onClick={() => setShowAddForm(false)} // Click ra ngoài để đóng modal
                                    ></div>
                                )}

                                {/* Modal thêm địa chỉ */}
                                <div
                                    id="add_address"
                                    className="form-list modal_address modal"
                                    style={{ display: showAddForm ? 'block' : 'none', height: "545px" }}
                                >
                                    <div className="btn-close closed_pop" onClick={() => setShowAddForm(false)}>
                                        <i className="fa fa-times"></i>
                                    </div>
                                    <h2 className="title_pop">Thêm địa chỉ mới</h2>
                                    <form
                                        method="post"
                                        action="/account/addresses"
                                        id="customer_address"
                                        acceptCharset="UTF-8"
                                        className="has-validation-callback"
                                    >
                                        <input name="FormType" type="hidden" value="customer_address" />
                                        <input name="utf8" type="hidden" value="true" />

                                        <div className="pop_bottom">
                                            <div className="form_address">
                                                <div className="field">
                                                    <fieldset className="form-group">
                                                        <input
                                                            type="text"
                                                            name="FullName"
                                                            className={`form-control ${name.trim() !== "" ? "has-content" : ""}`}
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                        />
                                                        <label>Họ tên</label>
                                                    </fieldset>
                                                </div>


                                                <div className="field">
                                                    <fieldset className="form-group">
                                                        <input
                                                            type="text"
                                                            name="Address1"
                                                            className={`form-control ${address.trim() !== "" ? "has-content" : ""}`}
                                                            value={address}
                                                            onChange={(e) => setAddress(e.target.value)}
                                                        />
                                                        <label>Địa chỉ (số nhà...)</label>
                                                    </fieldset>
                                                </div>
                                                <div className="group-country">
                                                    <fieldset className="form-group select-field not-vn form-control has-content">
                                                        <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} required>
                                                            <option value="">Chọn Tỉnh/Thành</option>
                                                            {provinces.map((p) => (
                                                                <option key={p.code} value={p.code}>
                                                                    {p.name}
                                                                </option>
                                                            ))}
                                                        </select>


                                                    </fieldset>
                                                    <fieldset className="form-group select-field not-vn form-control has-content">
                                                        <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} required>
                                                            <option value="">Chọn Quận/Huyện</option>
                                                            {districts.map((d) => (
                                                                <option key={d.code} value={d.code}>
                                                                    {d.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </fieldset>
                                                    <fieldset className="form-group select-field not-vn form-control has-content">
                                                        <select required>
                                                            <option value="">Chọn Phường/Xã</option>
                                                            {wards.map((w) => (
                                                                <option key={w.code} value={w.code}>
                                                                    {w.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </fieldset>
                                                </div>
                                                <div className="flex items-center my-4">
                                                    <div className="flex-grow h-px bg-gray-300"></div>
                                                    <span className="px-4 text-sm text-gray-500">Hoặc</span>
                                                    <div className="flex-grow h-px bg-gray-300"></div>
                                                </div>
                                                <div className="field">
                                                    <fieldset className="form-group">
                                                        <input
                                                            type="number"
                                                            name="Address1"
                                                            className={`form-control ${address.trim() !== "" ? "has-content" : ""}`}
                                                            value={address}
                                                            onChange={(e) => setAddress(e.target.value)}
                                                        />
                                                        <label>Số nhà</label>
                                                    </fieldset>
                                                </div>
                                                <div className="flex w-full gap-2.5">
                                                    <div className="field">
                                                        <fieldset className="form-group">
                                                            <input
                                                                type="text"
                                                                name="Address1"
                                                                className={`form-control ${address.trim() !== "" ? "has-content" : ""}`}
                                                                value={address}
                                                                onChange={(e) => setAddress(e.target.value)}
                                                            />
                                                            <label>Đường</label>
                                                        </fieldset>
                                                    </div>
                                                    <div className="field">
                                                        <fieldset className="form-group">
                                                            <input
                                                                type="text"
                                                                name="Address1"
                                                                className={`form-control ${address.trim() !== "" ? "has-content" : ""}`}
                                                                value={address}
                                                                onChange={(e) => setAddress(e.target.value)}
                                                            />
                                                            <label>Phường/ Xã</label>
                                                        </fieldset>
                                                    </div>
                                                    <div className="field">
                                                        <fieldset className="form-group">
                                                            <input
                                                                type="text"
                                                                name="Address1"
                                                                className={`form-control ${address.trim() !== "" ? "has-content" : ""}`}
                                                                value={address}
                                                                onChange={(e) => setAddress(e.target.value)}
                                                            />
                                                            <label>Quận/Huyện</label>
                                                        </fieldset>
                                                    </div>
                                                </div>
                                                <div className="field">
                                                    <fieldset className="form-group">
                                                        <input
                                                            type="text"
                                                            name="Address1"
                                                            className={`form-control ${address.trim() !== "" ? "has-content" : ""}`}
                                                            value={address}
                                                            onChange={(e) => setAddress(e.target.value)}
                                                        />
                                                        <label>Tỉnh/Thành</label>
                                                    </fieldset>
                                                </div>
                                                <div className="checkbox">
                                                    <label className="c-input c-checkbox" style={{ paddingLeft: "20px" }}></label>
                                                    <input type="checkbox" id="address_default_address_" name="IsDefault" value={"true"} />
                                                    <span className="c-indicator text-[14px] text-center my-[1px]">Đặt là địa chỉ mặc định?</span>
                                                </div>
                                                <div className="btn-row">
                                                    <button className="btn btn-lg btn-dark-address btn-outline article-readmore btn-close" type="button"
                                                        onClick={() => setShowAddForm(false)}>
                                                        <span className="text-[14px]">Hủy</span>
                                                    </button>
                                                    <button className="btn btn-lg btn-primary btn-submit" type="submit">
                                                        <span>Thêm địa chỉ</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}



                    </div>

                ) : (<div className="text-center">
                    <p className="text-red-500">{message}</p>
                    {message === "Chưa đăng nhập!" && (
                        <a
                            href="/dang_nhap"
                            className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            Đăng nhập
                        </a>
                    )}
                </div>
                )}
            </div>
        </div >
    );
}
