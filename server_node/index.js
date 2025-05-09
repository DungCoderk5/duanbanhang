const express = require("express")
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const moment = require("moment");
const nodemailer = require('nodemailer');
const fs = require("fs");
const crypto = require('crypto');
require("dotenv").config();
var app = express(); //tạo ứng dụng nodejs
const port = 3000;
const multer = require("multer");
const path = require("path");
const uploadPath = path.join(__dirname, "../my-app/public/img");

// Tạo thư mục nếu chưa có
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    },
});
const upload = multer({ storage });

// const storage1 = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, '../my-app/public/avatar'); // kiểm tra kỹ đường dẫn này có tồn tại và đúng chưa
//     },
//     filename: (req, file, cb) => {
//       const ext = path.extname(file.originalname);
//       const filename = `avatar_${Date.now()}${ext}`;
//       cb(null, filename);
//     },
//   });

const storage1 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/avatar'); // kiểm tra kỹ đường dẫn này có tồn tại và đúng chưa
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `avatar_${Date.now()}${ext}`;
        cb(null, filename);
    },
});

const upload1 = multer({ storage: storage1 });


app.use("/img", express.static("public/img"));
app.use("/avatar", express.static("public/avatar"));
app.use(express.json());  //cho phép đọc dữ liệu dạng json
const cors = require("cors")
app.use(cors({
    origin: "http://localhost:3001", // React chạy trên cổng này
    credentials: true, // Cho phép gửi cookie
})); //cho phép mọi nguồi bên ngoài request đến ứnd dụng
app.use(cookieParser()); // Kích hoạt middleware xử lý cookie

const { ProductModel, categoryModel, UserModel, FoodDetailrModel, ThumbnailModel, CartItemModel, CartModel, AddressModel, ReviewModel, BlogModel, sequelize, VouchersModel } = require("./database"); //các model lấy database
//routes
const { Sequelize, OP, Op } = require("sequelize");
app.listen(port, () => {
    console.log(`Ung dung dang chay o port ${port}`);
})
    .on('error', function (err) {
        console.log(`Loi xay ra khi chay ung dung ${err}`)
    });
app.get("/api/loai", async (req, res) => {
    const loai_arr = await categoryModel.findAll();
    res.json(loai_arr);
})
app.post('/api/change-avatar/:userId', upload1.single('avatar'), async (req, res) => {
    try {
        const user_id = Number(req.params.userId);
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Không có file được tải lên' });
        }

        const avatarFileName = file.filename;

        const [updated] = await UserModel.update(
            { avatar: avatarFileName },
            { where: { user_id } }
        );

        if (updated) {
            const updatedUser = await UserModel.scope(null).findOne({ where: { user_id } });

            res.json({
                message: 'Cập nhật avatar thành công',
                avatar: updatedUser.avatar,
                avatarUrl: `http://localhost:3001/avatar/${updatedUser.avatar}`
            });
        } else {
            res.status(404).json({ message: 'Không tìm thấy user', userId: user_id });
        }
    } catch (error) {
        console.error('Lỗi khi đổi avatar:', error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
});
//cập nhập thông tin tài khoản theo user_id
app.put('/api/user/:userId', async (req, res) => {
    try {
        const user_id = Number(req.params.userId);
        const { name, email, phone } = req.body;

        // Kiểm tra xem số điện thoại có tồn tại trong hệ thống không
        if (phone) {
            const existingUser = await UserModel.findOne({ where: { phone } });
            // Nếu số điện thoại chưa tồn tại, thêm mới
            if (!existingUser) {
                // Bạn có thể thêm số điện thoại vào cơ sở dữ liệu nếu cần
                await UserModel.create({ phone });
            }
        }

        // Cập nhật thông tin người dùng
        const [updated] = await UserModel.update(
            { name, email, phone },
            { where: { user_id } }
        );

        if (updated) {
            const updatedUser = await UserModel.findOne({ where: { user_id } });
            res.json({
                message: 'Cập nhật thông tin người dùng thành công',
                user: updatedUser
            });
        } else {
            res.status(404).json({ message: 'Không tìm thấy người dùng', user_id });
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật người dùng:', error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
});

app.get("/api/loai/:id", async (req, res) => {
    const loai = await categoryModel.findByPk(req.params.id)
    res.json(loai);
})
app.post("/api/admin/themloai", async (req, res) => {
    const { name, parent_id } = req.body;

    // Kiểm tra nếu không có parent_id thì gán giá trị null cho nó
    const newCategory = await categoryModel.create({
        name,
        parent_id: parent_id || null, // Nếu không có parent_id thì gán là null
    });

    res.json(newCategory); // Trả về thông tin loại mới đã tạo
});
//xóa loại
app.delete("/api/admin/xoaloai/:id", async (req, res) => {
    const id = req.params.id;
    const loai = await categoryModel.findByPk(id);
    if (loai) {
        await loai.destroy();
        res.json({ message: "Xóa loại thành công" });
    } else {
        res.json({ message: "Loại không tồn tại" });
    }
})
//xóa nhiều loại
app.delete("/api/admin/xoanhieuloai", async (req, res) => {
    const ids = req.body.ids;

    if (!ids || ids.length === 0) {
        return res.status(400).json({ message: "Danh sách ID không hợp lệ" });
    }

    try {
        const loai = await categoryModel.destroy({
            where: { category_id: { [Op.in]: ids } }
        });

        if (loai > 0) {
            res.json({ message: "Xóa loại thành công" });
        } else {
            res.status(404).json({ message: "Không tìm thấy loại nào để xóa" });
        }
    } catch (error) {
        res.status(500).json({ message: "Có lỗi xảy ra khi xóa loại", error: error.message });
    }
});
//sửa loại
app.put("/api/admin/sualoai/:id", async (req, res) => {
    const id = req.params.id;
    const { name, parent_id } = req.body;
    const loai = await categoryModel.findByPk(id);
    if (loai) {
        loai.name = name;
        loai.parent_id = parent_id || null; // Nếu không có parent_id thì gán
        await loai.save();
        res.json(loai);
    } else {
        res.json({ message: "Loại không tồn tại" });
    }
});
app.get("/api/nguoidung/", async (req, res) => {
    // Lấy tham số page và limit từ query params
    let page = parseInt(req.query.page) || 1; // Nếu không có page, mặc định là trang 1
    let limit = parseInt(req.query.limit) || 10; // Nếu không có limit, mặc định là 10

    // Kiểm tra nếu page hoặc limit không hợp lệ
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    // Tính toán offset
    const offset = (page - 1) * limit;

    try {
        // Lấy danh sách người dùng với phân trang
        const { count, rows } = await UserModel.findAndCountAll({
            include: [
                {
                    model: AddressModel,
                    where: {
                        is_default: 1
                    },
                    required: false,
                    attributes: ["address"]
                }
            ],
            limit: limit,
            offset: offset,
        });

        // Tính tổng số trang
        const totalPages = Math.ceil(count / limit);

        // Trả về dữ liệu phân trang
        res.json({
            data: rows,
            totalItems: count,
            currentPage: page,
            pageSize: limit,
            totalPages: totalPages
        });
    } catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu." });
    }
});

//khóa trạng thái người dùng
app.put("/api/user/update-status/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Lấy giá trị trạng thái mới từ body

        // Tìm người dùng theo ID
        const user = await UserModel.findOne({ where: { user_id: id } });

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        // Cập nhật trạng thái của người dùng
        user.status = status;
        await user.save();

        res.json({ message: status ? "Tài khoản đã bị khóa" : "Tài khoản đã được mở khóa" });
    } catch (error) {
        console.error("Lỗi server:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});
app.put("/api/user/update-role/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const validRoles = ['customer', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Vai trò không hợp lệ" });
        }

        const user = await UserModel.findOne({ where: { user_id: id } });

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        user.role = role;
        await user.save();

        const message = role === 'admin'
            ? "Tài khoản đã được cấp quyền quản trị"
            : "Tài khoản đã được đặt lại là khách hàng";

        res.json({ message });
    } catch (error) {
        console.error("Lỗi server:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

//lấy tất cả sản phẩm có phân trang
app.get("/api/sanpham", async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let search = req.query.search || "";

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const offset = (page - 1) * limit;

    // 👉 Tạo điều kiện tìm kiếm
    const whereCondition = search
        ? {
            name: {
                [Op.like]: `%${search}%`,
            },
        }
        : {};

    try {
        const { count, rows } = await ProductModel.findAndCountAll({
            where: whereCondition, // áp dụng điều kiện search
            limit: limit,
            offset: offset,
            include: [
                {
                    model: categoryModel,
                    as: "category",
                    attributes: ["name"],
                    required: false
                }
            ]
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            data: rows,
            totalItems: count,
            currentPage: page,
            pageSize: limit,
            totalPages: totalPages
        });

    } catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu." });
    }
});
app.get("/api/admin/sanpham/:id", async (req, res) => {
    const loai = await ProductModel.findByPk(req.params.id)
    res.json(loai);
})
//thêm sản phẩm
app.post("/api/admin/themsanpham", async (req, res) => {
    try {
        const { name, img, price, discount_price, description, category_id, stock, hot } = req.body;

        // Kiểm tra và xác nhận giá trị của trường `hot`
        const isHot = hot === 'on' || hot === true; // Kiểm tra nếu `hot` là 'on' (checkbox checked) hoặc true

        const product = await ProductModel.create({
            name: name,
            img: img,
            price: price,
            discount_price: discount_price,
            description: description,
            category_id: category_id,
            stock: stock,
            hot: isHot // Sử dụng giá trị đã xác nhận của `hot`
        });

        res.json(product);
    } catch (err) {
        console.error("Lỗi thêm sản phẩm:", err);
        res.status(500).json({ error: "Lỗi thêm sản phẩm." });
    }
});

app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Không có file" });

    // Trả lại đường dẫn public từ Next.js
    const fileUrl = `${req.file.filename}`;
    res.json({ url: fileUrl });
});
app.put("/api/admin/suasanpham/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { name, img, price, discount_price, description, category_id, stock, hot } = req.body;

        // Kiểm tra và cập nhật thông tin sản phẩm
        const updatedProduct = await ProductModel.findByPk(id);

        // Nếu sản phẩm không tồn tại, trả về lỗi 404
        if (!updatedProduct) {
            return res.status(404).json({ error: "Sản phẩm không tồn tại" });
        }

        // Cập nhật thông tin sản phẩm
        updatedProduct.name = name;
        updatedProduct.img = img;
        updatedProduct.price = price;
        updatedProduct.discount_price = discount_price;
        updatedProduct.description = description;
        updatedProduct.category_id = category_id;
        updatedProduct.stock = stock;

        // Chuyển đổi giá trị boolean của hot thành 1 hoặc 0
        updatedProduct.hot = hot ? 1 : 0;

        // Lưu sản phẩm sau khi cập nhật
        await updatedProduct.save();

        // Trả về sản phẩm đã cập nhật
        res.json(updatedProduct);
    } catch (err) {
        console.error("Lỗi sửa sản phẩm:", err);
        res.status(500).json({ error: "Lỗi sửa sản phẩm." });
    }
});
//xóa sản phẩm
app.delete("/api/admin/xoasanpham/:id", async (req, res) => {
    const id = req.params.id;
    const loai = await ProductModel.findByPk(id);
    if (loai) {
        await loai.destroy();
        res.json({ message: "Xóa sản phẩm thành công" });
    } else {
        res.json({ message: "Sản phẩm không tồn tại" });
    }
})
//xóa nhiều sản phẩm
app.delete("/api/admin/xoanhieusanpham", async (req, res) => {
    const ids = req.body.ids;

    if (!ids || ids.length === 0) {
        return res.status(400).json({ message: "Danh sách ID không hợp lệ" });
    }

    try {
        const loai = await ProductModel.destroy({
            where: { product_id: { [Op.in]: ids } }
        });

        if (loai > 0) {
            res.json({ message: "Xóa sản phẩm thành công" });
        } else {
            res.status(404).json({ message: "Không tìm thấy sản phẩm nào để xóa" });
        }
    } catch (error) {
        res.status(500).json({ message: "Có lỗi xảy ra khi xóa sản phẩm", error: error.message });
    }
});
app.post('/api/admin/donhang/updateStatusWay', async (req, res) => {
    try {
        const { cart_id, status_way } = req.body;

        // Kiểm tra xem các tham số có hợp lệ không
        if (cart_id == null || status_way == null) {
            return res.status(400).json({ thong_bao: "Thiếu thông tin cần thiết: cart_id, status_way" });
        }

        // Kiểm tra xem trạng thái vận chuyển có hợp lệ không
        if (![0, 1, 2].includes(status_way)) {
            return res.status(400).json({ thong_bao: "Trạng thái vận chuyển không hợp lệ" });
        }

        // Cập nhật status_way trong bảng CartItem
        const updatedItem = await CartItemModel.update(
            {
                status_way: status_way
            },
            {
                where: {
                    cart_id: cart_id
                }
            }
        );

        // Kiểm tra xem có cập nhật được dữ liệu không
        if (updatedItem[0] === 0) {
            return res.status(404).json({ thong_bao: "Không tìm thấy đơn hàng với cart_id " + cart_id });
        }

        res.json({ thong_bao: "Cập nhật trạng thái vận chuyển thành công", cart_id, status_way });

    } catch (err) {
        console.error("Lỗi khi cập nhật trạng thái vận chuyển:", err);
        res.status(500).json({ thong_bao: "Lỗi cập nhật trạng thái vận chuyển", err });
    }
});
app.post('/api/admin/donhang/updateStatusPayment', async (req, res) => {
    try {
        const { cart_id, status } = req.body;

        // Kiểm tra tham số đầu vào
        if (cart_id == null || status == null) {
            return res.status(400).json({ thong_bao: "Thiếu thông tin cần thiết: cart_id, status" });
        }

        // Chỉ chấp nhận trạng thái 0 hoặc 1
        // if (![0, 1].includes(status)) {
        //     return res.status(400).json({ thong_bao: "Trạng thái thanh toán không hợp lệ" });
        // }

        // Tìm tất cả các item theo cart_id
        const items = await CartItemModel.findAll({ where: { cart_id } });

        if (items.length === 0) {
            return res.status(404).json({ thong_bao: "Không tìm thấy đơn hàng với cart_id " + cart_id });
        }

        // Kiểm tra nếu tất cả các item đã có status đúng rồi => không cập nhật
        const allSame = items.every(item => item.status === Boolean(status));

        if (allSame) {
            return res.status(200).json({
                thong_bao: "Trạng thái thanh toán đã đúng, không cần cập nhật lại",
                cart_id,
                status
            });
        }

        // Thực hiện cập nhật
        const updated = await CartItemModel.update(
            { status: Boolean(status) },
            { where: { cart_id } }
        );

        res.status(200).json({
            thong_bao: "Cập nhật trạng thái thanh toán thành công",
            cart_id,
            status,
            updatedItem: updated
        });

    } catch (err) {
        console.error("Lỗi khi cập nhật trạng thái thanh toán:", err);
        res.status(500).json({
            thong_bao: "Lỗi cập nhật trạng thái thanh toán",
            err
        });
    }
});
//huy don hang
app.post('/api/huy-don-hang', async (req, res) => {
    try {
        const { cart_id } = req.body;

        if (!cart_id) {
            return res.status(400).json({ thong_bao: "Thiếu thông tin" });
        }

        // Cập nhật trạng thái đơn hàng thành 3 (đã huỷ)
        const [updatedRows] = await CartItemModel.update(
            { status: 3 },             // giá trị cập nhật
            { where: { cart_id: cart_id } } // điều kiện
        );

        if (updatedRows === 0) {
            return res.status(404).json({ thong_bao: "Không tìm thấy đơn hàng" });
        }

        res.json({ thong_bao: "Đã huỷ đơn hàng thành công" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ thong_bao: "Lỗi server khi huỷ đơn hàng" });
    }
});






