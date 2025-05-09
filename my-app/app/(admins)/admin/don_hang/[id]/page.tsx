'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IDonHang } from '@/app/(client)/components/cautrucdata';

export default function DonHangChiTiet() {
    const { id } = useParams();
    const router = useRouter();
    const [donHang, setDonHang] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [discount, setDiscount] = useState<number>(0);
    const [finalTotal, setFinalTotal] = useState<number | null>(null);

    const tongTien = useMemo(() => {
        if (!donHang || !donHang.cartitem) return 0;
        return donHang.cartitem.reduce(
            (sum: number, item: any) => sum + item.product.discount_price * item.quantity,
            0
        );
    }, [donHang]);

    useEffect(() => {
        fetch(`http://localhost:3000/api/donhang/${id}`)
            .then(res => res.json())
            .then(data => setDonHang(data))
            .catch(err => console.error("Lỗi khi tải đơn hàng:", err));
    }, [id]);

    useEffect(() => {
        if (!donHang?.voucher || !tongTien) return;

        const applyVoucher = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/voucher/apply', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: donHang.voucher,
                        order_total: tongTien,
                    }),
                });

                const data = await res.json();
                if (res.ok) {
                    setDiscount(data.discount);
                    setFinalTotal(data.final_total);
                } else {
                    alert(data.message);
                }
            } catch (err) {
                console.error('Lỗi khi áp dụng voucher:', err);
                alert('Đã xảy ra lỗi khi áp dụng mã giảm giá');
            }
        };

        applyVoucher();
    }, [donHang, tongTien]);

    if (!donHang) return <div className="text-center py-10">Loading...</div>;

    const updateStatusWay = async (statusWay: number) => {
        if (donHang.cartitem?.[0]?.status_way === statusWay) return;

        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/admin/donhang/updateStatusWay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart_id: donHang.cart_id,
                    status_way: statusWay,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setDonHang((prevDonHang: any) => ({
                    ...prevDonHang,
                    cartitem: prevDonHang.cartitem.map((item: any) =>
                        item.cart_id === donHang.cart_id ? { ...item, status_way: statusWay } : item
                    ),
                }));
                alert(data.thong_bao);
            } else {
                alert(data.thong_bao);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái vận chuyển:", error);
            alert("Lỗi khi cập nhật trạng thái vận chuyển");
        } finally {
            setLoading(false);
        }
    };

    const updateStatusPayment = async (status: number) => {
        if (donHang.cartitem?.[0]?.status === status) return;

        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/admin/donhang/updateStatusPayment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart_id: donHang.cart_id,
                    status: status === 1,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setDonHang((prevDonHang: any) => ({
                    ...prevDonHang,
                    cartitem: prevDonHang.cartitem.map((item: any) =>
                        item.cart_id === donHang.cart_id ? { ...item, status: status } : item
                    ),
                }));
                alert(data.thong_bao);
            } else {
                alert(data.thong_bao);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái thanh toán:", error);
            alert("Lỗi khi cập nhật trạng thái thanh toán");
        } finally {
            setLoading(false);
        }
    };
    const shippingFee = finalTotal || tongTien < 200000 ? 20000 : 0;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Chi tiết đơn hàng #{donHang.ma_dh}</h2>

            <div className="mb-6 space-y-2">
                <p><strong>Khách hàng:</strong> {donHang.user?.name}</p>
                <p><strong>Email:</strong> {donHang.user?.email}</p>
                <p><strong>Ghi chú:</strong> {donHang.ghi_chu}</p>
                <div className=''>
                    <p><strong>Trạng thái thanh toán:</strong></p>
                    <select
                        value={donHang.cartitem?.[0]?.status ? 1 : 0}
                        onChange={(e) => updateStatusPayment(Number(e.target.value))}
                        className="p-2 border rounded"
                        disabled={loading}
                    >
                        <option value={0} disabled={Number(donHang.cartitem?.[0]?.status) === 1}>
                            Chưa thanh toán
                        </option>
                        <option value={1}>Đã thanh toán</option>
                    </select>

                    <p><strong>Hình thức thanh toán:</strong></p>
                    <select
                        value={Number(donHang.payment)}
                        className="p-2 border rounded"
                        disabled
                    >
                        <option value={0}>Thanh toán bằng tiền mặt</option>
                        <option value={1}>Thanh toán bằng thẻ tín dụng</option>
                    </select>
                    {donHang.voucher && (
                        <>
                            <p><strong>Voucher giảm giá:</strong> {donHang.voucher}</p>
                            {discount > 0 && (
                                <p className="text-sm text-gray-700">
                                    <strong>Giảm giá:</strong>{' '}
                                    <span className="text-green-600">-{discount.toLocaleString()}₫</span>
                                </p>
                            )}
                        </>
                    )}
                </div>


                {/* {finalTotal && (
                    <tr className="border-t font-bold bg-gray-200">
                        <td colSpan={5} className="py-3 px-4 text-right">Tổng thanh toán:</td>
                        <td className="py-3 px-4 text-right text-red-700">
                            {finalTotal.toLocaleString()}₫
                        </td>
                    </tr>
                )} */}

                <p><strong>Trạng thái vận chuyển:</strong></p>
                <select
                    value={Number(donHang.cartitem?.[0]?.status_way) || 0}
                    onChange={(e) => updateStatusWay(Number(e.target.value))}
                    className="p-2 border rounded"
                    disabled={loading}
                >
                    <option value={0} disabled={Number(donHang.cartitem?.[0]?.status_way) > 0}>
                        Chưa vận chuyển
                    </option>
                    <option
                        value={1}
                        disabled={Number(donHang.cartitem?.[0]?.status_way) > 1 || Number(donHang.cartitem?.[0]?.status_way) < 0}
                    >
                        Đang vận chuyển
                    </option>
                    <option
                        value={2}
                        disabled={Number(donHang.cartitem?.[0]?.status_way) < 1}
                    >
                        Đã tới nơi
                    </option>
                </select>

                <p><strong>Ngày tạo:</strong> {new Date(donHang.created_at).toLocaleDateString()}</p>
                <p><strong>Phí vận chuyển:</strong> {shippingFee.toLocaleString('vi')}₫</p>
            </div>

            <h3 className="text-xl font-semibold mb-3">Danh sách sản phẩm:</h3>

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 bg-white shadow-md rounded-xl overflow-hidden">
                    <thead className="bg-gray-100 text-black">
                        <tr>
                            <th className="py-3 px-4 text-left">Hình ảnh</th>
                            <th className="py-3 px-4 text-left">Tên sản phẩm</th>
                            <th className="py-3 px-4 text-center">Số lượng</th>
                            <th className="py-3 px-4 text-center">Size</th>
                            <th className="py-3 px-4 text-right">Đơn giá</th>
                            <th className="py-3 px-4 text-right">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donHang.cartitem?.map((item: any) => (
                            <tr key={item.item_id} className="border-t">
                                <td className="py-2 px-4">
                                    <img
                                        src={`/img/${item.product?.img}`}
                                        alt={item.product?.name}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                </td>
                                <td className="py-2 px-4">{item.product?.name}</td>
                                <td className="py-2 px-4 text-center">{item.quantity}</td>
                                <td className="py-2 px-4 text-center">{item.size}</td>
                                <td className="py-2 px-4 text-center">
                                    {item.product.discount_price ? item.product.discount_price : item.product.price}
                                </td>
                                <td className="py-2 px-4 text-right">
                                    {(item.product.discount_price * item.quantity).toLocaleString()}₫
                                </td>
                            </tr>
                        ))}
                        {(finalTotal || tongTien) && (
                            <tr className="bg-gray-100 border-t font-semibold">
                                <td colSpan={5} className="py-3 px-4 text-right">Tổng tiền:</td>
                                <td className="py-3 px-4 text-right text-red-600">
                                    {((finalTotal ?? tongTien)+shippingFee).toLocaleString()}₫
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>
            </div>

            <button
                onClick={() => router.back()}
                className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm float-right text-black"
            >
                ← Quay lại
            </button>
        </div >
    );
}
