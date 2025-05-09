'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { IUser } from "./cautrucdata";

interface DecodedToken {
  role: string;
  exp: number;
  [key: string]: any;
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<null | boolean>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/dang_nhap");
        return;
      }

      try {
        // ✅ Decode token để kiểm tra vai trò trước (nhanh)
        const decoded = jwtDecode<DecodedToken>(token);

        if (decoded.role !== "admin") {
          router.replace("/not-authorized");
          return;
        }

        setIsAuthorized(true); // ✅ Cho phép hiển thị ngay

        // ✅ Gọi API để xác minh lại phía server
        const res = await fetch("http://localhost:3000/api/check-auth", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || data.user.role !== "admin") {
          router.replace("/not-authorized");
        }

      } catch (err) {
        console.error("Lỗi xác thực:", err);
        router.replace("/dang_nhap");
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthorized === null) return null;

  return <>{children}</>;
}
