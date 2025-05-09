import { ILoai,ISanPham } from "../../components/cautrucdata";
import Show1SP from "../../components/Show1SP";
import "../../style/sptrongloai.css";
export default async function SPTrongLoai({ params }: { params: { id: number } }) {
    //lấy tham số id trong router
    let category_id = params.id;
    //call api lấy sp trong loại
    let resSP = await fetch(`http://localhost:3000/api/sptrongloai/${category_id}`);
    let dataSP = await resSP.json();
    let sp_arr: ISanPham[] = dataSP as ISanPham[];
    //call api lấy loại
    let resLoai = await fetch(`http://localhost:3000/api/loai/${category_id}`);
    let kq_loai: any = await resLoai.json();
    let loai: ILoai = kq_loai as ILoai;
    return (
        <div>
            <section className="bread-crumb">
                <div className="container1">
                    <div className="rows">
                        <div className="col-xs-12">

                            <div className="breadcrumb-title"><b> Sản phẩm trong loại </b></div>

                            <ul className="breadcrumb">

                                <li className="home">
                                    <a href="/"><span>Trang chủ</span></a>
                                    <span> / </span>
                                </li>


                                <li><strong><span> Sản phẩm trong loại {loai.name}</span></strong></li>


                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            <div className="container mx-auto p-4">

                <div className="container1">

                    <div className="container mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
                            {sp_arr.length > 0 ? (
                                sp_arr.map((sp: ISanPham) => <Show1SP key={sp.product_id} sp={sp} />)
                            ) : (
                                <p className="text-gray-500">Không có sản phẩm nào.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}