app.get("/api/sphot/:sosp?", async (req, res) => {
    const sosp = Number(req.params.sosp) || 12
    const sp_arr = await ProductModel.findAll({
        where: { hot: 1 },

        offset: 0, limit: sosp,
    })
    res.json(sp_arr);
})
app.get("/api/spmoi/:sosp?", async (req, res) => {
    const sosp = Number(req.params.sosp) || 6
    const sp_arr = await ProductModel.findAll({

        offset: 0, limit: sosp,
    })
    res.json(sp_arr);
})

app.get("/api/sp/:id", async (req, res) => {
    const id = Number(req.params.id)
    const sp = await ProductModel.findOne({
        where: { product_id: id },
        include: [
            {
                model: FoodDetailrModel,
                as: "food_detail",
            },
            {
                model: ThumbnailModel,
                as: "thumbnail",
            }
        ],
    })
    res.json(sp);
})
app.get("/api/sptrongloai/:id", async (req, res) => {
    const category_id = Number(req.params.id)
    const sp_arr = await ProductModel.findAll({
        where: { category_id: category_id },
        order: [['price', 'ASC']],
    })
    res.json(sp_arr);
})
app.get("/api/timkiem/:tu_khoa/:page?", async (req, res) => {
    let tu_khoa = req.params.tu_khoa;
    const page = Number(req.params.page) || 1;
    const pageSize = 4;
    const offset = (page - 1) * pageSize;

    try {
        // 1️⃣ Đếm tổng số sản phẩm tìm được
        const total = await ProductModel.count({
            where: {
                name: { [Op.substring]: `%${tu_khoa}%` },

            }
        });

        // 2️⃣ Lấy danh sách sản phẩm theo trang
        const sp_arr = await ProductModel.findAll({
            where: {
                name: { [Op.substring]: `%${tu_khoa}%` },

            },
            order: [['created_at', 'DESC'], ['price', 'ASC']],
            limit: pageSize,
            offset: offset
        });

        // 3️⃣ Trả về dữ liệu đúng chuẩn
        res.json({ total, data: sp_arr });

    } catch (error) {
        console.error("Lỗi khi truy vấn dữ liệu:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
});
app.get("/api/phantrang", async (req, res) => {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const sortBy = req.query.sortby || "default"; // ✅ Lấy giá trị sắp xếp
    const offset = (page - 1) * pageSize;

    const sortOptions = {
        "alpha-asc": [["name", "ASC"]],
        "alpha-desc": [["name", "DESC"]],
        "price-asc": [["price", "ASC"]],
        "price-desc": [["price", "DESC"]],
        "created-desc": [["created_at", "DESC"]],
        "created-asc": [["created_at", "ASC"]],
    };

    try {
        const total = await ProductModel.count();
        const sp_arr = await ProductModel.findAll({
            order: sortOptions[sortBy] || [["created_at", "DESC"]],
            limit: pageSize,
            offset: offset,
        });

        res.json({ total, data: sp_arr || [] }); // ✅ Luôn trả về một mảng
    } catch (error) {
        console.error("Lỗi khi truy vấn dữ liệu:", error);
        res.status(500).json({ error: "Lỗi server", data: [] }); // ✅ Trả về mảng rỗng khi lỗi
    }
});
// app.get("/api/phantrang", async (req, res) => {
//     const pageSize = Number(req.query.limit) || 10; // ✅ Mặc định 10 sản phẩm/trang
//     const page = Number(req.query.page) || 1;
//     const offset = (page - 1) * pageSize;

//     try {
//         const total = await ProductModel.count({
//             // where: { an_hien: 1 }
//         });

//         const sp_arr = await ProductModel.findAll({
//             // where: { an_hien: 1 },
//             order: [['created_at', 'DESC'], ['price', 'ASC']],
//             limit: pageSize,
//             offset: offset,
//             distinct: true // ✅ Tránh dữ liệu trùng lặp
//         });

//         res.json({ total, data: sp_arr });

//     } catch (error) {
//         console.error("Lỗi khi truy vấn dữ liệu:", error);
//         res.status(500).json({ error: "Lỗi server" });
//     }
// });





// Secret key cho JWT
const SECRET_KEY = process.env.JWT_SECRET || "mysecretkey";
// app.post("/api/login1", async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Tìm user theo email
//         const user = await UserModel.findOne({ where: { email } });

//         if (!user) {
//             return res.status(401).json({ error: "Tài khoản không tồn tại" });
//         }

//         // Kiểm tra mật khẩu trực tiếp
//         if (password !== user.password) {
//             return res.status(401).json({ error: "Mật khẩu không chính xác" });
//         }

//         // Phản hồi thành công
//         return res.json({ message: "Đăng nhập thành công", user });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: "Lỗi máy chủ" });
//     }
// });

// API đăng nhập
// app.post("/api/login", async (req, res) => {
//     try {
//         console.log("Dữ liệu nhận được:", req.body);

//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({ message: "Thiếu email hoặc mật khẩu!", log: req.body });
//         }

//         // Tìm user
//         const user = await UserModel.findOne({ where: { email } });

//         if (!user) {
//             return res.status(401).json({ message: "Email không tồn tại!" });
//         }

//         // Kiểm tra mật khẩu
//         if (String(user.password) !== String(password)) {
//             return res.status(401).json({ message: "Mật khẩu không đúng!" });
//         }

//         // Tạo token JWT
//         const token = jwt.sign({ user_id: user.user_id,name:user.name, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

//         // Lưu token vào cookie
//         res.cookie("token", token, {
//             httpOnly: true,
//             secure: false,
//             sameSite: "Strict",
//             maxAge: 3600000
//         });

//         res.json({ message: "Đăng nhập thành công!", token });
//     } catch (error) {
//         console.error("Lỗi server:", error);
//         res.status(500).json({ message: "Lỗi server!", error: error.message });
//     }
// });
app.post("/api/login", async (req, res) => {
    try {
        console.log("Dữ liệu nhận được:", req.body);

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Thiếu email hoặc mật khẩu!" });
        }

        // Tìm user theo email và status
        const user = await UserModel.findOne({
            where: { email },
            include: [
                {
                    model: AddressModel,
                    as: "addresses",
                    attributes: ["address_id", "address"]
                }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: "Email không tồn tại!" });
        }

        // Kiểm tra nếu user đã bị khóa (status = true)
        if (user.status === true) {
            return res.status(403).json({ message: "Tài khoản đã bị khóa!" });
        }
        const defaultAddress = await AddressModel.findOne({
            where: {
                is_default: true,
                user_id: user.user_id // Thêm điều kiện lọc theo user_id
            }
        });

        // Cấu trúc address đưa vào token
        const addressPayload = defaultAddress
            ? {
                address_id: defaultAddress.address_id,
                address: defaultAddress.address
            }
            : null;
        // Kiểm tra mật khẩu với bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Mật khẩu không đúng!" });
        }

        // Tạo token JWT
        const token = jwt.sign(
            {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                addresses: addressPayload,
                avatar: user.avatar
            },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        // Lưu token vào cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Chỉ bật `true` nếu dùng HTTPS
            sameSite: "Strict",
            maxAge: 3600000 // 1 giờ
        });

        res.json({ message: "Đăng nhập thành công!", token });
    } catch (error) {
        console.error("Lỗi server:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
});

// API kiểm tra token
app.get("/api/check-auth", (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; // Lấy từ cookie hoặc header

    console.log("Cookie nhận được:", req.cookies);
    console.log("Header Authorization:", req.headers.authorization);

    if (!token) {
        return res.status(401).json({ message: "Chưa đăng nhập!" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ message: "Xác thực thành công!", user: decoded });
    } catch (error) {
        res.status(403).json({ message: "Token không hợp lệ!" });
    }
});
//đăng ký
// app.post("/api/signup", async (req, res) => {
//     try {
//         const { email, password, name, role = "customer" } = req.body;

//         // Kiểm tra xem email đã tồn tại chưa
//         const existingUser = await UserModel.findOne({ where: { email } });
//         if (existingUser) {
//             return res.status(400).json({ error: "Email đã tồn tại!" });
//         }

//         // Hash password (Nên dùng bcrypt để bảo mật)
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Tạo user mới
//         const user = await UserModel.create({
//             email,
//             password: hashedPassword,
//             name,
//             role
//         });

//         res.status(201).json({ message: "Đăng ký thành công!", user });

//     } catch (error) {
//         console.error("Lỗi khi đăng ký:", error);
//         res.status(500).json({ error: "Lỗi server!" });
//     }
// });
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
const pendingUsers = {};

// **API Đăng ký (chỉ gửi OTP, chưa tạo tài khoản)**
app.post("/api/signup", async (req, res) => {
    try {
        const { email, password, name, phone, role = "customer" } = req.body;

        // Kiểm tra xem email đã đăng ký chưa
        if (pendingUsers[email]) {
            return res.status(400).json({ error: "OTP đã được gửi. Vui lòng xác nhận trước khi đăng ký lại." });
        }

        // Tạo OTP
        const otp = generateOTP();

        // Lưu thông tin tạm thời
        pendingUsers[email] = {
            email,
            password: await bcrypt.hash(password, 10),
            name,
            phone,
            role,
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000, // Hết hạn sau 10 phút
        };

        // Gửi email OTP
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Xác nhận đăng ký tài khoản",
            text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 10 phút.`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Mã OTP đã được gửi. Vui lòng xác nhận." });

    } catch (error) {
        console.error("Lỗi khi gửi OTP:", error);
        res.status(500).json({ error: "Lỗi server!", log: error.message });
    }
});
app.post("/api/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Kiểm tra xem có OTP chờ xác nhận không
        if (!pendingUsers[email]) {
            return res.status(400).json({ error: "Không tìm thấy yêu cầu đăng ký." });
        }

        const userData = pendingUsers[email];

        // Kiểm tra thời gian hết hạn OTP
        if (Date.now() > userData.expiresAt) {
            delete pendingUsers[email];
            return res.status(400).json({ error: "OTP đã hết hạn. Vui lòng đăng ký lại." });
        }

        // Kiểm tra OTP hợp lệ không
        if (userData.otp !== otp) {
            return res.status(400).json({ error: "OTP không đúng!" });
        }

        // Tạo tài khoản trong database
        const user = await UserModel.create({
            email: userData.email,
            password: userData.password,
            name: userData.name,
            phone: userData.phone,
            role: userData.role,
        });

        // Xóa OTP sau khi xác nhận thành công
        delete pendingUsers[email];

        res.status(201).json({ message: "Xác nhận thành công! Tài khoản đã được tạo.", user });

    } catch (error) {
        console.error("Lỗi xác nhận OTP:", error);
        res.status(500).json({ error: "Lỗi server!" });
    }
});
// app.get("/api/check-auth", async (req, res) => {
//     try {
//         // 1️⃣ Lấy token từ cookie hoặc header
//         const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

//         if (!token) {
//             return res.status(401).json({ message: "Chưa đăng nhập!" });
//         }

//         // 2️⃣ Giải mã token
//         const decoded = jwt.verify(token, SECRET_KEY);

//         // 3️⃣ Tìm user trong database
//         const user = await UserModel.findOne({ where: { id: decoded.id } });

//         if (!user) {
//             return res.status(404).json({ message: "Người dùng không tồn tại!" });
//         }

//         // 4️⃣ Trả về thông tin user (ẩn thông tin nhạy cảm)
//         res.json({
//             message: "Xác thực thành công!",
//             user: {
//                 id: user.user_id,
//                 email: user.email,
//                 role: user.role, // Chỉ gửi thông tin cần thiết
//                 name: user.name
//             }
//         });

//     } catch (error) {
//         return res.status(403).json({ message: "Token không hợp lệ!", error: error.message });
//     }
// });

app.get("/api/")
//send email
app.post("/api/send-email", async (req, res) => {
    const { name, email, phone, message } = req.body;

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Yêu cầu liên hệ từ khách hàng",
        html: `
            <h3>Thông tin khách hàng</h3>
            <p><strong>Tên:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Số điện thoại:</strong> ${phone}</p>
            <p><strong>Ghi chú:</strong> ${message}</p>
            <p><strong>Hỗ trợ:</strong> Cảm ơn ${name} đã liên hệ với chúng tôi. Chúng tôi sẽ liên hệ lại cho bạn trong thời gian ngắn nhất mong bạn giữ máy để được phản hồi tốt nhất.</p>
            <p>Trân trọng cảm ơn.</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Email đã được gửi thành công!" });
    } catch (error) {
        console.error("Lỗi gửi email:", error);
        res.status(500).json({ success: false, message: "Lỗi khi gửi email!" });
    }
});
app.get("/api/sp-tuong-tu/:id", async (req, res) => {
    try {
        const product_id = Number(req.params.id);

        // Tìm sản phẩm hiện tại
        const spHienTai = await ProductModel.findByPk(product_id);
        if (!spHienTai) {
            return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
        }

        // Lấy danh sách sản phẩm cùng loại (trừ sản phẩm hiện tại)
        const sp_arr = await ProductModel.findAll({
            where: {
                category_id: spHienTai.category_id,
                // an_hien: 1,
                product_id: { [Op.ne]: product_id } // Loại bỏ sản phẩm hiện tại
            },
            order: [["created_at", "DESC"], ["price", "ASC"]],
            limit: 6, // Giới hạn số sản phẩm tương tự
        });

        res.json(sp_arr);
    } catch (error) {
        console.error("Lỗi lấy sản phẩm tương tự:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
});
//#1
// app.post('/api/luudonhang/', async (req, res) => {
//     try {
//         let { user_id, ghi_chu } = req.body;

//         // Kiểm tra xem user_id có được cung cấp không
//         if (!user_id) {
//             return res.status(400).json({ thong_bao: "Thiếu user_id" });
//         }

//         // Tạo mã đơn hàng ngẫu nhiên (4 ký tự gồm cả số và chữ)
//         let ma_dh = crypto.randomBytes(2).toString('hex').toUpperCase(); // 2 bytes => 4 ký tự hex

//         // Tạo đơn hàng mới
//         let newOrder = await CartModel.create({
//             user_id: user_id,
//             ghi_chu: ghi_chu || "",
//             ma_dh: ma_dh
//         });

//         res.json({ thong_bao: "Đã tạo đơn hàng", don_hang: newOrder });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ thong_bao: "Lỗi tạo đơn hàng", err });
//     }
// });
//#2
// app.post('/api/luudonhang/', async (req, res) => {
//     try {
//         let { user_id, ghi_chu, email, payment, voucher, products, address } = req.body;

//         if (!user_id || !email || !Array.isArray(products) || products.length === 0) {
//             return res.status(400).json({ thong_bao: "Thiếu user_id, email hoặc danh sách sản phẩm" });
//         }
//         // if (new_address && new_address.trim() !== "") {
//         //     const existingAddress = await AddressModel.findOne({
//         //         where: {
//         //             user_id,
//         //             address: new_address.trim()
//         //         }
//         //     });

//         //     if (!existingAddress) {
//         //         await AddressModel.create({
//         //             user_id,
//         //             address: new_address.trim()
//         //         });
//         //         console.log("📦 Đã lưu địa chỉ mới:", new_address);
//         //     } else {
//         //         console.log("📦 Địa chỉ đã tồn tại, không cần lưu lại:", new_address);
//         //     }
//         // }

//         // 🔹 Tạo mã đơn hàng ngẫu nhiên
//         let ma_dh = crypto.randomBytes(2).toString('hex').toUpperCase();

//         // 🔹 Bước 1: Tạo đơn hàng trước
//         let newOrder = await CartModel.create({
//             user_id,
//             ghi_chu: ghi_chu || "",
//             ma_dh,
//             payment,
//             voucher,
//             address
//         });

//         console.log("📌 Đơn hàng đã tạo:", newOrder);

//         // 🔹 Bước 2: Thêm sản phẩm vào giỏ hàng
//         let cartItems = [];
//         for (let product of products) {
//             let { id, ten_sp, so_luong, gia_mua, hinh, size } = product; // Dữ liệu sai tên cột
//             let product_id = id; // Hoặc tìm product_id từ database nếu cần
//             let quantity = so_luong;
//             let price = gia_mua;

//             // Kiểm tra dữ liệu đầu vào
//             if (!product_id || !quantity || !price) {
//                 console.error("⚠ Dữ liệu sản phẩm không hợp lệ:", product);
//                 continue;
//             }
//             // 🔎 Kiểm tra tồn kho trước khi thêm vào giỏ hàng
//             let productData = await ProductModel.findOne({ where: { product_id } });
//             if (!productData || productData.stock < quantity) {
//                 console.error(`❌ Sản phẩm ${ten_sp} không đủ hàng trong kho!`);
//                 return res.status(400).json({ thong_bao: `Sản phẩm ${ten_sp} không đủ hàng trong kho!` });
//             }
//             let cartItem = await CartItemModel.create({
//                 cart_id: newOrder.cart_id, // ✅ Lấy đúng cart_id
//                 product_id,
//                 quantity,
//                 price: quantity * price,
//                 size
//             });

//             cartItems.push(cartItem);
//             // 🔹 Cập nhật stock trong bảng product (giảm số lượng đã mua)
//             await ProductModel.update(
//                 { stock: sequelize.literal(`stock - ${quantity}`) },
//                 { where: { product_id } }
//             );
//         }

//         console.log("🛒 Sản phẩm đã thêm vào giỏ hàng:", cartItems);

//         // 🔹 Bước 3: Lấy danh sách sản phẩm đã thêm vào giỏ hàng
//         let cartItemDetails = await CartItemModel.findAll({
//             where: { cart_id: newOrder.cart_id },
//             include: [{ model: ProductModel, as: "product", attributes: ['name', 'img', 'price'] }]
//         });

//         // 🔹 Tính tổng tiền và tạo danh sách sản phẩm
//         let total = 0;
//         let productListHTML = cartItemDetails.map(item => {
//             total += item.price;
//             return `
//                 <tr>
//                     <td><img src="img/${item.product.img}" width="100" /></td>
//                     <td>${item.product.name}</td>
//                     <td>${item.quantity}</td>
//                     <td>${item.price.toLocaleString()} VND</td>
//                 </tr>
//             `;
//         }).join("");

//         let emailContent = `
//             <h2>Đơn hàng #${ma_dh} của bạn</h2>
//             <p>Cảm ơn bạn đã đặt hàng! Dưới đây là thông tin đơn hàng của bạn:</p>
//             <table border="1" cellspacing="0" cellpadding="5">
//                 <tr>
//                     <th>Hình ảnh</th>
//                     <th>Tên sản phẩm</th>
//                     <th>Số lượng</th>
//                     <th>Giá</th>
//                 </tr>
//                 ${productListHTML}
//             </table>
//             <p><strong>Tổng tiền: ${total.toLocaleString()} VND</strong></p>
//             <p>Ghi chú: ${ghi_chu || "Không có"}</p>
//             <p>Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi!</p>
//         `;

//         // 🔹 Cấu hình mailer (dùng biến môi trường thay vì hardcode mật khẩu)
//         let transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS
//             }
//         });

//         let mailOptions = {
//             from: '"Shop Online" <' + process.env.EMAIL_USER + '>',
//             to: email,
//             subject: `Xác nhận đơn hàng #${ma_dh}`,
//             html: emailContent
//         };

//         // 🔹 Gửi email
//         await transporter.sendMail(mailOptions);

//         console.log("📩 Đã gửi email xác nhận đơn hàng!");

//         res.json({ thong_bao: "Đã tạo đơn hàng và gửi email", don_hang: newOrder });

//     } catch (err) {
//         console.error("❌ Lỗi khi tạo đơn hàng:", err);
//         res.status(500).json({ thong_bao: "Lỗi tạo đơn hàng", err });
//     }
// });
//#3
// app.post('/api/luudonhang/', async (req, res) => {
//     try {
//         let { user_id, ghi_chu, email, payment, voucher, products, address } = req.body;

//         if (!user_id || !email || !Array.isArray(products) || products.length === 0) {
//             return res.status(400).json({ thong_bao: "Thiếu user_id, email hoặc danh sách sản phẩm" });
//         }
//         // 🔹 Tạo mã đơn hàng ngẫu nhiên
//         let ma_dh = crypto.randomBytes(2).toString('hex').toUpperCase();

//         // 🔹 Bước 1: Tạo đơn hàng trước
//         let newOrder = await CartModel.create({
//             user_id,
//             ghi_chu: ghi_chu || "",
//             ma_dh,
//             payment,
//             voucher,
//             address
//         });

//         console.log("📌 Đơn hàng đã tạo:", newOrder);

//         // 🔹 Bước 2: Thêm sản phẩm vào giỏ hàng
//         let cartItems = [];
//         for (let product of products) {
//             let { id, ten_sp, so_luong, gia_mua, hinh, size } = product; // Dữ liệu sai tên cột
//             let product_id = id; // Hoặc tìm product_id từ database nếu cần
//             let quantity = so_luong;
//             let price = gia_mua;

//             // Kiểm tra dữ liệu đầu vào
//             if (!product_id || !quantity || !price) {
//                 console.error("⚠ Dữ liệu sản phẩm không hợp lệ:", product);
//                 continue;
//             }
//             // 🔎 Kiểm tra tồn kho trước khi thêm vào giỏ hàng
//             let productData = await ProductModel.findOne({ where: { product_id } });
//             if (!productData || productData.stock < quantity) {
//                 console.error(`❌ Sản phẩm ${ten_sp} không đủ hàng trong kho!`);
//                 return res.status(400).json({ thong_bao: `Sản phẩm ${ten_sp} không đủ hàng trong kho!` });
//             }
//             let cartItem = await CartItemModel.create({
//                 cart_id: newOrder.cart_id, // ✅ Lấy đúng cart_id
//                 product_id,
//                 quantity,
//                 price: quantity * price,
//                 size
//             });

//             cartItems.push(cartItem);
//             // 🔹 Cập nhật stock trong bảng product (giảm số lượng đã mua)
//             await ProductModel.update(
//                 { stock: sequelize.literal(`stock - ${quantity}`) },
//                 { where: { product_id } }
//             );
//         }

//         console.log("🛒 Sản phẩm đã thêm vào giỏ hàng:", cartItems);

//         // 🔹 Bước 3: Lấy danh sách sản phẩm đã thêm vào giỏ hàng
//         let cartItemDetails = await CartItemModel.findAll({
//             where: { cart_id: newOrder.cart_id },
//             include: [{ model: ProductModel, as: "product", attributes: ['name', 'img', 'price'] }]
//         });

//         // 🔹 Tính tổng tiền và tạo danh sách sản phẩm
//         let total = 0;
//         let productListHTML = cartItemDetails.map(item => {
//             total += item.price;
//             return `
//                 <tr>
//                     <td><img src="img/${item.product.img}" width="100" /></td>
//                     <td>${item.product.name}</td>
//                     <td>${item.quantity}</td>
//                     <td>${item.price.toLocaleString()} VND</td>
//                 </tr>
//             `;
//         }).join("");

//         let emailContent = `
//             <h2>Đơn hàng #${ma_dh} của bạn</h2>
//             <p>Cảm ơn bạn đã đặt hàng! Dưới đây là thông tin đơn hàng của bạn:</p>
//             <table border="1" cellspacing="0" cellpadding="5">
//                 <tr>
//                     <th>Hình ảnh</th>
//                     <th>Tên sản phẩm</th>
//                     <th>Số lượng</th>
//                     <th>Giá</th>
//                 </tr>
//                 ${productListHTML}
//             </table>
//             <p><strong>Tổng tiền: ${total.toLocaleString()} VND</strong></p>
//             <p>Ghi chú: ${ghi_chu || "Không có"}</p>
//             <p>Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi!</p>
//         `;

//         // 🔹 Cấu hình mailer (dùng biến môi trường thay vì hardcode mật khẩu)
//         let transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS
//             }
//         });

//         let mailOptions = {
//             from: '"Shop Online" <' + process.env.EMAIL_USER + '>',
//             to: email,
//             subject: `Xác nhận đơn hàng #${ma_dh}`,
//             html: emailContent
//         };

//         // 🔹 Gửi email
//         await transporter.sendMail(mailOptions);

//         console.log("📩 Đã gửi email xác nhận đơn hàng!");

//         res.json({ thong_bao: "Đã tạo đơn hàng và gửi email", don_hang: newOrder });

//     } catch (err) {
//         console.error("❌ Lỗi khi tạo đơn hàng:", err);
//         res.status(500).json({ thong_bao: "Lỗi tạo đơn hàng", err });
//     }
// });
// #4
app.post('/api/luudonhang/', async (req, res) => {
    try {
        let { user_id, ghi_chu, email, payment, voucher, products, address } = req.body;

        if (!user_id || !email || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ thong_bao: "Thiếu user_id, email hoặc danh sách sản phẩm" });
        }

        // 🔎 Bước kiểm tra toàn bộ sản phẩm trước khi tạo đơn hàng
        for (let product of products) {
            let { id, so_luong, ten_sp } = product;
            const productData = await ProductModel.findOne({ where: { product_id: id } });

            if (!productData || productData.stock < so_luong) {
                return res.status(400).json({ thong_bao: `❌ Sản phẩm "${ten_sp}" không đủ hàng trong kho!` });
            }
        }

        // 🔹 Tạo mã đơn hàng ngẫu nhiên
        let ma_dh = crypto.randomBytes(2).toString('hex').toUpperCase();

        // 🔹 Bước 1: Tạo đơn hàng
        let newOrder = await CartModel.create({
            user_id,
            ghi_chu: ghi_chu || "",
            ma_dh,
            payment,
            voucher,
            address
        });

        let cartItems = [];
        for (let product of products) {
            let { id, ten_sp, so_luong, gia_mua, hinh, size } = product;
            let product_id = id;
            let quantity = so_luong;
            let price = gia_mua;

            let cartItem = await CartItemModel.create({
                cart_id: newOrder.cart_id,
                product_id,
                quantity,
                price: quantity * price,
                size
            });

            cartItems.push(cartItem);

            await ProductModel.update(
                { stock: sequelize.literal(`stock - ${quantity}`) },
                { where: { product_id } }
            );
        }

        console.log("🛒 Sản phẩm đã thêm vào giỏ hàng:", cartItems);

        // 🔹 Bước 3: Lấy danh sách sản phẩm đã thêm vào giỏ hàng
        let cartItemDetails = await CartItemModel.findAll({
            where: { cart_id: newOrder.cart_id },
            include: [{ model: ProductModel, as: "product", attributes: ['name', 'img', 'price'] }]
        });

        // 🔹 Tính tổng tiền và tạo danh sách sản phẩm
        let total = 0;
        let productListHTML = cartItemDetails.map(item => {
            total += item.price;
            return `
                <tr>
                    <td><img src="http://localhost:3001/img/${item.product.img}" width="100" /></td>
                    <td>${item.product.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toLocaleString()} VND</td>
                </tr>
            `;
        }).join("");

        let emailContent = `
            <h2>Đơn hàng #${ma_dh} của bạn</h2>
            <p>Cảm ơn bạn đã đặt hàng! Dưới đây là thông tin đơn hàng của bạn:</p>
            <table border="1" cellspacing="0" cellpadding="5">
                <tr>
                    <th>Hình ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Giá</th>
                </tr>
                ${productListHTML}
            </table>
            <p><strong>Tổng tiền: ${total.toLocaleString()} VND</strong></p>
            <p>Ghi chú: ${ghi_chu || "Không có"}</p>
            <p>Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi!</p>
        `;

        // 🔹 Cấu hình mailer (dùng biến môi trường thay vì hardcode mật khẩu)
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false // ⚠️ bỏ kiểm tra chứng chỉ SSL
              }
        });

        let mailOptions = {
            from: '"Shop Online" <' + process.env.EMAIL_USER + '>',
            to: email,
            subject: `Xác nhận đơn hàng #${ma_dh}`,
            html: emailContent
        };

        // 🔹 Gửi email
        await transporter.sendMail(mailOptions);

        console.log("📩 Đã gửi email xác nhận đơn hàng!");

        res.json({ thong_bao: "Đã tạo đơn hàng và gửi email", don_hang: newOrder });

    } catch (err) {
        console.error("❌ Lỗi khi tạo đơn hàng:", err);
        res.status(500).json({ thong_bao: "Lỗi tạo đơn hàng", err });
    }
});
//#5
// app.post('/api/luudonhang/', async (req, res) => {
//     try {
//         let { user_id, ghi_chu, email, payment, voucher, products, address } = req.body;

