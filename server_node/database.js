const { Sequelize, DataTypes } = require('sequelize');
// Tạo đối tượng kết nối đến database
const sequelize = new Sequelize('react', 'root', '', {
  host: 'localhost', dialect: 'mysql'
});

// model mô tả table loai
const categoryModel = sequelize.define('category',
  {
    category_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    parent_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: "category", key: "category_id" } }
  },
  { timestamps: false, tableName: "category" }
);

// model diễn tả cấu trúc 2 table san_pham 
const ProductModel = sequelize.define('product',
  {
    product_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "category", key: "category_id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    },
    name: { type: DataTypes.STRING },
    img: { type: DataTypes.STRING },
    price: { type: DataTypes.INTEGER },
    discount_price: { type: DataTypes.INTEGER },
    description: { type: DataTypes.TEXT },
    stock: { type: DataTypes.INTEGER },
    status: {
      type: DataTypes.ENUM('available', 'out_of_stock'),
      allowNull: false,
      defaultValue: 'available'
    },
    hot: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false // hoặc true tùy yêu cầu
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
    },
  },
  { timestamps: false, tableName: "product" }
);
const ThumbnailModel = sequelize.define('thumbnail',
  {
    thumbnail_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "product", key: "product_id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    },
    img1: { type: DataTypes.STRING },
    img2: { type: DataTypes.STRING },
    img3: { type: DataTypes.STRING },
    img4: { type: DataTypes.STRING }


  },
  { timestamps: false, tableName: "thumbnail" }

)
const CartModel = sequelize.define('cart',
  {
    cart_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "user", key: "user_id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    },
    // total_price: { type: DataTypes.INTEGER },
    ghi_chu: { type: DataTypes.STRING },
    ma_dh: { type: DataTypes.STRING },
    payment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Tương ứng với 0
    },
    voucher:{type:DataTypes.STRING},
    address:{type:DataTypes.STRING},
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
    },
  },
  { timestamps: false, tableName: "cart" }
);
const CartItemModel = sequelize.define('cart_items',
  {
    item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "cart", key: "cart_id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "product", key: "product_id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    },
    quantity: { type: DataTypes.INTEGER },
    price: { type: DataTypes.INTEGER },
    size: { type: DataTypes.STRING },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Tương ứng với 0
    },
    status_way: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Tương ứng với 0
    },
    

    added_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
    }

  },
  { timestamps: false, tableName: "cart_items" }
)
const UserModel = sequelize.define('users',
  {
    user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    phone: { type: DataTypes.INTEGER },
    avatar:{type: DataTypes.STRING},
    role: {
      type: DataTypes.ENUM('customer', 'admin'),
      allowNull: false,
      defaultValue: 'customer'
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Tương ứng với 0
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
    },
  },
  { timestamps: false, tableName: "users" }
);
const BlogModel = sequelize.define('blog',
  {
    blog_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
    content: { type: DataTypes.STRING },
    image: { type: DataTypes.STRING },
    view: { type: DataTypes.INTEGER },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
    },
  },
  { timestamps: false, tableName: "blog" }
);
const FoodDetailrModel = sequelize.define('food_detail',
  {
    food_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "product", key: "product_id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    },
    ingredients: { type: DataTypes.TEXT },
    calories: { type: DataTypes.INTEGER },
    cooking_time: { type: DataTypes.INTEGER },
    instructions: { type: DataTypes.TEXT },
  },
  { timestamps: false, tableName: "food_detail" }
);
const ReviewModel = sequelize.define('review',
  {
    review_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "user_id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "product", key: "product_id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    },
    rating: { type: DataTypes.INTEGER },
    comment: { type: DataTypes.TEXT },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      onUpdate: sequelize.literal('CURRENT_TIMESTAMP')
    },
  },
  { timestamps: false, tableName: "review" }

)
const AddressModel = sequelize.define('address',
  {
    address_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "user_id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    },
    address: { type: DataTypes.STRING },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Tương ứng với 0
    }
  },
  { timestamps: false, tableName: "address" }
)
const VouchersModel = sequelize.define('vouchers', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  discount_type: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false,
  },
  discount_value: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  max_discount_value: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  min_order_value: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  used: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'vouchers',
  timestamps: false, // Nếu bạn không dùng Sequelize tự động timestamps
  underscored: true, // Để dùng kiểu snake_case cho field
});
// models/product.js
ProductModel.belongsTo(categoryModel, { foreignKey: 'category_id' });

// models/category.js
categoryModel.hasMany(ProductModel, { foreignKey: 'category_id' });


ProductModel.hasOne(FoodDetailrModel, { foreignKey: "product_id", onDelete: "CASCADE" });
FoodDetailrModel.belongsTo(ProductModel, { foreignKey: "product_id" });
ProductModel.hasOne(ThumbnailModel, { foreignKey: "product_id", onDelete: "CASCADE" });
ThumbnailModel.belongsTo(ProductModel, { foreignKey: "product_id" });

UserModel.hasMany(CartModel, { foreignKey: "user_id", onDelete: "CASCADE" });
CartModel.belongsTo(UserModel, { foreignKey: "user_id", as: "user" });

CartModel.hasMany(CartItemModel, { foreignKey: "cart_id", as: "cartitem" });
CartItemModel.belongsTo(CartModel, { foreignKey: "cart_id", as: "cart" });
CartItemModel.belongsTo(ProductModel, { foreignKey: "product_id", as: "product" });

UserModel.hasMany(AddressModel, { foreignKey: "user_id" });
AddressModel.belongsTo(UserModel, { foreignKey: "user_id", as: "address_user" });

UserModel.hasMany(ReviewModel, { foreignKey: "user_id" });
ReviewModel.belongsTo(UserModel, { foreignKey: "user_id", as: "review_user" });

ProductModel.hasMany(ReviewModel, { foreignKey: "product_id", as: "products" });
ReviewModel.belongsTo(ProductModel, { foreignKey: "product_id", as: "products" });


ProductModel.hasMany(CartItemModel, {
  foreignKey: 'product_id',  // Khóa ngoại trong cart_items
  as: 'cartItems',           // Đặt tên alias cho mối quan hệ
});
CartItemModel.belongsTo(ProductModel, {
  foreignKey: 'product_id',   // Khóa ngoại trong cart_items
  as: 'products',              // Đặt tên alias cho mối quan hệ
});

module.exports = { ProductModel, categoryModel, UserModel, FoodDetailrModel, ThumbnailModel, CartModel, CartItemModel, AddressModel, ReviewModel, BlogModel, sequelize, VouchersModel }

