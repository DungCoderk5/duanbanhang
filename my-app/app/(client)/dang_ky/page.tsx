"use client"
import { motion } from "framer-motion";
import { useState } from "react";
import "../style/login.css";
export default function DangKy() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [phone,setPhone]= useState("");
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false); // Kiểm tra có đang nhập OTP không

    // ✅ Gửi request đăng ký
    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name,phone }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage("Mã OTP đã được gửi, vui lòng kiểm tra email.");
                setIsOtpSent(true); // Chuyển sang bước nhập OTP
            } else {
                setMessage(data.error || "Đăng ký thất bại!");
            }
        } catch (error) {
            console.error("Lỗi:", error);
            setMessage("Lỗi máy chủ!");
        }
    };

    // ✅ Gửi request xác nhận OTP
    const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:3000/api/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage("Tài khoản đã xác thực thành công!");
                window.location.href = "/dang_nhap"; // Chuyển sang trang đăng nhập
            } else {
                setMessage(data.error || "Xác thực OTP thất bại!");
            }
        } catch (error) {
            console.error("Lỗi:", error);
            setMessage("Lỗi máy chủ!");
        }
    };
    return (
        <div>

            <section className="bread-crumb">
                <div className="container1">
                    <div className="rows">
                        <div className="col-xs-12">

                            <div className="breadcrumb-title"><b> Đăng nhập</b></div>

                            <ul className="breadcrumb">

                                <li className="home">
                                    <a href="/"><span>Trang chủ</span></a>
                                    <span> / </span>
                                </li>


                                <li><strong><span> Đăng nhập</span></strong></li>


                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            <div className="container1">
                <h1 className="title-head"><span>Đăng ký tài khoản</span></h1>
                {message && <p className="text-red-500">{message}</p>}

                <div className="rows">
                    <div className="col-lg-6 text-[14px]">
                        <div className="page-login margin-bottom-30">
                            <div id="login" className="px-4">
                                <div className="social-login  text-left margin-bottom-20 margin-top-10">
                                    <a href="javascript:void(0)" className="social-login--facebook mr-[5px]" style={{ display: "inline-block" }}>
                                        <img
                                            width="129px" height="37px" alt="facebook-login-button"
                                            src="//bizweb.dktcdn.net/assets/admin/images/login/fb-btn.svg" /></a>
                                    <a href="javascript:void(0)" className="social-login--google mr-[5px]" style={{ display: "inline-block" }} >
                                        <img
                                            width="129px" height="37px" alt="google-login-button"
                                            src="//bizweb.dktcdn.net/assets/admin/images/login/gp-btn.svg" /></a>
                                </div>
                                <span>
                                    Nếu bạn đã có tài khoản, đăng nhập tại đây.
                                </span>
                                {message && <p className="text-red-500">{message}</p>}

                                {/* ✅ Nếu chưa gửi OTP, hiển thị form đăng ký */}
                                {!isOtpSent ? (
                                    <form id="customer_login" onSubmit={handleSignup}>
                                        <div className="form-signup clearfix">
                                            <fieldset className="!border-none !p-0">
                                                <label>Họ và tên:</label>
                                                <input className="form-control form-control-lg" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                                            </fieldset>
                                            <fieldset className="!border-none !p-0">
                                                <label>Email:</label>
                                                <input className="form-control form-control-lg" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                            </fieldset>
                                            <fieldset className="!border-none !p-0">
                                                <label>Điện thoại:</label>
                                                <input className="form-control form-control-lg" type="number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                            </fieldset>
                                            <fieldset className="!border-none !p-0">
                                                <label>Mật khẩu:</label>
                                                <input className="form-control form-control-lg" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                            </fieldset>
                                            <fieldset className="!border-none !p-0">
                                                <label>Xác nhận mật khẩu:</label>
                                                <input className="form-control form-control-lg" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                            </fieldset>
                                            <div className="pull-xs-left" style={{ marginTop: "25px" }}>
                                                <button className="btn btn-primary" type="submit">Đăng ký</button>
                                                {/* <input className="btn btn-primary" type="submit" value="Đăng nhập" /> */}
                                                <a href="/dang_nhap" className="btn-link-style btn-register"
                                                    style={{ marginLeft: " 20px", textDecoration: " underline " }}>Đăng nhập</a>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    /* ✅ Nếu đã gửi OTP, hiển thị form nhập OTP */
                                    <form onSubmit={handleVerifyOtp}>
                                        <fieldset>
                                            <label>Nhập OTP:</label>
                                            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                                        </fieldset>
                                        <button type="submit">Xác nhận OTP</button>
                                    </form>
                                )}
                            </div>


                        </div>
                    </div>
                    <div className="col-lg-6 text-[14px]">
                        <div id="recover-password" className="form-signup margin-bottom-20">
                            <span>
                                Bạn quên mật khẩu? Nhập địa chỉ email để lấy lại mật khẩu qua email.
                            </span>
                            <form id="recover_customer_password" acceptCharset="UTF-8">
                                <input name="FormType" type="hidden" value="recover_customer_password" /><input name="utf8"
                                    type="hidden" value="true" />


                                <div className="form-signup clearfix">
                                    <fieldset className="form-group">
                                        <label>Email: </label>
                                        <input type="email" className="form-control form-control-lg" name="Email"
                                            id="recover-email" placeholder="Email" />
                                    </fieldset>
                                </div>
                                <div className="action_bottom">
                                    <input className="btn btn-primary" style={{ marginTop: "25px" }} type="submit" value="Lấy lại mật khẩu"
                                    />

                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
