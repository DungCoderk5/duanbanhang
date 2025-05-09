"use client";
import { useEffect, useRef, useState } from "react";
import { RootState } from "@/lib/store";
import { useSelector } from "react-redux";
import { ICart, IUser, Province, District, Ward, IAddress } from "../components/cautrucdata";
import { useRouter } from "next/navigation";
import "../style/checkout.css"
import Swal from "sweetalert2";
export default function ThanhToan() {

    const [user, setUser] = useState<IUser | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [voucherCode, setVoucherCode] = useState("");
    const [voucherMessage, setVoucherMessage] = useState("");
    const [voucherSuccess, setVoucherSuccess] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [selectAddress, setSelectaddress] = useState<IAddress[]>([])
    const [selected, setSelected] = useState(""); // địa chỉ được chọn
    const [customAddress, setCustomAddress] = useState<string>("");


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

    const handleOrder = () => {
        setIsOrdering(true);
        setTimeout(() => {
            setIsOrdering(false);
            setOrderSuccess(true);
        }, 3000);
    };
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setMessage("Chưa đăng nhập!");
                setLoading(false);
                return;
            }
            try {
                const res = await fetch("http://localhost:3000/api/check-auth", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                if (res.ok) {
                    setUser(data.user);
                } else {
                    setMessage(data.message);
                    localStorage.removeItem("token");
                }
            } catch (error) {
                setMessage("Lỗi kết nối đến server!");
                console.error("Lỗi kết nối:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const listSP: ICart[] = useSelector((state: RootState) => state.cart.listSp);
    const user_id = user?.user_id;
    const subtotal = listSP.reduce((sum, item) => {
        return sum + item.gia_mua * item.so_luong;
    }, 0);
    const shippingFee = subtotal < 200000 ? 20000 : 0;

    useEffect(() => {
        if (listSP.length === 0) {
            alert("Bạn chưa chọn sản phẩm nào. Vui lòng chọn sản phẩm rồi mới thanh toán");
            router.push("/");
        }
    }, [listSP, router]);

    const ghichuRef = useRef<HTMLTextAreaElement>(null);
    const thongbaoRef = useRef<HTMLDivElement>(null);
    const paymentRef = useRef<HTMLInputElement[]>([]);
    const addressRef = useRef<HTMLSelectElement>(null);

    const submitDuLieu = async () => {
        let ghi_chu = ghichuRef.current?.value;
        const selectedValue = Object.values(paymentRef.current).find((el) => el.checked)?.value;
        const dia_chi = addressRef.current?.value || "";

        // selectedValue là "cod" hoặc "bank"
        const paymentCode = selectedValue === "bank" ? 1 : 0;

        let email = user?.email;
        if (!user_id) {
            thongbaoRef.current!.innerHTML = "Lỗi: Không tìm thấy user_id";
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/api/luudonhang", {
                method: "POST",
                body: JSON.stringify({ user_id, ghi_chu, payment: paymentCode, voucher: voucherCode, email, products: listSP, address: dia_chi }),
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();
            thongbaoRef.current!.innerHTML = data.thong_bao;

            if (res.ok) {
                // Nếu request thành công
                Swal.fire("Thành công", "Đơn hàng của bạn đã được tạo!", "success");
                if (data.don_hang) {
                    setTimeout(() => {
                    router.push("/thanh-toan/hoan-tat");
                },5000)
                }
            } else {
                // Nếu có lỗi, thông báo từ backend
                Swal.fire("Lỗi", data.thong_bao || "Đã xảy ra lỗi khi tạo đơn hàng", "error");
            }
        } catch (err) {
            console.error("Lỗi request lưu đơn hàng:", err);
            thongbaoRef.current!.innerHTML = "Có lỗi xảy ra, vui lòng thử lại!";
        }
    };

    const luuchitietdonhang = async (cart_id: number, cart: ICart[]) => {
        let url = "http://localhost:3000/api/luugiohang";
        try {
            let promises = cart.map(sp =>
                fetch(url, {
                    method: "POST",
                    body: JSON.stringify({ cart_id, product_id: sp.id, quantity: sp.so_luong, price: sp.gia_mua }),
                    headers: { 'Content-Type': 'application/json' },
                })
            );
            await Promise.all(promises);
            router.push("/thanh-toan/hoan-tat");
        } catch (error) {
            console.error("Lỗi lưu chi tiết đơn hàng:", error);
            thongbaoRef.current!.innerHTML = "Lỗi khi lưu đơn hàng, vui lòng thử lại!";
        }
    };
    const handleClick = () => {
        handleOrder();
        submitDuLieu();
    };
    const applyVoucher = async () => {
        if (!voucherCode) return;

        try {
            const res = await fetch("http://localhost:3000/api/voucher/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: voucherCode, order_total: subtotal }),
            });

            const data = await res.json();

            if (data.success) {
                setVoucherSuccess(true);
                setVoucherMessage(data.message);
                setDiscountAmount(data.discount);
            } else {
                setVoucherSuccess(false);
                setVoucherMessage(data.message);
                setDiscountAmount(0);
            }
        } catch (err) {
            console.error("Lỗi áp dụng voucher:", err);
            setVoucherSuccess(false);
            setVoucherMessage("Có lỗi xảy ra khi áp dụng mã giảm giá");
            setDiscountAmount(0);
        }
    };
    useEffect(() => {
        const fetchAddresses = async () => {
            const userId = user?.user_id;
            try {
                const res = await fetch(`http://localhost:3000/api/diachi/${userId}`);
                const data = await res.json();
                if (res.ok) {
                    setSelectaddress(data.dia_chi);
                } else {
                    Swal.fire("Lỗi", data.thong_bao, "error");
                }
            } catch (err) {
                Swal.fire("Lỗi tè le", "Không thể lấy địa chỉ!", "error");
            }
        };

        if (user) fetchAddresses();
    }, [user]);

    // Tự chọn địa chỉ mặc định
    useEffect(() => {
        const defaultAddr = selectAddress.find((addr) => addr.is_default);
        if (defaultAddr) {
            setSelected(defaultAddr.address);
        }
    }, [selectAddress]);

    const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelected(e.target.value);
    };


    return (
        // <form className="mx-auto w-[800px] border-2 border-black rounded">
        //     <h2 className="text-[1.1em] bg-amber-300 p-1">Thanh toán đơn hàng</h2>
        //     <div className="m-3">
        //         Ghi chú:
        //         <textarea ref={ghichuRef} className="w-[100%] p-1 border bg-zinc-50" rows={4} />
        //     </div>
        //     <div className="m-3">
        //         <button onClick={submitDuLieu} className="text-[0.8em] px-4 py-2 bg-amber-300 rounded" type="button">
        //             Lưu đơn hàng
        //         </button>
        //     </div>
        //     <div ref={thongbaoRef} className="text-red-500 font-bold italic text-2xl"></div>
        // </form>
        <div className="checkout-container">
            <div className="checkout-left">
                <h3>Thông tin nhận hàng</h3>
                {user && (

                    <form id="checkout-form">

                        <input type="email" placeholder="Email" required defaultValue={user.email} />
                        <input type="text" placeholder="Họ và tên" required defaultValue={user.name} />
                        <input type="tel" placeholder="Số điện thoại (tùy chọn)" defaultValue={user.phone} />
                        {/* Địa chỉ đã lưu */}
                        {selectAddress.length > 0 && (
                            <select ref={addressRef} value={selected} onChange={handleAddressChange} required>
                                <option value="">-- Chọn địa chỉ đã lưu --</option>
                                {selectAddress.map((item) => (
                                    <option key={item.address_id} value={item.address}>
                                        {item.address} {item.is_default ? "(Mặc định)" : ""}
                                    </option>
                                ))}
                                <option value="new">Nhập địa chỉ mới</option>
                            </select>
                        )}

                        {selected === "new" && (
                            <input
                                type="text"
                                placeholder="Nhập địa chỉ mới..."
                                required
                                value={customAddress}
                                onChange={(e) => setCustomAddress(e.target.value)}
                            />
                        )}

                        {selectAddress.length === 0 && (
                            <input
                                type="text"
                                placeholder="Địa chỉ"
                                required
                                value={customAddress}
                                onChange={(e) => setCustomAddress(e.target.value)}
                            />
                        )}
                        <textarea placeholder="Ghi chú (tùy chọn)" ref={ghichuRef}></textarea>
                        <div ref={thongbaoRef} className="text-red-500 font-bold italic text-2xl"></div>


                    </form>
                )}
                {/* <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} required>
                            <option value="">Chọn Tỉnh/Thành</option>
                            {provinces.map((p) => (
                                <option key={p.code} value={p.code}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} required>
                            <option value="">Chọn Quận/Huyện</option>
                            {districts.map((d) => (
                                <option key={d.code} value={d.code}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                        <select required>
                            <option value="">Chọn Phường/Xã</option>
                            {wards.map((w) => (
                                <option key={w.code} value={w.code}>
                                    {w.name}
                                </option>
                            ))}
                        </select> */}
            </div>

            <div className="checkout-extra">
                <a href="">DUALEO FOOD</a>

                <h3>Vận chuyển</h3>
                <p className="vanchuyen">Vui lòng nhập thông tin giao hàng</p>
                <h3>Thanh toán</h3>
                <div className="boc">
                    <input type="radio" name="payment" value="bank" className="input-radio" ref={(el) => {
                        if (el) paymentRef.current[0] = el;
                    }}
                    />
                    <label> Chuyển khoản </label>
                    <i style={{ color: "#337ab7" }} className="fa-solid fa-money-bill"></i>
                </div>
                <div className="boc">
                    <input type="radio" name="payment" value="cod" className="input-radio" defaultChecked
                        ref={(el) => {
                            if (el) paymentRef.current[1] = el;
                        }}
                    />
                    <label>Thu hộ (COD)</label>
                    <i style={{ color: "#337ab7" }} className="fa-solid fa-money-bill"></i>
                </div>
            </div>

            <div className="checkout-right">
                <h3>Đơn hàng ({listSP.length}  sản phẩm)</h3>
                <div className="items">
                    {listSP.map((item, idx) => (
                        <div className="order-item" key={idx}>
                            <img
                                src={`img/${item.hinh}`}
                                alt="Chuck Taylor"
                            />
                            <span>{item.ten_sp}</span>
                            <span>{(item.gia_mua * item.so_luong).toLocaleString('vi')}VNĐ</span>
                        </div>
                    ))}
                </div>

                <div className="discound">
                    <input type="text" placeholder="Nhập mã giảm giá" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} />
                    <button onClick={applyVoucher}>Áp dụng</button>
                </div>
                {voucherMessage && <p style={{ color: voucherSuccess ? "green" : "red" }}>{voucherMessage}</p>}

                <div className="tinhtien">
                    <div className="tamtinh">
                        <p>Tạm tính: </p>
                        <span>{subtotal.toLocaleString('vi')}VNĐ</span>
                    </div>
                    <div className="tamtinh" style={{ borderBottom: "1px solid #ddd" }}>
                        <p>Phí vận chuyển: </p>
                        <span>{shippingFee.toLocaleString('vi')}VNĐ</span>
                    </div>
                </div>
                <h3 style={{ padding: "10px 0" }}>
                    Tổng cộng: <span>{(subtotal + shippingFee - discountAmount).toLocaleString('vi')}VNĐ</span>
                </h3>
                <button onClick={handleClick} disabled={isOrdering}>
                    {isOrdering ? "Đang xử lý..." : "ĐẶT HÀNG"}
                </button>

                {/* {orderSuccess && (
                    <p id="order-status" style={{ color: "green" }}>
                        Đặt hàng thành công!
                    </p>
                )} */}
            </div>
        </div>

    );
}
// "use client";
// import { useEffect, useRef, useState } from "react";
// import { RootState } from "@/lib/store";
// import { useSelector } from "react-redux";
// import { ICart, IUser, Province, District, Ward } from "../components/cautrucdata";
// import { useRouter } from "next/navigation";
// import "../style/checkout.css";

