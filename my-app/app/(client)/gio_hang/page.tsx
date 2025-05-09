"use client";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { ICart } from "../components/cautrucdata";
import { suaSL, xoaSP } from "@/lib/cartSlice";
import Link from "next/link";
import Swal from "sweetalert2";
export default function GioHang() {
  const dispatch = useDispatch();
  const cart_arr: ICart[] = useSelector(
    (state: RootState) => state.cart.listSp
  );

  return (
    <div className="mx-auto w-[1000px] border-2 border-black p-4">
      <h2 className="text-[1.1em] bg-amber-300 p-2">Giỏ hàng của bạn</h2>

      {cart_arr.length === 0 ? (
        <p className="text-center p-4">Giỏ hàng của bạn đang trống.</p>
      ) : (
        <table className="w-full border-collapse border border-black mt-2">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 text-left w-[300px]">Tên sản phẩm</th>
              <th className="border border-black p-2 text-left w-[300px]">Hình ảnh</th>
              <th className="border border-black p-2 w-[150px]">Số lượng</th>
              <th className="border border-black p-2 text-left w-[200px]">Giá</th>
              <th className="border border-black p-2 text-right w-[200px]">Kích thước</th>
              <th className="border border-black p-2 text-right w-[200px]">Tổng tiền</th>
              <th className="border border-black p-2 text-center w-[150px]">Xóa</th>
            </tr>
          </thead>
          <tbody>
            {cart_arr.map((sp: ICart, index: number) => (
              <tr key={index} className="border border-black">
                <td className="border border-black p-2">{sp.ten_sp}</td>
                <td className="border border-black p-2"><img className="w-[60px] h-auto object-contain" src={`img/${sp.hinh}`} alt="" /></td>
                <td className="border border-black p-2 text-center">
                  <input
                    type="number"
                    min="1"
                    defaultValue={sp.so_luong}
                    className="w-[100%] text-center border border-gray-300 rounded"
                    onChange={(event) =>
                      dispatch(suaSL([sp.id, Number(event.target.value)]))
                    }
                  />
                </td>
                <td className="border border-black p-2 text-right">
                  {Number(sp.gia_mua).toLocaleString("vi")} ₫
                </td>
                <td className="border border-black p-2 text-right">{sp.size}</td>
                <td className="border border-black p-2 text-right">
                  {Number(sp.gia_mua * sp.so_luong).toLocaleString("vi")} ₫
                </td>
                <td className="border border-black p-2 text-center">
                  <button
                    className="bg-gray-400 w-8 h-8 text-center text-white rounded-3xl"
                    onClick={() =>
                      dispatch(
                        xoaSP(sp.id),
                        Swal.fire({
                          title: "🎉 Thành công!",
                          text: `Đã xóa "${sp.ten_sp}" ra giỏ hàng.`,
                          icon: "success",
                          showConfirmButton: false,
                          timer: 3000,
                        })
                      )
                    }
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="p-2">
        <Link href="/thanh-toan" className="text-[0.8em] px-4 py-2 bg-amber-300 rounded">
          Thanh toán
        </Link>
      </div>
    </div>

  );
}