//         if (!user_id || !email || !Array.isArray(products) || products.length === 0) {
//             return res.status(400).json({ thong_bao: "Thiếu user_id, email hoặc danh sách sản phẩm" });
//         }

//         // 🔎 Kiểm tra kho nếu có sản phẩm có status = 1
//         for (let product of products) {
//             let { id, so_luong, ten_sp, status } = product;
//             if (status === 1) {
//                 const productData = await ProductModel.findOne({ where: { product_id: id } });

//                 if (!productData || productData.stock < so_luong) {
//                     return res.status(400).json({ thong_bao: `❌ Sản phẩm "${ten_sp}" không đủ hàng trong kho!` });
//                 }
//             }
//         }

//         // 🔹 Tạo mã đơn hàng
//         let ma_dh = crypto.randomBytes(2).toString('hex').toUpperCase();

//         // 🔹 Tạo đơn hàng (không có status vì dùng ở CartItemModel)
//         let newOrder = await CartModel.create({
//             user_id,
//             ghi_chu: ghi_chu || "",
//             ma_dh,
//             payment,
//             voucher,
//             address
//         });

//         let cartItems = [];
//         for (let product of products) {
//             let { id, ten_sp, so_luong, gia_mua, hinh, size, status } = product;
//             let product_id = id;
//             let quantity = so_luong;
//             let price = gia_mua;