// export default function ThanhToan() {
//     const [user, setUser] = useState<IUser | null>(null);
//     const [message, setMessage] = useState("");
//     const [loading, setLoading] = useState(true);
//     const router = useRouter();
//     const [provinces, setProvinces] = useState<Province[]>([]);
//     const [districts, setDistricts] = useState<District[]>([]);
//     const [wards, setWards] = useState<Ward[]>([]);
//     const [selectedProvince, setSelectedProvince] = useState("");
//     const [selectedDistrict, setSelectedDistrict] = useState("");
//     const [isOrdering, setIsOrdering] = useState(false);
//     const [orderSuccess, setOrderSuccess] = useState(false);
//     const [voucherCode, setVoucherCode] = useState("");
//     const [voucherMessage, setVoucherMessage] = useState("");
//     const [voucherSuccess, setVoucherSuccess] = useState(false);
//     const [discountAmount, setDiscountAmount] = useState(0);
//     const [thongbao, setThongbao] = useState("");

//     useEffect(() => {
//         fetch("https://provinces.open-api.vn/api/p/")
//             .then((res) => res.json())
//             .then((data) => setProvinces(data));
//     }, []);

//     useEffect(() => {
//         if (selectedProvince) {
//             fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
//                 .then((res) => res.json())
//                 .then((data) => setDistricts(data.districts));
//         } else {
//             setDistricts([]);
//             setWards([]);
//         }
//     }, [selectedProvince]);

