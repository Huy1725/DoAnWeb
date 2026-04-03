const Banner = require('../models/banner.model');

const BANNER_SLOTS = [
  {
    position: 'main1',
    label: 'Banner chính 1',
    fallbackImageUrl: 'https://placehold.co/1200x560/111827/ffffff?text=Main+Banner+1',
  },
  {
    position: 'main2',
    label: 'Banner chính 2',
    fallbackImageUrl: 'https://placehold.co/1200x560/1f2937/ffffff?text=Main+Banner+2',
  },
  {
    position: 'main3',
    label: 'Banner chính 3',
    fallbackImageUrl: 'https://placehold.co/1200x560/374151/ffffff?text=Main+Banner+3',
  },
  {
    position: 'side1',
    label: 'Banner phụ 1',
    fallbackImageUrl: 'https://placehold.co/600x180/111827/ffffff?text=iPhone+17+Series',
  },
  {
    position: 'side2',
    label: 'Banner phụ 2',
    fallbackImageUrl: 'https://placehold.co/600x180/0f766e/ffffff?text=MacBook+Air+M5',
  },
  {
    position: 'side3',
    label: 'Banner phụ 3',
    fallbackImageUrl: 'https://placehold.co/600x180/1d4ed8/ffffff?text=Accessory+Deals',
  },
];

const bannerSlotsMap = BANNER_SLOTS.reduce((accumulator, slot) => {
  accumulator[slot.position] = slot;
  return accumulator;
}, {});

// Trả danh sách banner cho trang chủ, có fallback nếu chưa upload ảnh.
const getBanners = async (_req, res) => {
  try {
    const banners = await Banner.find({}).select('position imageData updatedAt').lean();
    const bannerMap = banners.reduce((accumulator, banner) => {
      accumulator[banner.position] = banner;
      return accumulator;
    }, {});

    const response = BANNER_SLOTS.map((slot) => {
      const currentBanner = bannerMap[slot.position];
      const hasCustomImage = Boolean(currentBanner?.imageData);

      return {
        position: slot.position,
        label: slot.label,
        hasCustomImage,
        imageUrl: hasCustomImage ? `/api/banners/${slot.position}/image` : slot.fallbackImageUrl,
        updatedAt: currentBanner?.updatedAt || null,
      };
    });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch banners',
      error: error.message,
    });
  }
};

// Trả ảnh theo vị trí banner, fallback về ảnh mặc định nếu chưa có.
const getBannerImage = async (req, res) => {
  try {
    const { position } = req.params;
    const slot = bannerSlotsMap[position];

    if (!slot) {
      return res.status(404).json({ message: 'Banner position not found' });
    }

    const banner = await Banner.findOne({ position });

    if (banner?.imageData) {
      res.set('Content-Type', banner.imageContentType || 'image/png');
      return res.send(banner.imageData);
    }

    return res.redirect(slot.fallbackImageUrl);
  } catch (_error) {
    const slot = bannerSlotsMap[req.params.position];

    if (slot) {
      return res.redirect(slot.fallbackImageUrl);
    }

    return res.status(500).json({ message: 'Failed to fetch banner image' });
  }
};

// Upload mới hoặc thay thế ảnh banner theo từng vị trí (admin).
const upsertBanner = async (req, res) => {
  try {
    const { position } = req.params;
    const slot = bannerSlotsMap[position];

    if (!slot) {
      return res.status(400).json({ message: 'Invalid banner position' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn ảnh banner để tải lên' });
    }

    let banner = await Banner.findOne({ position });

    if (!banner) {
      banner = new Banner({ position });
    }

    banner.imageData = req.file.buffer;
    banner.imageContentType = req.file.mimetype;

    const savedBanner = await banner.save();

    return res.status(200).json({
      position: savedBanner.position,
      label: slot.label,
      hasCustomImage: true,
      imageUrl: `/api/banners/${savedBanner.position}/image`,
      updatedAt: savedBanner.updatedAt,
      message: 'Cập nhật banner thành công',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update banner',
      error: error.message,
    });
  }
};

module.exports = {
  getBanners,
  getBannerImage,
  upsertBanner,
};