//             // 🔸 Trừ stock nếu sản phẩm được xác nhận
//             if (status === 1) {
//                 await ProductModel.update(
//                     { stock: sequelize.literal(`stock - ${quantity}`) },
//                     { where: { product_id } }
//                 );
//             }

//             let cartItem = await CartItemModel.create({
//                 cart_id: newOrder.cart_id,
//                 product_id,
//                 quantity,
//                 price: quantity * price,
//                 size,
//                 status // gán status vào từng cart item
//             });

//             cartItems.push(cartItem);
//         }

//         console.log("🛒 Đã thêm sản phẩm vào đơn:", cartItems);

//         // 🔹 Lấy chi tiết giỏ hàng để gửi email
//         let cartItemDetails = await CartItemModel.findAll({
//             where: { cart_id: newOrder.cart_id },
//             include: [{ model: ProductModel, as: "product", attributes: ['name', 'img', 'price'] }]
//         });

//         let total = 0;
//         let productListHTML = cartItemDetails.map(item => {
//             total += item.price;
//             return `
//                 <tr>
//                     <td><img src="http://localhost:3001/img/${item.product.img}" width="100" /></td>
//                     <td>${item.product.name}</td>
//                     <td>${item.quantity}</td>
//                     <td>${item.price.toLocaleString()} VND</td>
//                 </tr>
//             `;
//         }).join("");

