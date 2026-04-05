const Product = require('../models/product.model');
const Category = require('../models/category.model');

// Parse JSON nếu dữ liệu gửi lên là string, fallback khi parse lỗi.
const parseJsonIfString = (value, fallback) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (_error) {
      return fallback;
    }
  }

  return value;
};

// Chuẩn hóa số lượng tồn kho, trả về null nếu không hợp lệ.
const parseStockValue = (value, fallbackValue = 20) => {
  if (value === undefined || value === null || value === '') {
    return fallbackValue;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return null;
  }

  return Math.floor(parsedValue);
};

// Lấy danh sách sản phẩm theo bộ lọc từ khóa và danh mục.
const getProducts = async (req, res) => {
  try {
    const { keyword, category } = req.query;

    const filter = {};

    if (keyword) {
      filter.name = {
        $regex: keyword,
        $options: 'i',
      };
    }

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter).populate('category', 'name').sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};

// Lấy chi tiết sản phẩm theo id.
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
};

// Tạo sản phẩm mới, hỗ trợ upload ảnh và dữ liệu biến thể/thông số.
const createProduct = async (req, res) => {
  try {
    const firstCategory = await Category.findOne().sort({ createdAt: 1 });

    if (!firstCategory) {
      return res
        .status(400)
        .json({ message: 'Vui lòng tạo ít nhất 1 danh mục trước khi thêm sản phẩm' });
    }

    const {
      name,
      price,
      originalPrice,
      discountBadge,
      rating,
      promoText,
      productInfo,
      specifications,
      variants,
      category,
      stock,
    } = req.body;

    const parsedStock = parseStockValue(stock, 20);

    if (parsedStock === null) {
      return res.status(400).json({ message: 'Số lượng tồn kho không hợp lệ' });
    }

    const parsedVariants = parseJsonIfString(variants, []);
    const parsedSpecifications = parseJsonIfString(specifications, []);

    const selectedCategory = category || firstCategory._id;
    const createPayload = {
      name: name || 'Sample name',
      price: price || '0đ',
      originalPrice: originalPrice || '0đ',
      discountBadge: discountBadge || 'Giảm 0%',
      rating: rating !== undefined ? Number(rating) : 0,
      promoText: promoText || 'Sample promo text',
      productInfo: productInfo || '',
      specifications: Array.isArray(parsedSpecifications) ? parsedSpecifications : [],
      variants: Array.isArray(parsedVariants) ? parsedVariants : [],
      category: selectedCategory,
      stock: parsedStock,
    };

    if (createPayload.variants.length > 0 && !name) {
      createPayload.name = 'Sản phẩm mới';
    }

    const product = await Product.create(createPayload);

    if (req.file) {
      product.imageData = req.file.buffer;
      product.imageContentType = req.file.mimetype;
      await product.save();
    }

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

// Trả ảnh sản phẩm theo id, fallback về placeholder nếu chưa có ảnh.
const getProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product?.imageData) {
      res.set('Content-Type', product.imageContentType);
      return res.send(product.imageData);
    }

    return res.redirect('https://placehold.co/300x300?text=Product');
  } catch (error) {
    return res.redirect('https://placehold.co/300x300?text=Product');
  }
};

// Cập nhật thông tin sản phẩm theo id, bao gồm ảnh và biến thể.
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = req.body.name ?? product.name;
    product.price = req.body.price ?? product.price;
    product.originalPrice = req.body.originalPrice ?? product.originalPrice;
    product.discountBadge = req.body.discountBadge ?? product.discountBadge;
    product.rating = req.body.rating !== undefined ? Number(req.body.rating) : product.rating;
    product.promoText = req.body.promoText ?? product.promoText;
    product.productInfo = req.body.productInfo ?? product.productInfo;
    product.category = req.body.category ?? product.category;

    if (req.body.stock !== undefined) {
      const parsedStock = parseStockValue(req.body.stock, product.stock);

      if (parsedStock === null) {
        return res.status(400).json({ message: 'Số lượng tồn kho không hợp lệ' });
      }

      product.stock = parsedStock;
    }

    const parsedSpecifications = parseJsonIfString(req.body.specifications, undefined);
    if (Array.isArray(parsedSpecifications)) {
      product.specifications = parsedSpecifications;
    }

    const parsedVariants = parseJsonIfString(req.body.variants, undefined);
    if (Array.isArray(parsedVariants)) {
      product.variants = parsedVariants;
    }

    if (req.file) {
      product.imageData = req.file.buffer;
      product.imageContentType = req.file.mimetype;
    }

    const updatedProduct = await product.save();

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(updatedProduct);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

// Xóa sản phẩm theo id.
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete product',
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  getProductImage,
  updateProduct,
  deleteProduct,
};
