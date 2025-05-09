"use client"
import { div } from "motion/react-client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import "./sccc.css";
import { IDonHang } from "@/app/(client)/components/cautrucdata";
import NestedDonutChart from "./component/chart";
import RevenueChart from "./component/chart2";
import TaskChart from "./component/chart3";
export default function Dashboard() {
    const [salesData, setSalesData] = useState({
        currentMonthTotalSold: 0,
        previousMonthTotalSold: 0,
        percentageChange: 0
    });
    const [donHang, setDonHang] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [voucherCode, setVoucherCode] = useState<string>(""); // Voucher code state
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [finalTotals, setFinalTotals] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        // Fetch sales data
        fetch("http://localhost:3000/api/admin/product/sold")
            .then(response => response.json())
            .then(data => setSalesData(data))
            .catch(error => console.error("Error fetching sales data:", error));

        // Fetch orders with pagination
        fetch(`http://localhost:3000/api/donhang?page=${currentPage}&limit=5`)
            .then(response => response.json())
            .then(data => {
                setDonHang(data.donhang);
                setTotalPages(data.pagination?.totalPages || 1);
            })
            .catch(error => console.error("Error fetching orders:", error));

    }, [currentPage]);

    // Apply voucher to order
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

    // Apply voucher to each order and update the final total
    useEffect(() => {
        const updateFinalTotals = async () => {
            const updatedTotals: { [key: string]: number } = {};
            for (const order of donHang) {
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
    }, [donHang, voucherCode]);

    // Handle page change
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    return (
        <div >
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels"></script>

            <header>
                <div className="title">
                    <h1>Analytics</h1>
                </div>
                <div className="profile" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "30px" }}>

                    <div className="avatar" style={{ display: "flex", alignItems: "center" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                            aria-hidden="true" role="img" className="MuiBox-root css-0 iconify iconify--twemoji" width="1em"
                            height="1em" viewBox="0 0 36 36">
                            <path fill="#00247D"
                                d="M0 9.059V13h5.628zM4.664 31H13v-5.837zM23 25.164V31h8.335zM0 23v3.941L5.63 23zM31.337 5H23v5.837zM36 26.942V23h-5.631zM36 13V9.059L30.371 13zM13 5H4.664L13 10.837z">
                            </path>
                            <path fill="#CF1B2B"
                                d="m25.14 23l9.712 6.801a4 4 0 0 0 .99-1.749L28.627 23zM13 23h-2.141l-9.711 6.8c.521.53 1.189.909 1.938 1.085L13 23.943zm10-10h2.141l9.711-6.8a4 4 0 0 0-1.937-1.085L23 12.057zm-12.141 0L1.148 6.2a4 4 0 0 0-.991 1.749L7.372 13z">
                            </path>
                            <path fill="#EEE"
                                d="M36 21H21v10h2v-5.836L31.335 31H32a4 4 0 0 0 2.852-1.199L25.14 23h3.487l7.215 5.052c.093-.337.158-.686.158-1.052v-.058L30.369 23H36zM0 21v2h5.63L0 26.941V27c0 1.091.439 2.078 1.148 2.8l9.711-6.8H13v.943l-9.914 6.941c.294.07.598.116.914.116h.664L13 25.163V31h2V21zM36 9a3.98 3.98 0 0 0-1.148-2.8L25.141 13H23v-.943l9.915-6.942A4 4 0 0 0 32 5h-.663L23 10.837V5h-2v10h15v-2h-5.629L36 9.059zM13 5v5.837L4.664 5H4a4 4 0 0 0-2.852 1.2l9.711 6.8H7.372L.157 7.949A4 4 0 0 0 0 9v.059L5.628 13H0v2h15V5z">
                            </path>
                            <path fill="#CF1B2B" d="M21 15V5h-6v10H0v6h15v10h6V21h15v-6z"></path>
                        </svg>
                        <i className="fa-solid fa-bell"></i>
                        <img src="src/assets/images/avater.png" className="MuiAvatar-img css-1pqm26d-MuiAvatar-img" />
                        <p>DŨng nè</p>
                    </div>
                </div>


            </header>
            <div className="cards">
                <div className="card">
                    <div className="cart-items">
                        <div className="cart-left">
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                                aria-hidden="true" role="img" className="MuiBox-root css-1rm6t06 iconify iconify--carbon"
                                width="1em" height="1em" viewBox="0 0 32 32">
                                <path fill="currentColor"
                                    d="M22.5 4c-2 0-3.9.8-5.3 2.2L16 7.4l-1.1-1.1c-2.9-3-7.7-3-10.6-.1l-.1.1c-3 3-3 7.8 0 10.8L16 29l11.8-11.9c3-3 3-7.8 0-10.8C26.4 4.8 24.5 4 22.5 4">
                                </path>
                            </svg>
                            <p>Save Products</p>
                        </div>
                        <div className="cart-right">
                            <i className="fa-solid fa-ellipsis"></i>
                        </div>
                    </div>
                    <div className="doanhthu">
                        <span>50.8K</span>
                        <div className="grow1">
                            <p>28.4%</p>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                                aria-hidden="true" role="img"
                                className="MuiChip-icon MuiChip-iconSmall MuiChip-iconColorDefault MuiBox-root css-q9hg5d iconify iconify--mingcute"
                                width="1em" height="1em" viewBox="0 0 24 24">
                                <g fill="none">
                                    <path
                                        d="M24 0v24H0V0zM12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.105.074l.014.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.092l.01-.009l.004-.011l.017-.43l-.003-.012l-.01-.01z">
                                    </path>
                                    <path fill="currentColor"
                                        d="M18 5a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V8.414l-9.95 9.95a1 1 0 0 1-1.414-1.414L15.586 7H10a1 1 0 1 1 0-2z">
                                    </path>
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="cart-items">
                        <div className="cart-left">
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                                aria-hidden="true" role="img" className="MuiBox-root css-1rm6t06 iconify iconify--solar"
                                width="1em" height="1em" viewBox="0 0 24 24">
                                <path fill="currentColor" fillRule="evenodd"
                                    d="M8.25 6.015V5a3.75 3.75 0 0 1 7.5 0v1.015c1.287.039 2.075.177 2.676.676c.833.692 1.053 1.862 1.492 4.203l.75 4c.617 3.292.925 4.938.026 6.022C19.794 22 18.119 22 14.77 22H9.23c-3.35 0-5.024 0-5.924-1.084s-.59-2.73.026-6.022l.75-4c.44-2.34.659-3.511 1.492-4.203c.601-.499 1.389-.637 2.676-.676M9.75 5a2.25 2.25 0 1 1 4.5 0v1h-4.5z"
                                    clipRule="evenodd"></path>
                            </svg>
                            <p>Stock Products
                            </p>
                        </div>
                        <div className="cart-right">
                            <i className="fa-solid fa-ellipsis"></i>
                        </div>
                    </div>
                    <div className="doanhthu">
                        <span>23.6K</span>
                        <div className="grow1">
                            <p>28.4%</p>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                                aria-hidden="true" role="img"
                                className="MuiChip-icon MuiChip-iconSmall MuiChip-iconColorDefault MuiBox-root css-q9hg5d iconify iconify--mingcute"
                                width="1em" height="1em" viewBox="0 0 24 24">
                                <g fill="none">
                                    <path
                                        d="M24 0v24H0V0zM12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.105.074l.014.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.092l.01-.009l.004-.011l.017-.43l-.003-.012l-.01-.01z">
                                    </path>
                                    <path fill="currentColor"
                                        d="M18 5a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V8.414l-9.95 9.95a1 1 0 0 1-1.414-1.414L15.586 7H10a1 1 0 1 1 0-2z">
                                    </path>
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="cart-items">
                        <div className="cart-left">
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                                aria-hidden="true" role="img" className="MuiBox-root css-1rm6t06 iconify iconify--carbon"
                                width="1em" height="1em" viewBox="0 0 32 32">
                                <path fill="currentColor"
                                    d="M22.5 4c-2 0-3.9.8-5.3 2.2L16 7.4l-1.1-1.1c-2.9-3-7.7-3-10.6-.1l-.1.1c-3 3-3 7.8 0 10.8L16 29l11.8-11.9c3-3 3-7.8 0-10.8C26.4 4.8 24.5 4 22.5 4">
                                </path>
                            </svg>
                            <p>Sale Product</p>
                        </div>
                        <div className="cart-right">
                            <i className="fa-solid fa-ellipsis"></i>
                        </div>
                    </div>
                    <div className="doanhthu">
                        <span>{salesData.currentMonthTotalSold.toLocaleString()}</span>
                        <div className={salesData.percentageChange >= 0 ? "grow1" : "grow2"}><p>{Math.abs(salesData.percentageChange).toFixed(2)}%</p>
                            {salesData.percentageChange >= 0 ? (
                                <i className="fa-solid fa-arrow-up rotate-arrow text-green-500"></i>
                            ) : (
                                <i className="fa-solid fa-arrow-down rotate-arrow text-red-500"></i>
                            )}
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="cart-items">
                        <div className="cart-left">
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                                aria-hidden="true" role="img" className="MuiBox-root css-1rm6t06 iconify iconify--carbon"
                                width="1em" height="1em" viewBox="0 0 32 32">
                                <path fill="currentColor"
                                    d="M22.5 4c-2 0-3.9.8-5.3 2.2L16 7.4l-1.1-1.1c-2.9-3-7.7-3-10.6-.1l-.1.1c-3 3-3 7.8 0 10.8L16 29l11.8-11.9c3-3 3-7.8 0-10.8C26.4 4.8 24.5 4 22.5 4">
                                </path>
                            </svg>
                            <p>Save Products</p>
                        </div>
                        <div className="cart-right">
                            <i className="fa-solid fa-ellipsis"></i>
                        </div>
                    </div>
                    <div className="doanhthu">
                        <span>50.8K</span>
                        <div className="grow1">
                            <p>28.4%</p>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                                aria-hidden="true" role="img"
                                className="MuiChip-icon MuiChip-iconSmall MuiChip-iconColorDefault MuiBox-root css-q9hg5d iconify iconify--mingcute"
                                width="1em" height="1em" viewBox="0 0 24 24">
                                <g fill="none">
                                    <path
                                        d="M24 0v24H0V0zM12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.105.074l.014.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.092l.01-.009l.004-.011l.017-.43l-.003-.012l-.01-.01z">
                                    </path>
                                    <path fill="currentColor"
                                        d="M18 5a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V8.414l-9.95 9.95a1 1 0 0 1-1.414-1.414L15.586 7H10a1 1 0 1 1 0-2z">
                                    </path>
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>

            </div>
            <div className="cards-1">

                <div className="card-left">
                    <div className="card" style={{ width: "100%" }}>
                        <div className="card-head">
                            <h2>Website Visitors</h2>
                            <button>Export <i className="fa-solid fa-arrow-down"></i></button>
                        </div>
                        <NestedDonutChart />

                    </div>

                </div>
                <div className="card-right">
                    <RevenueChart></RevenueChart>
                </div>

            </div>
            <div className="cards-2">
                <div className="card-left">
                    <h2>Product</h2>
                    <div className="card-left-head">
                        <p>Products</p>
                        <p>Price</p>
                    </div>
                    <div className="product-flex">
                        <div className="product-item">
                            <div className="title">
                                <div className="hinh">
                                    <img src="/img/hinh2.webp" alt="Hình ảnh mô tả" />


                                </div>
                                <div className="stock">
                                    <p>Tên sp</p>
                                    <span>3333 in stock</span>
                                </div>
                            </div>
                            <div className="price">
                                <p>$21212</p>
                            </div>
                        </div>
                        <div className="product-item">
                            <div className="title">
                                <div className="hinh">
                                    <img src="/img/hinh2.webp" alt="" />
                                </div>
                                <div className="stock">
                                    <p>Tên sp</p>
                                    <span>3333 in stock</span>
                                </div>
                            </div>
                            <div className="price">
                                <p>$21212</p>
                            </div>
                        </div>
                        <div className="product-item">
                            <div className="title">
                                <div className="hinh">
                                    <img src="/img/hinh2.webp" alt="" />
                                </div>
                                <div className="stock">
                                    <p>Tên sp</p>
                                    <span>3333 in stock</span>
                                </div>
                            </div>
                            <div className="price">
                                <p>$21212</p>
                            </div>
                        </div>
                        <div className="product-item">
                            <div className="title">
                                <div className="hinh">
                                    <img src="/img/hinh2.webp" alt="" />
                                </div>
                                <div className="stock">
                                    <p>Tên sp</p>
                                    <span>3333 in stock</span>
                                </div>
                            </div>
                            <div className="price">
                                <p>$21212</p>
                            </div>
                        </div>
                        <div className="product-item">
                            <div className="title">
                                <div className="hinh">
                                    <img src="/img/hinh2.webp" alt="" />
                                </div>
                                <div className="stock">
                                    <p>Tên sp</p>
                                    <span>3333 in stock</span>
                                </div>
                            </div>
                            <div className="price">
                                <p>$21212</p>
                            </div>
                        </div>
                        <div className="product-item">
                            <div className="title">
                                <div className="hinh">
                                    <img src="/img/hinh2.webp" alt="" />
                                </div>
                                <div className="stock">
                                    <p>Tên sp</p>
                                    <span>3333 in stock</span>
                                </div>
                            </div>
                            <div className="price">
                                <p>$21212</p>
                            </div>
                        </div>
                        <div className="product-item">
                            <div className="title">
                                <div className="hinh">
                                    <img src="/img/hinh2.webp" alt="" />
                                </div>
                                <div className="stock">
                                    <p>Tên sp</p>
                                    <span>3333 in stock</span>
                                </div>
                            </div>
                            <div className="price">
                                <p>$21212</p>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="card-right">
                    <div className="card1">
                        <p><i className="fa-regular fa-clock"></i> Completed tasks over time</p>

                        <div className="header">
                            <div
                                style={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
                                <h2>257</h2>
                                <div className="grow1">
                                    <p>28.4%</p>
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                                        aria-hidden="true" role="img"
                                        className="MuiChip-icon MuiChip-iconSmall MuiChip-iconColorDefault MuiBox-root css-q9hg5d iconify iconify--mingcute"
                                        width="1em" height="1em" viewBox="0 0 24 24">
                                        <g fill="none">
                                            <path
                                                d="M24 0v24H0V0zM12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.105.074l.014.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.092l.01-.009l.004-.011l.017-.43l-.003-.012l-.01-.01z">
                                            </path>
                                            <path fill="currentColor"
                                                d="M18 5a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V8.414l-9.95 9.95a1 1 0 0 1-1.414-1.414L15.586 7H10a1 1 0 1 1 0-2z">
                                            </path>
                                        </g>
                                    </svg>
                                </div>
                            </div>
                            <div className="calendar">
                                <p>Jan 2025</p>
                                <i className="fa-solid fa-calendar-day"></i>
                            </div>

                        </div>
                        <TaskChart></TaskChart>
                    </div>
                </div>
            </div>
            <div className="cards-3" style={{ paddingTop: "30px", clear: "both" }}>
                <div className="table-card-head">
                    <div className="head-left">
                        <h2>Order Status</h2>
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
                        <button>Create Order</button>
                    </div>
                </div>
                <div className="table-card-body">
                    <table style={{ width: "100%" }}>
                        <thead>
                            <tr>
                                <th>
                                    <div className="flex"><input type="checkbox" />
                                        <p>Order</p>
                                    </div>
                                </th>
                                <th>
                                    <div className="flex"><i className="fa-solid fa-user"></i>
                                        <p>Client</p>
                                    </div>
                                </th>
                                <th>
                                    <div className="flex"><i className="fa-solid fa-calendar-day"></i>
                                        <p>Date</p>
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
                                <th>Total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {donHang.map((order) => {
                                const finalTotal = finalTotals[order.cart_id]; // Get the final total from state
                                const tongtien = order.cartitem?.reduce((total: number, item: any) => {
                                    const price = item.product.discount_price || item.product.price;
                                    return total + price * item.quantity;
                                }, 0) - finalTotal;
                                const shippingFee = finalTotal < 200000 ? 20000 : 0;
                                return (
                                    <tr key={order.cart_id}>
                                        <td>
                                            <div className="flex"><input type="checkbox" />
                                                <p>#{order.ma_dh}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <p style={{ margin: "0", padding: "0" }} className="name">{order.user.name}</p>
                                                <p style={{ margin: "0", padding: "0", color: "#AEB9E1" }} className="email">
                                                    {order.user.email}</p>
                                            </div>
                                        </td>
                                        <td>{new Date(order.created_at).toLocaleDateString('vi')}</td>
                                        <td>
                                            <div className={
                                                order.cartitem?.[0]
                                                    ? Number(order.cartitem[0].status) === 3
                                                        ? "canceled"
                                                        : Number(order.cartitem[0].status) === 0
                                                            ? "pending"
                                                            : "delivered"
                                                    : ""
                                            }>
                                                <i className="fa-solid fa-circle"></i>
                                                <p>
                                                    {order.cartitem?.[0]
                                                        ? Number(order.cartitem[0].status) === 3
                                                            ? "Đã huỷ"
                                                            : Number(order.cartitem[0].status) === 0
                                                                ? "Chưa thanh toán"
                                                                : "Đã thanh toán"
                                                        : "Không có sản phẩm"}
                                                </p>

                                            </div>
                                        </td>
                                        <td>{order.address || "Không có địa chỉ"}</td>
                                        <td className="py-2 px-4">
                                            <span>
                                                {finalTotal ? (finalTotal + shippingFee).toLocaleString() : "Loading..."} ₫
                                            </span>
                                        </td>
                                        <td>
                                            <Link href={`/admin/don_hang/${order.cart_id}`}><i className="fa-solid fa-eye"></i></Link>
                                            <i className="fa-solid fa-trash"></i>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="pagination float-right">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        <span className="flex items-center">Page {currentPage} / {totalPages}</span>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>f
        </div>
    )
}