//         let emailContent = `
//             <h2>Đơn hàng #${ma_dh} của bạn</h2>
//             <p>Cảm ơn bạn đã đặt hàng! Dưới đây là thông tin đơn hàng của bạn:</p>
//             <table border="1" cellspacing="0" cellpadding="5">
//                 <tr>
//                     <th>Hình ảnh</th>
//                     <th>Tên sản phẩm</th>
//                     <th>Số lượng</th>
//                     <th>Giá</th>
//                 </tr>
//                 ${productListHTML}
//             </table>
//             <p><strong>Tổng tiền: ${total.toLocaleString()} VND</strong></p>
//             <p>Ghi chú: ${ghi_chu || "Không có"}</p>
//             <p>Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi!</p>
//         `;

//         let transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS
//             }
//         });

//         let mailOptions = {
//             from: '"Shop Online" <' + process.env.EMAIL_USER + '>',
//             to: email,
//             subject: `Xác nhận đơn hàng #${ma_dh}`,
//             html: emailContent
//         };

//         await transporter.sendMail(mailOptions);

//         console.log("📩 Đã gửi email xác nhận đơn hàng!");

//         res.json({ thong_bao: "Đã tạo đơn hàng và gửi email", don_hang: newOrder });

//     } catch (err) {
//         console.error("❌ Lỗi khi tạo đơn hàng:", err);
//         res.status(500).json({ thong_bao: "Lỗi tạo đơn hàng", err });
//     }
// });




