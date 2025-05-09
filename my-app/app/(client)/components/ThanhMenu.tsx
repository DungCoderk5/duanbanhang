"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ILoai } from "./cautrucdata";

export default function ThanhMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [dataLoai, setDataLoai] = useState<ILoai[]>([]);

  useEffect(() => {
    const fetchLoaiSanPham = async () => {
      try {
        const resLoai = await fetch("http://localhost:3000/api/loai");
        const data = await resLoai.json();
        setDataLoai(data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };
    fetchLoaiSanPham();
  }, []);

  return (
    <>
      <div className="col-md-5 hidden-sm hidden-xs">
        <nav className="text-left">
          <ul className="nav">
            <li className="nav-item active">
              <Link className="nav-link" href="/">
                Trang chủ
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/gioi-thieu">
                Giới thiệu
              </Link>
            </li>
            <li className="nav-item">
            
                <Link className="nav-link" href="/sp">

                  Thực đơn <i className="fa fa-angle-down"></i>
                </Link>


              
                <ul className="dropdown-menu">
                  {dataLoai
                    .filter((loai) => loai.parent_id === null)
                    .map((loaiCha) => {
                      const hasChildren = dataLoai.some((loai) => loai.parent_id === loaiCha.category_id);
                      return (
                        <li key={loaiCha.category_id} className={`nav-item-lv2 ${hasChildren ? "dropdown-submenu" : ""}`}>
                          <Link className="nav-link" href={`/sptrongloai/${loaiCha.category_id}`}>
                            {loaiCha.name}  {hasChildren && <i className="fa fa-angle-right"></i>}
                          </Link>

                          {hasChildren && (
                            <ul className="dropdown-menu" >
                              {dataLoai
                                .filter((loai) => loai.parent_id === loaiCha.category_id) // Chỉ lấy danh mục con
                                .map((loaiCon) => (
                                  <li key={loaiCon.category_id} className="nav-item-lv3" >
                                    <Link className="nav-link" href={`/sptrongloai/${loaiCon.category_id}`}>
                                      {loaiCon.name}
                                    </Link>
                                  </li>
                                ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                </ul>
             

            </li>


          </ul>
        </nav>
      </div>

      <div className="col-md-2">
        <div className="text-center">
          <div className="logo inline-block">
            <Link href="/" className="logo-wrapper">
              <img src="//bizweb.dktcdn.net/100/310/257/themes/801944/assets/logo.png?1676001091788" alt="logo" />
            </Link>
          </div>
        </div>
      </div>

      <div className="col-md-5 hidden-sm hidden-xs">
        <nav className="nav-right">
          <ul className="nav">
            <li className="nav-item">
              <Link className="nav-link" href="/blog">
                Tin tức
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/lien_he">
                Liên hệ
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/gioi-thieu">
                Nhượng quyền
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
