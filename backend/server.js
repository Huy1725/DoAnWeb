require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const userRoutes = require('./routes/user.routes');
const bannerRoutes = require('./routes/banner.routes');
const promotionRoutes = require('./routes/promotion.routes');
const Category = require('./models/category.model');
const Product = require('./models/product.model');
const User = require('./models/user.model');
const Order = require('./models/order.model');
const { resolveMembershipTierBySpent } = require('./services/membership.service');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/promotions', promotionRoutes);

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

    const stockMigrationResult = await Product.updateMany(
      {
        $or: [{ stock: { $exists: false } }, { stock: null }],
      },
      {
        $set: { stock: 20 },
      }
    );

    if (stockMigrationResult.modifiedCount > 0) {
      console.log(`Updated ${stockMigrationResult.modifiedCount} legacy products with default stock`);
    }

    const usersWithoutTier = await User.find({
      $or: [{ membershipTier: { $exists: false } }, { membershipTier: null }],
    })
      .select('_id')
      .lean();

    if (usersWithoutTier.length > 0) {
      const userIds = usersWithoutTier.map((user) => user._id);
      const totalSpentByUsers = await Order.aggregate([
        {
          $match: {
            user: { $in: userIds },
            status: { $ne: 'Cancelled' },
          },
        },
        {
          $group: {
            _id: '$user',
            totalSpent: { $sum: '$totalPrice' },
          },
        },
      ]);

      const spentMap = new Map(
        totalSpentByUsers.map((item) => [String(item._id), Number(item.totalSpent || 0)])
      );

      const bulkUpdateOperations = usersWithoutTier.map((user) => {
        const totalSpent = spentMap.get(String(user._id)) || 0;
        const membershipTier = resolveMembershipTierBySpent(totalSpent).code;

        return {
          updateOne: {
            filter: { _id: user._id },
            update: { $set: { membershipTier } },
          },
        };
      });

      if (bulkUpdateOperations.length > 0) {
        await User.bulkWrite(bulkUpdateOperations);
        console.log(`Initialized membership tier for ${bulkUpdateOperations.length} users`);
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
