// hooks/useAdmin.ts
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getUserRole } from "@/app/lib/userService"; // tạo cái này riêng để fetch role từ DB

export default function useAdmin() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await getUserRole(user.uid); // gọi Firestore hoặc API để lấy role
        setIsAdmin(role === "admin");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { loading, isAdmin };
}
