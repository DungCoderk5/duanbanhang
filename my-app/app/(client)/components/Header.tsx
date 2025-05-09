"use client";
import "../style/style.css";
import ThanhMenu from "./ThanhMenu";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { ICart } from "../components/cautrucdata";
import { IUser } from "../components/cautrucdata";
import { RootState } from "@/lib/store";
import Link from "next/link";
export default function Header() {
    const cartItems: ICart[] = useSelector((state: RootState) => state.cart.listSp);
    const [user, setUser] = useState<IUser | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    // Tính tổng số lượng sản phẩm
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.so_luong, 0);
    const [tuKhoa, setTuKhoa] = useState("");
    const router = useRouter();
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (tuKhoa.trim()) {
            router.push(`/tim_kiem?tu_khoa=${encodeURIComponent(tuKhoa)}`);
        }
    };
    const handleLogout = () => {
        localStorage.removeItem("token"); // Xóa token
        setUser(null); // Cập nhật trạng thái user
        router.push("/dang_nhap"); // Chuyển hướng về trang đăng nhập
    };

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
                    // if (data.user.role === "admin") {
                    //     router.push("/admin");
                    // }
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

        fetchUser();
    }, []);
    return (

        <header className="header">
            <div className="bg-[#c10a28] text-white text-center h-[40px] leading-[40px]">
                <div className="container1" style={{ width: "1170px" }}>
                    <div>
                        <div className="rows">
                            <div className="col-sm-5 col-md-6 text-left text-[16px]">
                                <ul className="list-inline float-left">
                                    <li>
                                        <i className="fa fa-phone-square"
                                            style={{ fontSize: "20px", display: "inline-block", position: "relative", transform: "translateY(2px)" }}>
                                        </i>

                                        <span>

                                            <a href="callto:19006750"> 1900 6750</a>

                                        </span>
                                    </li>
                                    <li className="margin-left-20">
                                        <i className="fa fa-clock-o"></i>
                                        <span>
                                            Thứ 2 - Chủ nhật: 9:00 - 18:00
                                        </span>

                                    </li>
                                </ul>

                            </div>
                            <div className="col-sm-7 col-md-6 text-[16px]">

                                <ul className="list-inline float-right">

                                    {user ? (
                                        <>
                                            <li className="li-use">
                                                <Link href="/account">
                                                    <span className="text-[#fff]">Chào, {user.name}</span>
                                                </Link>
                                            </li>
                                            <li className="li-use">
                                                <button className="cursor-pointer" onClick={handleLogout}>
                                                    <span className="text-[#fff]">Đăng xuất</span>
                                                </button>
                                            </li>

                                            {/* Kiểm tra role là admin */}
                                            {user.role === "admin" && (
                                                <li className="li-use">
                                                    <Link href="/admin">
                                                        <span className="text-[#fff]">Quản lý</span>
                                                    </Link>
                                                </li>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <li className="li-use">
                                                <Link className="text-white" href="/dang_ky">Đăng ký</Link>
                                            </li>
                                            <li className="li-use">
                                                <Link className="text-white" href="/dang_nhap">Đăng nhập</Link>
                                            </li>
                                        </>
                                    )}


                                    <li className="li-search"><a href="#">
                                        <i className="fa fa-search text-[#fff]"></i></a>
                                        <div className="dropdown topbar-dropdown  hidden-sm hidden-xs">
                                            <div className="content a-center">
                                                <div className="header_search search_form">
                                                    <form className="input-group search-bar search_form" onSubmit={handleSearch} role="search" >
                                                        <input type="search" name="query" placeholder="Tìm sản phẩm"
                                                            className="input-group-field st-default-search-input search-text" autoComplete="off" value={tuKhoa}
                                                            onChange={(e) => setTuKhoa(e.target.value)} />

                                                        <span className="input-group-btn ">
                                                            <button className="btn icon-fallback-text" type="submit">
                                                                <i className="fa fa-search"></i>
                                                            </button>
                                                        </span>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </li>

                                    <li className="li-cart">
                                        <div className="top-cart-contain">
                                            <div className="mini-cart text-xs-center">
                                                <div className="heading-cart text-white">
                                                    <Link href="/gio_hang">
                                                        <div className="icon text-white">
                                                            <i className="fa fa-shopping-basket"></i>
                                                        </div>

                                                        <div className="right-content">
                                                            <span className="cartCount2 text-[#fff]">({totalQuantity})</span>
                                                        </div>
                                                    </Link>
                                                </div>
                                                <div className="top-cart-content">
                                                    <ul id="cart-sidebar" className="mini-products-list count_li">
                                                        <div className="no-item" style={{ display: "none" }}>
                                                            <p>Không có sản phẩm nào trong giỏ hàng.</p>
                                                        </div>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                </ul>

                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <div className="container1">
                <div className="header-content clearfix">
                    <ThanhMenu></ThanhMenu>
                </div>
            </div>
            <nav className="main-collection">
                <div className="container1">
                    <ul className="nav_collec_mn hidden-xs hidden-sm">
                        <li className="nav-item ">
                            <a className="nav-link" href="/sptrongloai/1">

                                <img className="icon_menu"
                                    src="//bizweb.dktcdn.net/100/310/257/themes/801944/assets/menu_icon_1.png?1676001091788" alt="Pizza" />

                                Pizza
                            </a>
                        </li>

                        <li className="nav-item ">
                            <Link className="nav-link" href="/sptrongloai/2">

                                <img className="icon_menu"
                                    src="//bizweb.dktcdn.net/100/310/257/themes/801944/assets/menu_icon_2.png?1676001091788" alt="Burger" />

                                Burger
                            </Link>
                        </li>

                        <li className="nav-item ">
                            <Link className="nav-link" href="/sptrongloai/3">

                                <img className="icon_menu"
                                    src="//bizweb.dktcdn.net/100/310/257/themes/801944/assets/menu_icon_3.png?1676001091788" alt="Đồ uống" />

                                Đồ uống
                            </Link>
                        </li>

                        <li className="nav-item ">
                            <Link className="nav-link" href="/sptrongloai/4">

                                <img className="icon_menu"
                                    src="//bizweb.dktcdn.net/100/310/257/themes/801944/assets/menu_icon_4.png?1676001091788" alt="Trà Sữa" />

                                Trà Sữa
                            </Link>
                        </li>

                        <li className="nav-item ">
                            <Link className="nav-link" href="/sptrongloai/5">

                                <img className="icon_menu"
                                    src="//bizweb.dktcdn.net/100/310/257/themes/801944/assets/menu_icon_5.png?1676001091788"
                                    alt="Khoai chiên" />

                                Khoai chiên
                            </Link>
                        </li>
                        <li className="nav-item ">
                            <Link className="nav-link" href="/sptrongloai/6">

                                <img className="icon_menu"
                                    src="//bizweb.dktcdn.net/100/310/257/themes/801944/assets/menu_icon_6.png?1676001091788" alt="Hoa quả" />

                                Hoa quả
                            </Link>
                        </li>


                    </ul>
                    <div className="hidden-lg hidden-md menu-offcanvas">
                        <div className="head-menu clearfix">
                            <ul className="list-inline">

                                <li>
                                    <a href="/account/login"><i className="fa fa-user"></i> Đăng nhập</a>

                                </li>
                                <li><span>hoặc</span></li>
                                <li><a href="/account/register">Đăng ký</a>
                                </li>


                                <li className="li-search">
                                    <div className="header_search search_form">
                                        <form className="input-group search-bar search_form" action="/search" method="get" role="search">
                                            <input type="search" name="query" placeholder="Tìm sản phẩm"
                                                className="input-group-field st-default-search-input search-text" autoComplete="off" />

                                            <span className="input-group-btn">
                                                <button className="btn icon-fallback-text">
                                                    <i className="fa fa-search"></i>
                                                </button>
                                            </span>
                                        </form>
                                    </div>

                                </li>
                            </ul>
                            <div className="menuclose"><i className="fa fa-close"></i></div>
                        </div>
                        <ul id="nav-mobile" className="nav hidden-md hidden-lg">
                            <li className="h3">
                                MENU
                            </li>


                            <li className="nav-item active"><a className="nav-link" href="/">Trang chủ</a></li>



                            <li className="nav-item "><a className="nav-link" href="/gioi-thieu">Giới thiệu</a></li>



                            <li className="nav-item ">
                                <a href="/collections/all" className="nav-link">Thực đơn <i className="fa faa fa-angle-right"></i></a>

                                <ul className="dropdown-menu">


                                    <li className="dropdown-submenu nav-item-lv2">
                                        <a className="nav-link" href="/">Bánh Piza <i className="fa faa fa-angle-right"></i></a>

                                        <ul className="dropdown-menu">

                                            <li className="nav-item-lv3">
                                                <a className="nav-link" href="/">Pizza Hải Sản</a>
                                            </li>

                                            <li className="nav-item-lv3">
                                                <a className="nav-link" href="/">Pizza Rau Củ</a>
                                            </li>

                                        </ul>
                                    </li>

                                    <li className="nav-item-lv2">
                                        <a className="nav-link" href="/">Burger</a>
                                    </li>

                                    <li className="nav-item-lv2">
                                        <a className="nav-link" href="/">Đồ uống</a>
                                    </li>

                                    <li className="nav-item-lv2">
                                        <a className="nav-link" href="/">Trà sữa</a>
                                    </li>

                                    <li className="nav-item-lv2">
                                        <a className="nav-link" href="/">Hoa quả</a>
                                    </li>

                                    <li className="nav-item-lv2">
                                        <a className="nav-link" href="/">Salad</a>
                                    </li>

                                    <li className="nav-item-lv2">
                                        <a className="nav-link" href="/">Xúc xích</a>
                                    </li>

                                    <li className="nav-item-lv2">
                                        <a className="nav-link" href="/">Khoai tây</a>
                                    </li>

                                    <li className="nav-item-lv2">
                                        <a className="nav-link" href="/">Piza</a>
                                    </li>
                                </ul>
                            </li>
                            <li className="nav-item "><a className="nav-link" href="/tin-tuc">Tin tức</a></li>

                            <li className="nav-item "><a className="nav-link" href="/lien-he">Liên hệ</a></li>

                            <li className="nav-item "><a className="nav-link" href="/gioi-thieu">Nhượng quyền</a></li>
                            <li className="h3">
                                Danh mục
                            </li>

                            <li className="nav-item ">
                                <a className="nav-link" href="/san-pham-noi-bat">

                                    <img className="icon_menu"
                                        src="//bizweb.dktcdn.net/100/310/257/themes/801944/assets/menu_icon_1.png?1676001091788" alt="Pizza" />

                                    Pizza
                                </a>
                            </li>


                            <li className="nav-item ">
                                <a className="nav-link" href="/san-pham-khuyen-mai">

                                    <img className="icon_menu"
                                        src="//bizweb.dktcdn.net/100/310/257/themes/801944/assets/menu_icon_2.png?1676001091788" alt="Burger" />

                                    Burger
                                </a>
                            </li>


                            <li className="nav-item ">
                                <a className="nav-link" href="/san-pham-ban-chay">

                                    <img className="icon_menu"
                                        src="//bizweb.dktcdn.net/100/310/257/themes/801944/assets/menu_icon_3.png?1676001091788"
                                        alt="Đồ uống" />

                                    Đồ uống
                                </a>
                            </li>


                            <li className="nav-item ">
                                <a className="nav-link" href="/dang-giam-gia">

                                    <img className="icon_menu"
                                        src="//bizweb.dktcdn.net/100/310/257/themes/801944/assets/menu_icon_4.png?1676001091788"
                                        alt="Trà Sữa" />

                                    Trà Sữa
                                </a>
                            </li>


                            <li className="nav-item ">
                                <a className="nav-link" href="/com-tron">

                                    <img className="icon_menu"
                                        src="//bizweb.dktcdn.net/100/310/257/themes/801944/assets/menu_icon_5.png?1676001091788"
                                        alt="Khoai chiên" />

                                    Khoai chiên
                                </a>
                            </li>


                            <li className="nav-item ">
                                <a className="nav-link" href="/ga-ran">

                                    <img className="icon_menu"
                                        src="//bizweb.dktcdn.net/100/310/257/themes/801944/assets/menu_icon_6.png?1676001091788"
                                        alt="Hoa quả" />

                                    Hoa quả
                                </a>
                            </li>
                        </ul>

                    </div>
                </div>
            </nav>
        </header>
    );
}