app.get("/api/donhang", async (req, res) => {
    try {
        // Lấy thông tin phân trang từ query: /api/donhang?page=1&limit=10
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Lấy tổng số đơn hàng
        const totalCount = await CartModel.count();

        // Lấy danh sách đơn hàng có phân trang
        const donhang = await CartModel.findAll({
            limit,
            offset,
            order: [["created_at", "DESC"]], // Sắp xếp theo ngày tạo mới nhất
            include: [
                {
                    model: CartItemModel,
                    as: "cartitem",
                    attributes: ["price", "status", "quantity"],
                    include: [{ model: ProductModel, as: "product" }]

                },
                {
                    model: UserModel,
                    as: "user",
                    attributes: ["email", "name"],
                    include: [
                        {
                            model: AddressModel,
                            as: "addresses",
                            where: {
                                is_default: 1
                            },
                            required: false,
                            attributes: ["address"]
                        }
                    ]
                },
            ]
        });

        res.json({
            thong_bao: "Đã lấy đơn hàng",
            donhang,
            pagination: {
                currentPage: page,
                perPage: limit,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ thong_bao: "Lỗi lấy đơn hàng", err });
    }
});
// app.get("/api/donhang", async (req, res) => {
//     try {
//         // Lấy thông tin phân trang từ query: /api/donhang?page=1&limit=10
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const offset = (page - 1) * limit;

//         // Lấy tổng số đơn hàng
//         const totalCount = await CartModel.count();

//         // Lấy danh sách đơn hàng có phân trang
//         const donhang = await CartModel.findAll({
//             limit,
//             offset,
//             order: [["created_at", "DESC"]], // Sắp xếp theo ngày tạo mới nhất
//             include: [
//                 {
//                     model: CartItemModel,
//                     as: "cartitem",
//                     attributes: ["price", "status", "quantity"],
//                     include: [{ model: ProductModel, as: "product" }]
//                 },
//                 {
//                     model: UserModel,
//                     as: "user",
//                     attributes: ["email", "name"],
//                     include: [
//                         {
//                             model: AddressModel,
//                             as: "addresses",
//                             where: {
//                                 is_default: 1
//                             },
//                             required: false,
//                             attributes: ["address"]
//                         }
//                     ]
//                 },
//             ]
//         });

//         // Tính tổng tiền của đơn hàng
//         // Tính tổng tiền của đơn hàng
//         const tongTien = Array.isArray(donhang.cartitem) ? donhang.cartitem.reduce((total, item) => {
//             const price = item.product.discount_price || item.product.price;  // Kiểm tra giá trị hợp lệ
//             const quantity = item.quantity || 1;  // Sử dụng quantity mặc định là 1 nếu không có
//             return total + (price * quantity);  // Tính tổng tiền
//         }, 0) : 0;  // Nếu không có cartitem, trả về 0


//         // Kiểm tra voucher và tính giảm giá
//         if (donhang.voucher) {
//             const voucher = await VouchersModel.findOne({ where: { code: donhang.voucher } });

//             if (voucher) {
//                 // Giả sử voucher có một thuộc tính `discount_percentage` và giảm theo phần trăm
//                 const discount = (voucher.discount_percentage / 100) * tongTien;
//                 const finalTotal = tongTien - discount;

//                 donhang.discount = discount;
//                 donhang.final_total = finalTotal;
//             } else {
//                 donhang.discount = 0;
//                 donhang.final_total = tongTien;
//             }
//         } else {
//             donhang.discount = 0;
//             donhang.final_total = tongTien;
//         }

//         // Trả về kết quả
//         res.json({
//             thong_bao: "Đã lấy đơn hàng",
//             donhang,
//             pagination: {
//                 currentPage: page,
//                 perPage: limit,
//                 totalPages: Math.ceil(totalCount / limit),
//                 totalCount,
//             }
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ thong_bao: "Lỗi lấy đơn hàng", err });
//     }
// });
app.get("/api/donhang/:id", async (req, res) => {
    try {
        const donhang = await CartModel.findOne({
            where: { cart_id: req.params.id },
            include: [
                {
                    model: CartItemModel,
                    as: "cartitem",
                    include: [{ model: ProductModel, as: "product" }]
                },
                {
                    model: UserModel,
                    as: "user",
                    attributes: ["email", "name"],
                    include: [{
                        model: AddressModel,
                        as: "addresses",
                        where: { is_default: 1 },
                        required: false,
                        attributes: ["address"]
                    }]
                }
            ]
        });

        res.json(donhang);
    } catch (err) {
        console.error(err);
        res.status(500).json({ thong_bao: "Lỗi", err });
    }
});

