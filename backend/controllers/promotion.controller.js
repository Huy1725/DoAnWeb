const Promotion = require('../models/promotion.model');

const normalizePromotionCode = (value = '') => String(value).trim().toUpperCase();

const parsePositiveNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
};

// Tao voucher khuyen mai moi (admin).
const createPromotion = async (req, res) => {
  try {
    const { name, code, discountType } = req.body;

    if (!name || !code || !discountType) {
      return res.status(400).json({ message: 'Vui long nhap day du ten, ma va loai voucher' });
    }

    if (!['fixed', 'percent'].includes(discountType)) {
      return res.status(400).json({ message: 'Loai voucher khong hop le' });
    }

    const normalizedCode = normalizePromotionCode(code);
    const discountValue = parsePositiveNumber(req.body.discountValue, null);

    if (!discountValue || discountValue <= 0) {
      return res.status(400).json({ message: 'Gia tri giam phai lon hon 0' });
    }

    if (discountType === 'percent' && discountValue > 100) {
      return res.status(400).json({ message: 'Voucher theo phan tram chi duoc toi da 100%' });
    }

    const maxDiscountAmount =
      discountType === 'percent' ? parsePositiveNumber(req.body.maxDiscountAmount, 0) : 0;
    const minOrderValue = parsePositiveNumber(req.body.minOrderValue, 0);

    if (maxDiscountAmount === null || minOrderValue === null) {
      return res.status(400).json({ message: 'Gia tri max giam hoac don toi thieu khong hop le' });
    }

    const existingPromotion = await Promotion.findOne({ code: normalizedCode });

    if (existingPromotion) {
      return res.status(400).json({ message: 'Ma voucher da ton tai' });
    }

    const promotion = await Promotion.create({
      name: String(name).trim(),
      code: normalizedCode,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderValue,
      active: req.body.active !== undefined ? Boolean(req.body.active) : true,
      createdBy: req.user?._id || null,
    });

    return res.status(201).json(promotion);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create promotion', error: error.message });
  }
};

// Lay danh sach voucher cho admin quan ly.
const getPromotions = async (_req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json(promotions);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch promotions', error: error.message });
  }
};

// Bat/tat voucher.
const updatePromotionStatus = async (req, res) => {
  try {
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({ message: 'Trang thai active phai la boolean' });
    }

    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      { active },
      { new: true }
    );

    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    return res.status(200).json(promotion);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update promotion status', error: error.message });
  }
};

module.exports = {
  createPromotion,
  getPromotions,
  updatePromotionStatus,
};
