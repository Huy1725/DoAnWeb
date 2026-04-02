require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const Product = require('./models/product.model');
const User = require('./models/user.model');

const mockProducts = [
  {
    name: 'iPhone 15 Pro Max 256GB',
    price: '28.990.000đ',
    originalPrice: '34.990.000đ',
    discountBadge: 'Giảm 17%',
    image: 'https://placehold.co/300x300?text=iPhone+15+Pro+Max',
    rating: 5,
    promoText: 'Thu cũ lên đời trợ giá 1 triệu',
  },
  {
    name: 'Samsung Galaxy S24 Ultra 12GB/256GB',
    price: '26.490.000đ',
    originalPrice: '31.990.000đ',
    discountBadge: 'Giảm 18%',
    image: 'https://placehold.co/300x300?text=Galaxy+S24+Ultra',
    rating: 5,
    promoText: 'Tặng gói bảo hành mở rộng 12 tháng',
  },
  {
    name: 'Xiaomi 14 12GB/512GB',
    price: '19.990.000đ',
    originalPrice: '22.990.000đ',
    discountBadge: 'Giảm 13%',
    image: 'https://placehold.co/300x300?text=Xiaomi+14',
    rating: 4,
    promoText: 'Ưu đãi trả góp 0% qua thẻ tín dụng',
  },
  {
    name: 'OPPO Reno11 Pro 5G',
    price: '13.490.000đ',
    originalPrice: '15.990.000đ',
    discountBadge: 'Giảm 16%',
    image: 'https://placehold.co/300x300?text=OPPO+Reno11+Pro',
    rating: 4,
    promoText: 'Thu cũ trợ giá đến 1 triệu đồng',
  },
  {
    name: 'vivo V30 5G 12GB/256GB',
    price: '10.990.000đ',
    originalPrice: '12.990.000đ',
    discountBadge: 'Giảm 15%',
    image: 'https://placehold.co/300x300?text=vivo+V30',
    rating: 4,
    promoText: 'Giảm thêm 500.000đ khi thanh toán ví',
  },
  {
    name: 'MacBook Air M3 13 inch 16GB/512GB',
    price: '33.990.000đ',
    originalPrice: '37.990.000đ',
    discountBadge: 'Giảm 11%',
    image: 'https://placehold.co/300x300?text=MacBook+Air+M3',
    rating: 5,
    promoText: 'Tặng hub mở rộng USB-C cao cấp',
  },
  {
    name: 'ASUS Vivobook 15 OLED i5 16GB',
    price: '17.490.000đ',
    originalPrice: '20.490.000đ',
    discountBadge: 'Giảm 15%',
    image: 'https://placehold.co/300x300?text=ASUS+Vivobook+15',
    rating: 4,
    promoText: 'Tặng balo + chuột không dây',
  },
  {
    name: 'Dell Inspiron 14 i7 16GB 512GB SSD',
    price: '21.990.000đ',
    originalPrice: '24.990.000đ',
    discountBadge: 'Giảm 12%',
    image: 'https://placehold.co/300x300?text=Dell+Inspiron+14',
    rating: 4,
    promoText: 'Giảm thêm 1 triệu cho HSSV',
  },
  {
    name: 'Acer Nitro V 15 RTX 4050',
    price: '24.490.000đ',
    originalPrice: '27.990.000đ',
    discountBadge: 'Giảm 13%',
    image: 'https://placehold.co/300x300?text=Acer+Nitro+V+15',
    rating: 5,
    promoText: 'Tặng chuột gaming + lót chuột',
  },
  {
    name: 'Lenovo IdeaPad Slim 5 Ryzen 7',
    price: '18.990.000đ',
    originalPrice: '21.990.000đ',
    discountBadge: 'Giảm 14%',
    image: 'https://placehold.co/300x300?text=Lenovo+IdeaPad+Slim+5',
    rating: 4,
    promoText: 'Thu cũ đổi mới trợ giá đến 1 triệu',
  },
];

// Reset dữ liệu mẫu và tạo tài khoản admin mặc định.
const importData = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('Missing MONGODB_URI in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const hashedPassword = await bcrypt.hash('123456', 10);
    const adminUser = [
      {
        name: 'Admin CellphoneS',
        email: 'admin@cellphones.com',
        password: hashedPassword,
        isAdmin: true,
      },
    ];

    await User.deleteMany();
    await Product.deleteMany();
    await User.insertMany(adminUser);
    await Product.insertMany(mockProducts);

    console.log('Admin User & Data Imported!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importData();
