"use client";
import Image from "next/image";
import { ISanPham } from "./components/cautrucdata";
import Show1SP from "./components/Show1SP";
import Banner from "./components/Banner";
import { clear } from "node:console";
import VoucherDisplay from "./components/voucher";
import { VoucherDisplayProps } from "./components/cautrucdata";
import { useState, useEffect } from "react";
import Link from "next/link";
export default  function Home() {
  const [sp_hot, setSpHot] = useState<ISanPham[]>([]);
  const [sp_moi, setSpMoi] = useState<ISanPham[]>([]);
  const [vouchers, setVouchers] = useState<VoucherDisplayProps[]>([]);

  useEffect(() => {
    // Fetch sản phẩm hot
    fetch("http://localhost:3000/api/sphot/8")
      .then(res => res.json())
      .then(data => setSpHot(data));

    // Fetch sản phẩm mới
    fetch("http://localhost:3000/api/spmoi/8")
      .then(res => res.json())
      .then(data => setSpMoi(data));

    // Fetch vouchers
    fetch('http://localhost:3000/api/voucher/list')
      .then(res => res.json())
      .then(data => {
        if (data.success) setVouchers(data.vouchers);
      });
  }, []);

  return (
    <div style={{position:"relative"}}>
      {vouchers.map((v, index) => (
        <VoucherDisplay
          key={v.code}
          code={v.code}
          discountValue={v.discountValue}
          description={v.description}
          index={index}
        />
      ))}
      <section className="awe-section1 mb-[30px]">
        <img className="lazyload loading" alt="alt slider demo"
          src="//bizweb.dktcdn.net/100/310/257/themes/801944/assets/slider_1.jpg?1676001091788" data-ll-status="loading" />
      </section>
      <Banner />
      <div className="container mx-auto p-4">
        {/* Sản phẩm nổi bật */}
        <div className="container1">
          <h2 className="non my-3 text-xl font-bold uppercase text-gray-700 p-[30px] text-center relative" style={{ clear: "both" }}>
            Sản phẩm nổi bật
          </h2>
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
              {sp_hot.length > 0 ? (
                sp_hot.map((sp: ISanPham) => <Show1SP key={sp.product_id} sp={sp} />)
              ) : (
                <p className="text-gray-500">Không có sản phẩm nào.</p>
              )}

            </div>
            <button

              className="mt-6 block mx-auto bg-blue-500 text-white px-6 py-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-blue-600 hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-blue-300 active:scale-95"
            >
              <Link href="/sp">   Xem thêm </Link>

            </button>
          </div>
        </div>

        {/* Sản phẩm mới */}
        <div className="container1">
          <h2 className="non my-3 text-xl font-bold uppercase text-gray-700 p-[30px] text-center relative" style={{ clear: "both" }}>
            Sản phẩm mới
          </h2>
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
              {sp_moi.length > 0 ? (
                sp_moi.map((sp: ISanPham) => <Show1SP key={sp.product_id} sp={sp} />)
              ) : (
                <p className="text-gray-500">Không có sản phẩm nào.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
