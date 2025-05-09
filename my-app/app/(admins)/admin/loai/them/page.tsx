// import { form } from "motion/react-client";
import { div } from "motion/react-client";
import handleThemLoai from "./handleThemLoai";
export default function ThemLoai() {
    const loai = { name: "", parent_id: 0 || null }
    return (
        <div className="form-tt">
            <h2 className="!text-left">Thêm loại</h2>
            <form className="" action={handleThemLoai}>
                <div className="mb-4">
                    {/* <label htmlFor="name" className="block text-lg font-semibold text-[#081028]">Name</label> */}
                    <input
                        type="text"
                        name="name"
                        id="name"
                        className=""
                        required
                        placeholder="Nhập tên loại"
                    />
                </div>

                <div className="mb-4">
                    {/* <label htmlFor="parent_id" className="block text-lg font-semibold text-[#081028]">Parent ID (optional)</label> */}
                    <input
                        type="text"
                        name="parent_id"
                        id="parent_id"
                        className=""
                        placeholder="Nhập ID loại cha (không bắt buộc)"
                    />
                </div>

                <div className="m-3 flex justify-center">
                    <button
                        type="submit"
                        className="bg-[#081028] text-white px-6 py-3 rounded-lg shadow-lg hover:bg-[#0a1530] focus:outline-none focus:ring-2 focus:ring-[#081028] transition duration-300"
                    >
                        Thêm
                    </button>
                </div>
            </form>
        </div>

    );
}