//     useEffect(() => {
//         if (selectedDistrict) {
//             fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
//                 .then((res) => res.json())
//                 .then((data) => setWards(data.wards));
//         } else {
//             setWards([]);
//         }
//     }, [selectedDistrict]);

//     const handleOrder = () => {
//         setIsOrdering(true);
//         setTimeout(() => {
//             setIsOrdering(false);
//             setOrderSuccess(true);
//         }, 3000);
//     };

//     useEffect(() => {
//         const fetchUser = async () => {
//             const token = localStorage.getItem("token");
//             if (!token) {
//                 setMessage("Chưa đăng nhập!");
//                 setLoading(false);
//                 return;
//             }

//             try {
//                 const res = await fetch("http://localhost:3000/api/check-auth", {
//                     method: "GET",
//                     credentials: "include",
//                     headers: {
//                         "Content-Type": "application/json",
//                         "Authorization": `Bearer ${token}`,
//                     },
//                 });

//                 const data = await res.json();
//                 if (res.ok) {
//                     setUser(data.user);
//                 } else {
//                     setMessage(data.message);
//                     localStorage.removeItem("token");
//                 }
//             } catch (error) {
//                 setMessage("Lỗi kết nối đến server!");
//                 console.error("Lỗi kết nối:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUser();
//     }, []);

