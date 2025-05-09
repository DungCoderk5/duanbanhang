"use client"
import Link from "next/link";
import Image from "next/image";
import { ISanPham } from "./cautrucdata";
import { useDispatch, UseDispatch } from "react-redux";
import { themSP } from "@/lib/cartSlice";
import Swal from "sweetalert2";

export default function Show1SP(props: any) {
  let sp = props.sp as ISanPham;
  const dispatch = useDispatch();
  return (
    <div className="bg-white shadow-lg rounded-lg  flex flex-col items-center text-center product-card relative ">
      {sp.price > 0 && sp.discount_price > 0 && (
        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded z-[6]">
          -{(((sp.price - sp.discount_price) / sp.price) * 100).toFixed(0)}%
        </span>
      )}
      <div className="img-container">
        <Link href={`/sp/${sp.product_id}`} passHref>
          <div className="p-4 bg-white rounded-lg">
            <Image
              src={`/img/${sp.img}`}
              alt={sp.name}
              layout="intrinsic"
              width={500} // Giá trị bất kỳ, không ảnh hưởng vì layout sẽ tự động điều chỉnh
              height={500}
            />
          </div>
          {/* <img
            src=`./img/${}`
            alt={sp.name} className="rounded-md w-full"/> */}
        </Link>
        <div className="overlay relative">
          <button className="cursor-pointer" onClick={() => {
            dispatch(themSP(sp));
            Swal.fire({
              title: "🎉 Thành công!",
              text: `Đã thêm "${sp.name}" vào giỏ hàng.`,
              icon: "success",
              showConfirmButton: false,
              timer: 3000,
            });
          }}>
            🛒
          </button>
          <a href="#" title="Xem chi tiết">👁️</a>
        </div>
      </div>
      <h2 className="font-bold text-lg mt-2">{sp.name}</h2>

      <p className="text-gray-600 text-sm px-[10px]">{sp.description}</p>
      <p className="text-red-500 font-bold text-xl">{sp.discount_price.toLocaleString('vi')}đ
        <span className="text-gray-400 line-through text-sm ml-0.5">{sp.price.toLocaleString('vi')}đ
        </span>
      </p>
    </div>
  )
}