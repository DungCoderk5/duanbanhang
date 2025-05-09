'use client';
import { div } from "motion/react-client"
import "../../style/blog.css";
import parse from 'html-react-parser';
import { useParams } from "next/navigation";
import truncate from 'html-truncate';
import { useState, useEffect, JSX } from "react";
import { IBlog } from "../../components/cautrucdata";
export default function BlogDetail() {
    const params = useParams();
    const id = params.id as string;
    const [blog, setBlog] = useState<IBlog | null>(null);
    const getTruncatedHTML = (html: string, limit: number = 120): JSX.Element => {
        // Truncate HTML giữ đúng cấu trúc, không gây lỗi
        const truncated = truncate(html, limit, { ellipsis: '...' });
        return <>{parse(truncated)}</>; // Không bọc trong <p> nếu đã có thẻ block bên trong
    };
    useEffect(() => {
        if (id) {
            fetch(`http://localhost:3000/api/blog/${id}`)
                .then(response => response.json())
                .then(data => setBlog(data.blog))
            fetch(`http://localhost:3000/api/blog/${id}/view`)
                .then(res => res.json())
                .then(data => console.log(data.message))
                .catch(err => console.error("Lỗi gọi API tăng view:", err));
        }
    }, [id]);
    return (
        <div>
            <section className="bread-crumb">
                <div className="container1">
                    <div className="rows">
                        <div className="col-xs-12">

                            <div className="breadcrumb-title"><b> Tin tức </b></div>

                            <ul className="breadcrumb">

                                <li className="home">
                                    <a href="/"><span>Trang chủ</span></a>
                                    <span> / </span>
                                </li>


                                <li><strong><span> Tin tức</span></strong></li>


                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            <div>
                <div className="container1">
                    <div className="rows">
                        <aside className="left left-content col-md-3 col-md-pull-9">

                            <aside className="blog-aside aside-item sidebar-category blog-category">
                                <div className="aside-title">
                                    <h2 className="title-head"><span>Danh mục tin</span></h2>
                                </div>
                                <div className="aside-content">
                                    <div className="nav-category  navbar-toggleable-md">
                                        <ul className="nav navbar-pills">


                                            <li className="nav-item">
                                                <i className="fa  fa-caret-right"></i>
                                                <a className="nav-link" href="/">Trang chủ</a></li>



                                            <li className="nav-item">
                                                <i className="fa  fa-caret-right"></i>
                                                <a className="nav-link" href="/gioi-thieu">Giới thiệu</a></li>



                                            <li className="nav-item">
                                                <i className="fa  fa-caret-right"></i>
                                                <a href="/collections/all" className="nav-link">Thực đơn</a>
                                                <i className="fa fa-angle-down"></i>
                                                <ul className="dropdown-menu">


                                                    <li className="dropdown-submenu nav-item">

                                                        <a className="nav-link" href="/">Bánh Piza</a>
                                                        <i className="fa fa-angle-down"></i>
                                                        <ul className="dropdown-menu">


                                                            <li className="nav-item">

                                                                <a className="nav-link" href="/">Pizza Hải Sản</a>
                                                            </li>



                                                            <li className="nav-item">

                                                                <a className="nav-link" href="/">Pizza Rau Củ</a>
                                                            </li>


                                                        </ul>
                                                    </li>



                                                    <li className="nav-item">

                                                        <a className="nav-link" href="/">Burger</a>
                                                    </li>



                                                    <li className="nav-item">

                                                        <a className="nav-link" href="/">Đồ uống</a>
                                                    </li>



                                                    <li className="nav-item">

                                                        <a className="nav-link" href="/">Trà sữa</a>
                                                    </li>



                                                    <li className="nav-item">

                                                        <a className="nav-link" href="/">Hoa quả</a>
                                                    </li>



                                                    <li className="nav-item">

                                                        <a className="nav-link" href="/">Salad</a>
                                                    </li>



                                                    <li className="nav-item">

                                                        <a className="nav-link" href="/">Xúc xích</a>
                                                    </li>



                                                    <li className="nav-item">

                                                        <a className="nav-link" href="/">Khoai tây</a>
                                                    </li>



                                                    <li className="nav-item">

                                                        <a className="nav-link" href="/">Piza</a>
                                                    </li>


                                                </ul>
                                            </li>



                                            <li className="nav-item">
                                                <i className="fa  fa-caret-right"></i>
                                                <a className="nav-link" href="/tin-tuc">Tin tức</a></li>



                                            <li className="nav-item">
                                                <i className="fa  fa-caret-right"></i>
                                                <a className="nav-link" href="/lien-he">Liên hệ</a></li>



                                            <li className="nav-item">
                                                <i className="fa  fa-caret-right"></i>
                                                <a className="nav-link" href="/gioi-thieu">Nhượng quyền</a></li>


                                        </ul>
                                    </div>
                                </div>
                            </aside>





                            <div className="blog-aside aside-item">
                                <div>
                                    <div className="aside-title">
                                        <h2 className="title-head"><a href="/tin-tuc">Tin nổi bật</a></h2>
                                    </div>
                                    <div className="aside-content">
                                        <div className="blog-list blog-image-list">

                                            <div className="loop-blog">
                                                <div className="thumb-left">
                                                    <a href="/tu-lam-kho-ga-la-chanh-ngon-tuyet-tai-nha">

                                                        <img src="//bizweb.dktcdn.net/thumb/small/100/310/257/articles/art1-5e2aebe2-43eb-41a1-98cd-b9cc381ae15d.png?v=1526564713617" style={{ width: "100%" }} alt="Tự làm khô gà lá chanh ngon tuyệt tại nhà" className="img-responsive" />

                                                    </a>

                                                </div>
                                                <div className="name-right">

                                                    <h3><a href="/tu-lam-kho-ga-la-chanh-ngon-tuyet-tai-nha">Tự làm khô gà lá chanh ngon tuyệt tại nhà</a></h3>
                                                    <div className="post-time">
                                                        <i className="fa-solid fa-clock"></i>16/05/2018
                                                    </div>

                                                </div>
                                            </div>



                                        </div>

                                    </div>
                                </div>
                            </div>


                        </aside>
                    </div>
                </div>
                <section className="right-content col-md-9 col-md-push-3">
                    <div className="box-heading relative hidden">
                        <h1 className="title-head page_title">Tin tức</h1><span> ( Có tất cả 4 bài viết ) </span>
                    </div>
                    <div className="col-lg-12">
                        {blog && (

                            <div className="article-details">
                                <div className="article-image">
                                    <a href=""><img src={`/blog/${blog.image}`} /></a>
                                </div>
                                <div className="post-time">
                                    <i className="fa fa-clock"></i>{new Date(blog.created_at).toLocaleDateString('vi')}

                                </div>
                                <div className="article-content">
                                    <div className="rte">
                                        {blog && parse(blog.content)}                                    </div>
                                </div>
                                <div className="rows row-noGutter tag-share">
                                    <div className="col-xs-12 col-sm-12 a-left">
                                        <div className="social-media" data-permalink="https://dualeo-food.mysapo.net/cach-chon-rau-cu-qua-tuoi-ngon-khong-ngam-doc">
                                            <label>Chia sẻ: </label>

                                            <a target="_blank" href="//www.facebook.com/sharer.php?u=https://dualeo-food.mysapo.net/cach-chon-rau-cu-qua-tuoi-ngon-khong-ngam-doc" className="share-facebook" title="Chia sẻ lên Facebook">
                                                <i className="fa fa-facebook"></i>
                                            </a>
                                            <a target="_blank" href="//twitter.com/share?text=cach-chon-rau-cu-qua-tuoi-ngon-khong-ngam-doc" className="share-twitter" title="Chia sẻ lên Twitter">
                                                <i className="fa fa-twitter"></i>
                                            </a>
                                            <a target="_blank" href="//pinterest.com/pin/create/button/?url=https://dualeo-food.mysapo.net/cach-chon-rau-cu-qua-tuoi-ngon-khong-ngam-doc" className="share-pinterest" title="Chia sẻ lên pinterest">
                                                <i className="fa fa-pinterest"></i>
                                            </a>
                                            <a target="_blank" href="//plus.google.com/share?url=https://dualeo-food.mysapo.net/cach-chon-rau-cu-qua-tuoi-ngon-khong-ngam-doc" className="share-google" title="+1">
                                                <i className="fa fa-google-plus"></i>
                                            </a>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                    </div>

                </section>
            </div>
        </div>
    )
}