//     const listSP: ICart[] = useSelector((state: RootState) => state.cart.listSp);
//     const user_id = user?.user_id;
//     const subtotal = listSP.reduce((sum, item) => sum + item.gia_mua * item.so_luong, 0);
//     const shippingFee = subtotal < 200000 ? 20000 : 0;

//     useEffect(() => {
//         if (listSP.length === 0) {
//             alert("Bạn chưa chọn sản phẩm nào. Vui lòng chọn sản phẩm rồi mới thanh toán");
//             router.push("/");
//         }
//     }, [listSP, router]);

//     const ghichuRef = useRef<HTMLTextAreaElement>(null);
//     const paymentRef = useRef<HTMLInputElement[]>([]);

//     const submitDuLieu = async () => {
//         const ghi_chu = ghichuRef.current?.value;
//         const selectedValue = Object.values(paymentRef.current).find((el) => el?.checked)?.value;
//         const paymentCode = selectedValue === "bank" ? 1 : 0;
//         const email = user?.email;

//         if (!user_id) {
//             setThongbao("Lỗi: Không tìm thấy user_id");
//             return;
//         }

//         try {
//             const res = await fetch("http://localhost:3000/api/luudonhang", {
//                 method: "POST",
//                 body: JSON.stringify({
//                     user_id,
//                     ghi_chu,
//                     payment: paymentCode,
//                     voucher: voucherCode,
//                     email,
//                     products: listSP,
//                 }),
//                 headers: { "Content-Type": "application/json" },
//             });

//             const data = await res.json();
//             setThongbao(data.thong_bao);

//             if (data.don_hang) {
//                 router.push("/thanh-toan/hoan-tat");
//             }
//         } catch (err) {
//             console.error("Lỗi request lưu đơn hàng:", err);
//             setThongbao("Có lỗi xảy ra, vui lòng thử lại!");
//         }
//     };

//     const applyVoucher = async () => {
//         if (!voucherCode) return;

//         try {
//             const res = await fetch("http://localhost:3000/api/voucher/apply", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ code: voucherCode, order_total: subtotal }),
//             });

//             const data = await res.json();

//             if (data.success) {
//                 setVoucherSuccess(true);
//                 setVoucherMessage(data.message);
//                 setDiscountAmount(data.discount);
//             } else {
//                 setVoucherSuccess(false);
//                 setVoucherMessage(data.message);
//                 setDiscountAmount(0);
//             }
//         } catch (err) {
//             console.error("Lỗi áp dụng voucher:", err);
//             setVoucherSuccess(false);
//             setVoucherMessage("Có lỗi xảy ra khi áp dụng mã giảm giá");
//             setDiscountAmount(0);
//         }
//     };

//     const handleClick = () => {
//         handleOrder();
//         submitDuLieu();
//     };

