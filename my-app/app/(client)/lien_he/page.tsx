"use client"
import "../style/lien_he.css";

import { useState, useEffect, ChangeEvent,FormEvent } from "react"
export default function Lienhe() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [status, setStatus] = useState<{ success: boolean; error: string }>({ success: false, error: "" });

    // Hàm xử lý thay đổi input
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Hàm gửi form
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus({ success: false, error: "" });

        try {
            const response = await fetch("http://localhost:3000/api/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus({ success: true, error: "" });
                setFormData({ name: "", email: "", phone: "", message: "" });
            } else {
                throw new Error("Có lỗi xảy ra! Vui lòng thử lại.");
            }
        } catch (err) {
            setStatus({ success: false, error: (err as Error).message });
        }
    };

    // useEffect theo dõi trạng thái gửi email
    useEffect(() => {
        if (status.success) {
            alert("Gửi thành công! Chúng tôi sẽ liên hệ sớm.");
        } else if (status.error) {
            alert("Lỗi: " + status.error);
        }
    }, [status]);
    return (
        <div>
            <section className="bread-crumb">
                <div className="container1">
                    <div className="rows">
                        <div className="col-xs-12">

                            <div className="breadcrumb-title"><b> Liên hệ</b></div>

                            <ul className="breadcrumb">

                                <li className="home">
                                    <a href="/"><span>Trang chủ</span></a>
                                    <span> / </span>
                                </li>


                                <li><strong><span> Liên hệ</span></strong></li>


                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container1 mb-[30px] contact">
                <h2 className="title-head"><span> Gửi tin nhắn cho chúng tôi</span></h2>
                {status.success && <p className="text-green-500">Gửi thành công! Chúng tôi sẽ liên hệ sớm.</p>}
                {status.error && <p className="text-red-500">{status.error}</p>}
                <div className="rows">
                    <div className="col-sm-12">
                        <div className="rows">
                            <div className="col-md-6 text-[14px]" style={{ paddingLeft: "29px" }}>
                                <div className="contact_fr">
                                    <form onSubmit={handleSubmit} id="contact" acceptCharset="UTF-8">
                                        <input name="FormType" type="hidden" value="contact" />
                                        <input name="utf8" type="hidden" value="true" />
                                        <input type="hidden" id="Token-569583b56dae4588bccc3114ce800db0"
                                            name="Token"
                                            value="03AFcWeA79O7VM3mZcrsGr-9WeV5WFwJxY3dCgMvy6gO1AWGj_3m0-gYHydi2kXtCbu_G-eAMVJQKY83m85hTf1iBWA9TvfofuTwrY0evCqR1_iBaioLyi3EZ_yOB10PAsB7EHi7V5qmhzPPvfZFx7HdQeNOugE4lMVqzj1aNz2gCZMYA9R80GP9MnH-FVKtt4V-WCmiYctBKEmPmioXhkZlL-F_bzsFpmfRu3IE0ToZm_WSvQY1Z7bKYdLCRzw1WnQA4LN-9aDzx4YwAm1FQ4KaphlqAWPJGv9uBkIAf41QUBxRYj1NGZoAqYsaFiqGFFx7w2xmG0VUqXC-3cNwvav0vw9FXvnQPyOyo_NMSkpCgfxHnJxXmiLNtr_p9vQkI573BJCQawMFXf5lyxXUtcbVtiKdkuEoSSuWNqnqPUd8KjRhldM9z8lqB1NkLMSR9SzI_4OfrtDWorOgrlnYDKK3jh5aMbCkMhtaDP4JQ9nDyRKvOKgHwE2aLui6ugOz9ETAsMTeCslgF6zFDSOEBc7eJtTzGK5UO94er4YviVgjl3EecyLA0tBpPbcOBoxGupM4xZ-V8bYnaM0INl22eYZRWKN1cttth_xnPCVugoC9YjYanf9HCE4kYr0sRa7EsgFXzfcejmOUU2fONqzx9_Pw1UCfD3zb_N2TD8CvvNXsBtWQugMBiW0fSYr6AEnOwkXzDC-flSOHzZhYNyHzT2R2TIUGkU-bniMwgFrmYhk199ndAIgmxllnNUPDLfoSJibhOytBVoQwwmwWYsx2wQupiZUzGQIzGIvo2Y5dSpg5JuruEK8UvGt7VsjwHQmAnGA4Lan0ni_FO4z1arADd2pTHPYdBRZ0OmDMEbVs5C9GfLW-8SY_Aruu-4yJmEf3wU7ST4VUf8VzaTbXZv45BDilrgigL2xwitKHdSok_d3Ww3ZqKBaywWGFRwVjHZlhs2qqXUfa75ArVt" />
                                        <p id="errorFills" style={{ marginBottom: "10px", color: "red" }}></p>
                                        <div id="emtry_contact" className="form-signup form_contact clearfix">
                                            <div className=" row-8Gutter">
                                                <div className="col-md-12">
                                                    <fieldset className="form-group">
                                                        <input type="text" placeholder="Họ tên*" name="name" id="name"
                                                            className="form-control  form-control-lg"  value={formData.name} onChange={handleChange}
                                                        />
                                                    </fieldset>
                                                </div>
                                                <div className="col-md-12">
                                                    <fieldset className="form-group">
                                                        <input type="email" placeholder="Email*" name="email"
                                                            pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$"
                                                            data-validation="email" id="email"
                                                            className="form-control form-control-lg"  value={formData.email} onChange={handleChange}
                                                        />
                                                    </fieldset>
                                                </div>
                                                <div className="col-md-12">
                                                    <fieldset className="form-group">
                                                        <input type="number" placeholder="Điện thoại*" name="phone"
                                                            className="form-control form-control-lg"  value={formData.phone} onChange={handleChange} />
                                                    </fieldset>
                                                </div>
                                            </div>
                                            <fieldset className="form-group">
                                            <textarea name="message" placeholder="Nội dung*" value={formData.message} onChange={handleChange} required className="form-control" rows={6}></textarea>
                                            </fieldset>
                                            <div>

                                                <button type="submit" className="btn btn-primary btn-contact"
                                                >Gửi liên hệ</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="col-md-6 text-[14px]">

                                <div className="contact-box-info clearfix margin-bottom-30">
                                    <div>

                                        <div className="item">

                                            <div><i className="fa fa-map-marker"></i>
                                                <div className="info">
                                                    <label>Địa chỉ liên hệ</label>
                                                    Ladeco Building, 266 Doi Can Street, Hà Nội,
                                                </div>
                                            </div>

                                            <div>
                                                <i className="fa fa-phone"></i>
                                                <div className="info">
                                                    <label>Số điện thoại</label>
                                                    <a href="tel:19006750">1900 6750</a>
                                                    <p>Thứ 2 - Chủ nhật: 9:00 - 18:00</p>
                                                </div>
                                            </div>


                                            <div><i className="fa fa-envelope"></i>
                                                <div className="info">
                                                    <label>Email</label>
                                                    <a href="mailto:support@sapo.vn">support@sapo.vn

                                                    </a>
                                                </div>
                                            </div>

                                        </div>


                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="col-sm-12">
                        <div className="box-maps margin-bottom-30">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.3534212072755!2d106.75830007480499!3d10.784220189365048!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317525d7b907fc35%3A0x25ff0add4f0a87ce!2zNzYgxJDGsOG7nW5nIHPhu5EgNiwgUGjGsOG7nW5nIELDrG5oIFRyxrBuZyBUw6J5LCBUaOG7pyDEkOG7qWMsIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1742709846534!5m2!1svi!2s"
                                width="600" height="450" style={{ border: "0" }} loading="lazy"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )

}