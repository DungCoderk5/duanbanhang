"use client";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { xoaGH } from "@/lib/cartSlice";
export default function HoanTat() {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(xoaGH());
    }, [dispatch]);
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-white p-8 rounded-2xl shadow-lg text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex justify-center mb-4"
                >
                    <CheckCircle className="text-green-500 w-16 h-16" />
                </motion.div>

                <motion.h1
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-2xl font-bold text-gray-800"
                >
                    Thanh toán thành công!
                </motion.h1>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="text-gray-600 mt-2"
                >
                    Cảm ơn bạn đã mua hàng! Chúng tôi sẽ liên hệ sớm nhất để giao hàng.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="mt-6"
                >
                    <Link href="/" passHref>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-600 transition"
                        >
                            Quay về trang chủ
                        </motion.button>
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