//     return (
//         <div className="checkout-container">
//             <div className="checkout-left">
//                 <a href="">F1GENZ Shoes</a>
//                 <h3>Thông tin nhận hàng</h3>
//                 {user && (
//                     <form id="checkout-form">
//                         <input type="email" placeholder="Email" required defaultValue={user.email} />
//                         <input type="text" placeholder="Họ và tên" required defaultValue={user.name} />
//                         <input type="tel" placeholder="Số điện thoại (tùy chọn)" defaultValue={user.phone} />
//                         <input type="text" placeholder="Địa chỉ (tùy chọn)" defaultValue={user.addresses?.address} />
//                         <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} required>
//                             <option value="">Chọn Tỉnh/Thành</option>
//                             {provinces.map((p) => (
//                                 <option key={p.code} value={p.code}>
//                                     {p.name}
//                                 </option>
//                             ))}
//                         </select>
//                         <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} required>
//                             <option value="">Chọn Quận/Huyện</option>
//                             {districts.map((d) => (
//                                 <option key={d.code} value={d.code}>
//                                     {d.name}
//                                 </option>
//                             ))}
//                         </select>
//                         <select required>
//                             <option value="">Chọn Phường/Xã</option>
//                             {wards.map((w) => (
//                                 <option key={w.code} value={w.code}>
//                                     {w.name}
//                                 </option>
//                             ))}
//                         </select>
//                         <textarea placeholder="Ghi chú (tùy chọn)" ref={ghichuRef}></textarea>
//                         <div className="text-red-500 font-bold italic text-2xl">{thongbao}</div>
//                     </form>
//                 )}
//             </div>

//             <div className="checkout-extra">
//                 <h3>Vận chuyển</h3>
//                 <p className="vanchuyen">Vui lòng nhập thông tin giao hàng</p>
//                 <h3>Thanh toán</h3>
//                 <div className="boc">
//                     <input
//                         type="radio"
//                         name="payment"
//                         value="bank"
//                         className="input-radio"
//                         ref={(el) => {
//                             if (el) paymentRef.current[0] = el;
//                         }}
//                     />
//                     <label>Chuyển khoản</label>
//                     <i className="fa-solid fa-money-bill" style={{ color: "#337ab7" }}></i>
//                 </div>
//                 <div className="boc">
//                     <input
//                         type="radio"
//                         name="payment"
//                         value="cod"
//                         className="input-radio"
//                         defaultChecked
//                         ref={(el) => {
//                             if (el) paymentRef.current[1] = el;
//                         }}
//                     />
//                     <label>Thu hộ (COD)</label>
//                     <i className="fa-solid fa-money-bill" style={{ color: "#337ab7" }}></i>
//                 </div>
//             </div>

//             <div className="checkout-right">
//                 <h3>Đơn hàng ({listSP.length} sản phẩm)</h3>
//                 <div className="items">
//                     {listSP.map((item, idx) => (
//                         <div className="order-item" key={idx}>
//                             <img src={`img/${item.hinh}`} alt={item.ten_sp} />
//                             <span>{item.ten_sp}</span>
//                             <span>{(item.gia_mua * item.so_luong).toLocaleString("vi")}VNĐ</span>
//                         </div>
//                     ))}
//                 </div>

//                 <div className="discound">
//                     <input type="text" placeholder="Nhập mã giảm giá" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} />
//                     <button onClick={applyVoucher}>Áp dụng</button>
//                 </div>
//                 {voucherMessage && <p style={{ color: voucherSuccess ? "green" : "red" }}>{voucherMessage}</p>}

//                 <div className="tinhtien">
//                     <div className="tamtinh">
//                         <p>Tạm tính:</p>
//                         <span>{subtotal.toLocaleString("vi")}VNĐ</span>
//                     </div>
//                     <div className="tamtinh" style={{ borderBottom: "1px solid #ddd" }}>
//                         <p>Phí vận chuyển:</p>
//                         <span>{shippingFee.toLocaleString("vi")}VNĐ</span>
//                     </div>
//                 </div>
//                 <h3 style={{ padding: "10px 0" }}>
//                     Tổng cộng: <span>{(subtotal + shippingFee - discountAmount).toLocaleString("vi")}VNĐ</span>
//                 </h3>
//                 <button onClick={handleClick} disabled={isOrdering}>
//                     {isOrdering ? "Đang xử lý..." : "ĐẶT HÀNG"}
//                 </button>
//                 {orderSuccess && (
//                     <p id="order-status" style={{ color: "green" }}>
//                         Đặt hàng thành công!
//                     </p>
//                 )}
//             </div>
//         </div>
//     );
// }
