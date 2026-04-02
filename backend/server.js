require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const userRoutes = require('./routes/user.routes');
const Category = require('./models/category.model');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/doanweb';

// Khởi tạo kết nối MongoDB và bật Express server.
const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    try {
      // Dọn index cũ nếu còn tồn tại để tránh lỗi unique khi migrate schema.
      await Category.collection.dropIndex('slug_1');
      console.log('Removed legacy categories slug_1 index');
    } catch (indexError) {
      if (indexError.codeName !== 'IndexNotFound') {
        console.warn('Could not remove legacy slug_1 index:', indexError.message);
      }
    }

    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

startServer();