app.get("/api/donhang/user/:user_id", async (req, res) => {
    try {
        let userId = req.params.user_id; // Lấy user_id từ URL

        let donhang = await CartModel.findAll({  // Sử dụng findAll để lấy nhiều đơn hàng
            where: { user_id: userId }, // Lọc theo user_id
            include: [
                {
                    model: CartItemModel,
                    as: "cartitem",
                    attributes: ["quantity", "price", "status", "status_way"],
                    include: [
                        {
                            model: ProductModel,
                            as: "product",
                            attributes: ["product_id", "name", "discount_price", "img"]
                        }
                    ]
                },
                {
                    model: UserModel,
                    as: "user",
                    attributes: ["role"],
                    include: [
                        {
                            model: AddressModel,
                            as: "addresses",
                            where: {
                                is_default: 1
                            },
                            required: false,
                            attributes: ["address"]
                        }
                    ]
                },
            ]
        });

        if (!donhang || donhang.length === 0) {
            return res.status(404).json({ thong_bao: "Không tìm thấy đơn hàng cho người dùng này" });
        }

        res.json({
            thong_bao: "Đã lấy danh sách đơn hàng",
            donhang: donhang
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ thong_bao: "Lỗi lấy đơn hàng", err });
    }
});
app.get("/api/diachi/:user_id", async (req, res) => {
    try {
        let userId = req.params.user_id; // Lấy user_id từ URL

        let diaChi = await AddressModel.findAll({
            where: { user_id: userId }, // Lọc theo user_id
            include: [
                {
                    model: UserModel,
                    as: "address_user", // Đúng alias trong belongsTo()
                    attributes: ["name", "email"] // Chỉ lấy thông tin cần thiết
                }
            ]
        });

        if (diaChi.length === 0) {
            return res.status(404).json({ thong_bao: "Không tìm thấy địa chỉ cho user này" });
        }

        res.json({
            thong_bao: "Đã lấy danh sách địa chỉ",
            dia_chi: diaChi
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ thong_bao: "Lỗi lấy địa chỉ", err });
    }
});
//them dia chi
app.post("/api/diachi", async (req, res) => {
    try {
        let { address, user_id } = req.body; // Lấy thông tin từ request

        let newAddress = await AddressModel.create({
            address: address,
            user_id: user_id
        });

        res.json({
            thong_bao: "Đã thêm địa chỉ",
            address: newAddress
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ thong_bao: "Lỗi thêm địa chỉ", err });
    }
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Lấy từ biến môi trường
        pass: process.env.EMAIL_PASS  // Lấy từ biến môi trường
    }
});
app.post("/api/send-otp", async (req, res) => {
    const { email } = req.body;
    const user = await UserModel.findOne({ where: { email: email } }); // ✅

    if (!user) return res.status(404).json({ message: "Email không tồn tại!" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Tạo JWT chứa OTP, có hạn trong 10 phút
    const otpToken = jwt.sign({ otp, email }, process.env.JWT_SECRET, { expiresIn: "10m" });

    // Gửi email OTP (bỏ lưu OTP trong DB)
    transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Mã OTP đổi mật khẩu",
        text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 10 phút.`
    });

    res.json({ message: "OTP đã được gửi!", otpToken });
});
app.post("/api/reset-password", async (req, res) => {
    const { otp, newPassword, otpToken } = req.body;

    try {
        // Giải mã OTP từ JWT
        const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);

        if (decoded.otp !== otp) return res.status(400).json({ message: "OTP không đúng!" });

        // Cập nhật mật khẩu
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await UserModel.update(
            { password: hashedPassword },
            { where: { email: decoded.email } } // Điều kiện update
        );


        res.json({ message: "Mật khẩu đã được cập nhật!" });
    } catch (error) {
        res.status(400).json({ message: "OTP đã hết hạn!", log: error.message });
    }
});
app.post("/api/change-password", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Không có token!" });

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Kiểm tra đủ thông tin
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin!" });
        }

        // So khớp mật khẩu mới
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Mật khẩu mới không khớp!" });
        }

        const user = await UserModel.findOne({ where: { email: decoded.email } });
        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại!" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Mật khẩu cũ không đúng!" });

        const hashed = await bcrypt.hash(newPassword, 10);
        await UserModel.update({ password: hashed }, { where: { email: decoded.email } });

        res.json({ message: "Đổi mật khẩu thành công!" });
    } catch (err) {
        res.status(401).json({ message: "Token không hợp lệ hoặc hết hạn!" });
    }
});

app.post("/api/thembinhluan/:product_id", async (req, res) => {
    const { user_id, comment, rating } = req.body;
    const product_id = req.params.product_id;
    try {
        // Kiểm tra dữ liệu đầu vào
        if (!product_id || !user_id || !comment) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
        }

        // Kiểm tra user có tồn tại không
        const user = await UserModel.findOne({ where: { user_id: user_id } });
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại!" });
        }
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const hasPurchased = await CartItemModel.findOne({
            include: {
                model: CartModel,
                as: "cart",
                where: {
                    user_id,
                },
            },
            where: {
                status: 1,
                added_at: { [Op.gte]: thirtyDaysAgo },
            },
        });

        if (!hasPurchased) {
            return res.status(403).json({ message: "Bạn chỉ có thể bình luận nếu đã mua sản phẩm trong vòng 30 ngày!" });
        }
        // Thêm bình luận vào database
        const binhluanModel = await ReviewModel.create({
            product_id,
            user_id,
            comment,
            rating: rating || null // Rating có thể null
        });

        res.status(201).json({ message: "Bình luận thành công!", binhluanModel });
    } catch (error) {
        console.error("Lỗi khi thêm bình luận:", error);
        res.status(500).json({ message: "Lỗi hệ thống!", error: error.message });
    }
});
app.get("/api/binhluan/:product_id", async (req, res) => {
    const product_id = Number(req.params.product_id);

    try {
        // Kiểm tra product_id có hợp lệ không
        if (isNaN(product_id)) {
            return res.status(400).json({ message: "Product ID không hợp lệ!" });
        }

        // Tìm tất cả bình luận của sản phẩm
        const binhluans = await ReviewModel.findAll({
            where: { product_id: product_id }, // Lấy tất cả bình luận theo product_id
            include: [{
                model: UserModel,
                as: "review_user",
                attributes: ["name", "email"]
            }],
            order: [["created_at", "DESC"]] // Sắp xếp theo thời gian mới nhất
        });

        // Nếu không có bình luận nào
        if (binhluans.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy bình luận nào!" });
        }

        res.json({ message: "Lấy bình luận thành công!", binhluans });
    } catch (error) {
        console.error("Lỗi khi lấy bình luận:", error);
        res.status(500).json({ message: "Lỗi hệ thống!", error: error.message });
    }
});
app.get("/api/blog", async (req, res) => {
    try {
        const blogs = await BlogModel.findAll({
            order: [["created_at", "DESC"]]
        });
        res.json({ message: "Lấy blog thành công!", blogs });
    } catch (error) {
        console.error("Lỗi khi lấy blog:", error);
        res.status(500).json({
            message: "Lỗi hệ thống!", error: error.messag
        });
    }
})
app.get("/api/blog/:blog_id", async (req, res) => {
    const blog_id = Number(req.params.blog_id);
    try {
        // Kiểm tra blog_id có hợp lệ không
        if (isNaN(blog_id)) {
            return res.status(400).json({ message: "Blog ID không hợp lệ!" });
        }
        // Tìm blog theo blog_id
        const blog = await BlogModel.findByPk(blog_id);
        if (!blog) {
            return res.status(404).json({ message: "Không tìm thấy blog!" });
        }
        res.json({ message: "Lấy blog thành công!", blog });
    } catch (error) {
        console.error("Lỗi khi lấy blog:", error);
        res.status(500).json({ message: "Lỗi hệ thống!", error: error.message });
    }
});
//tăng view khi truy cập blog
app.get("/api/blog/:blog_id/view", async (req, res) => {
    const blog_id = Number(req.params.blog_id);
    try {
        // Kiểm tra blog_id có hợp lệ không
        if (isNaN(blog_id)) {
            return res.status(400).json({ message: "Blog ID không hợp lệ!" });
        }
        // Tìm blog theo blog_id
        const blog = await BlogModel.findByPk(blog_id);
        if (!blog) {
            return res.status(404).json({ message: "Không tìm thấy blog!" });
        }
        // Tăng view
        await blog.increment("view");
        res.json({ message: "Tăng view thành công!" });
    } catch (error) {
        console.error("Lỗi khi tăng view:", error);
        res.status(500).json({ message: "Lỗi hệ thống!", error: error.message });
    }
})
//admin
//api lấy sản phẩm đã bán trong tháng
app.get("/api/admin/product/sold", async (req, res) => {
    // Tháng hiện tại
    const startOfCurrentMonth = moment().startOf('month');
    const endOfCurrentMonth = moment();  // Kết thúc tháng hiện tại (hiện tại)

    // Tháng trước
    const startOfPreviousMonth = moment().subtract(1, 'month').startOf('month');
    const endOfPreviousMonth = moment().subtract(1, 'month').endOf('month');

    try {
        // Lấy tổng số lượng sản phẩm bán ra trong tháng hiện tại
        const currentMonthSales = await CartItemModel.findOne({
            where: {
                status: 1,  // Chỉ lấy những đơn hàng đã thanh toán
                added_at: {
                    [Op.between]: [
                        startOfCurrentMonth.format('YYYY-MM-DD'),
                        endOfCurrentMonth.format('YYYY-MM-DD HH:mm:ss')
                    ]
                }
            },
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('quantity')), 'totalSold']  // Tính tổng số lượng bán ra
            ]
        });

        // Lấy tổng số lượng sản phẩm bán ra trong tháng trước
        const previousMonthSales = await CartItemModel.findOne({
            where: {
                status: 1,  // Chỉ lấy những đơn hàng đã thanh toán
                added_at: {
                    [Op.between]: [
                        startOfPreviousMonth.format('YYYY-MM-DD'),
                        endOfPreviousMonth.format('YYYY-MM-DD HH:mm:ss')
                    ]
                }
            },
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('quantity')), 'totalSold']  // Tính tổng số lượng bán ra
            ]
        });

        // Lấy tổng số lượng bán ra của tháng hiện tại và tháng trước
        const currentMonthTotalSold = currentMonthSales ? currentMonthSales.dataValues.totalSold : 0;
        const previousMonthTotalSold = previousMonthSales ? previousMonthSales.dataValues.totalSold : 0;

        // Tính phần trăm thay đổi giữa tháng hiện tại và tháng trước
        let percentageChange = 0;
        if (previousMonthTotalSold > 0) {
            percentageChange = ((currentMonthTotalSold - previousMonthTotalSold) / previousMonthTotalSold) * 100;
        }

        res.json({
            message: "Lấy sản phẩm đã bán thành công!",
            currentMonthTotalSold,
            previousMonthTotalSold,
            percentageChange,
        });

    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm đã bán:", error);
        res.status(500).json({
            message: "Lỗi hệ thống!", error: error.message
        });
    }
});
// app.get("/api/admin/customers", async (req, res) => {
//     try {
//         console.log("📌 API được gọi với query:", req.query);

//         const month = req.query.month ? parseInt(req.query.month) : moment().month() + 1;
//         const year = req.query.year ? parseInt(req.query.year) : moment().year();
//         const startOfMonth = moment(`${year}-${month}-01`).startOf("month").toDate();
//         const endOfMonth = moment(`${year}-${month}-01`).endOf("month").toDate();

//         console.log("📅 Thời gian lọc:", startOfMonth, "->", endOfMonth);

//         const allCustomers = await UserModel.findAll();
//         console.log("📊 Tổng số khách hàng:", allCustomers.length);

//         const newCustomers = await UserModel.findAll({
//             where: { created_at: { [Op.between]: [startOfMonth, endOfMonth] } }
//         });
//         console.log("📊 Số khách hàng mới:", newCustomers.length);

//         const topCustomer = await CartModel.findAll({
//             attributes: [
//                 "user_id",
//                 [Sequelize.fn("COUNT", Sequelize.col("cart_id")), "orderCount"]
//             ],
//             where: { created_at: { [Op.between]: [startOfMonth, endOfMonth] } },
//             group: ["user_id"],
//             order: [[Sequelize.literal("orderCount"), "DESC"]],
//             limit: 1,
//             include: [{ model: UserModel, as: "user" }]
//         });

//         console.log("🏆 Top khách hàng:", topCustomer);

//         res.json({
//             message: "Lấy dữ liệu khách hàng theo tháng thành công!",
//             allCustomers,
//             newCustomers,
//             topCustomer: topCustomer.length ? topCustomer[0] : null
//         });
//     } catch (error) {
//         console.error("❌ Lỗi khi lấy dữ liệu khách hàng:", error);
//         res.status(500).json({ message: "Lỗi hệ thống!", error: error.message });
//     }
// });
//#1
// app.get("/api/admin/customers", async (req, res) => {
//     try {
//         const year = req.query.year ? parseInt(req.query.year) : moment().year();
//         let monthlyData = {};

//         for (let month = 1; month <= 12; month++) {
//             const startOfMonth = moment(`${year}-${month}-01`).startOf("month").toDate();
//             const endOfMonth = moment(`${year}-${month}-01`).endOf("month").toDate();

//             // Lấy tổng số khách hàng
//             const totalCustomers = await UserModel.count();

//             // Lấy khách hàng mới trong tháng
//             const newCustomers = await UserModel.count({
//                 where: { created_at: { [Op.between]: [startOfMonth, endOfMonth] } }
//             });

//             // Lấy khách hàng có số đơn nhiều nhất
//             const topCustomer = await CartModel.findAll({
//                 attributes: [
//                     "user_id",
//                     [Sequelize.fn("COUNT", Sequelize.col("cart_id")), "orderCount"]
//                 ],
//                 where: { created_at: { [Op.between]: [startOfMonth, endOfMonth] } },
//                 group: ["user_id"],
//                 order: [[Sequelize.literal("orderCount"), "DESC"]],
//                 limit: 1,
//             });

//             monthlyData[month] = {
//                 totalCustomers,
//                 newCustomers,
//                 topCustomerOrders: topCustomer.length ? topCustomer[0].dataValues.orderCount : 0,
//             };
//         }

//         res.json({ message: "Dữ liệu khách hàng theo tháng!", monthlyData });
//     } catch (error) {
//         console.error("❌ Lỗi khi lấy dữ liệu khách hàng:", error);
//         res.status(500).json({ message: "Lỗi hệ thống!", error: error.message });
//     }
// });
//#2
app.get("/api/admin/customers", async (req, res) => {
    try {
        const year = req.query.year ? parseInt(req.query.year) : moment().year();
        let monthlyData = {};

        for (let month = 1; month <= 12; month++) {
            const startOfMonth = moment(`${year}-${month}-01`).startOf("month").toDate();
            const endOfMonth = moment(`${year}-${month}-01`).endOf("month").toDate();

            // 🔹 Tổng khách hàng đăng ký trong tháng
            const totalCustomers = await UserModel.count({
                where: {
                    created_at: {
                        [Op.between]: [startOfMonth, endOfMonth],
                    },
                },
            });

            // 🔹 Khách hàng mới (đăng ký trong tháng và thời gian đăng ký cách hiện tại <= 10 ngày)
            const newCustomers = await UserModel.count({
                where: {
                    created_at: {
                        [Op.between]: [startOfMonth, endOfMonth],
                        [Op.gte]: moment().subtract(10, 'days').toDate()
                    },
                },
            });

            // 🔹 Khách hàng có số đơn hàng nhiều nhất trong tháng
            const topCustomer = await CartModel.findAll({
                attributes: [
                    "user_id",
                    [Sequelize.fn("COUNT", Sequelize.col("cart_id")), "orderCount"]
                ],
                where: {
                    created_at: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    },
                },
                group: ["user_id"],
                order: [[Sequelize.literal("orderCount"), "DESC"]],
                limit: 1,
            });

            monthlyData[month] = {
                totalCustomers,
                newCustomers,
                topCustomerOrders: topCustomer.length ? topCustomer[0].dataValues.orderCount : 0,
            };
        }

        res.json({ message: "Dữ liệu khách hàng theo tháng!", monthlyData });
    } catch (error) {
        console.error("❌ Lỗi khi lấy dữ liệu khách hàng:", error);
        res.status(500).json({ message: "Lỗi hệ thống!", error: error.message });
    }
});

//lấy bình luận
app.get("/api/admin/comments", async (req, res) => {
    try {
        const comments = await ReviewModel.findAll({
            include: [
                { model: ProductModel, as: "products" },  // Sửa alias ở đây
                { model: UserModel, as: "review_user" }
            ],
            order: [["created_at", "DESC"]],
        });
        res.json({ message: "Dữ liệu bình luận!", comments });
    } catch (error) {
        console.error("❌ Lỗi khi lấy dữ liệu bình luận:", error);
        res.status(500).json({ message: "Lỗi hệ thống!", error: error.message });
    }
});
//xóa bình luận
app.delete("/api/admin/comments/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const comment = await ReviewModel.destroy({ where: { review_id: id } });
        res.json({ message: "Bình luận đã được xóa!" });
    } catch (error) {
        console.error("❌ Lỗi khi xóa bình luận:", error);
        res.status(500).json({ message: "Lỗi hệ thống!", error: error.message });
    }
});
app.post('/api/voucher/apply', async (req, res) => {
    const { code, order_total } = req.body;
    const voucher = await VouchersModel.findOne({ where: { code } });

    if (!voucher)
        return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại' });

    if (voucher.expires_at && new Date() > new Date(voucher.expires_at))
        return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết hạn' });

    if (voucher.quantity - voucher.used <= 0)
        return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết lượt sử dụng' });

    if (order_total < voucher.min_order_value)
        return res.status(400).json({ success: false, message: `Đơn hàng tối thiểu ${voucher.min_order_value}` });

    let discount = 0;
    if (voucher.discount_type === 'percentage') {
        discount = (order_total * voucher.discount_value) / 100;
        if (voucher.max_discount_value)
            discount = Math.min(discount, voucher.max_discount_value);
    } else {
        discount = voucher.discount_value;
    }

    const final_total = order_total - discount;

    return res.json({
        success: true,
        discount,
        final_total,
        message: 'Áp dụng mã giảm giá thành công'
    });
});
app.get('/api/voucher/list', async (req, res) => {
    try {
        const now = new Date();
        const vouchers = await VouchersModel.findAll({
            where: {
                expires_at: {
                    [Op.or]: [
                        null,
                        { [Op.gt]: now }  // chưa hết hạn
                    ]
                },
                quantity: {
                    [Op.gt]: sequelize.col('used')  // còn lượt dùng
                }
            },
            attributes: ['code', 'discount_value', 'discount_type', 'description']
        });

        const result = vouchers.map(v => ({
            code: v.code,
            discountValue: v.discount_type === 'percentage' ? `${v.discount_value}%` : `${v.discount_value.toLocaleString()} VND`,
            description: v.description || 'Mã khuyến mãi hấp dẫn!'
        }));

        res.json({ success: true, vouchers: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách voucher" });
    }
});













