import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/url';

const ChevronRight = () => (
  <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const ItemIcon = () => (
  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-500">
    •
  </span>
);

const menuItems = ['Điện thoại', 'Laptop', 'Tablet'];

const defaultBannerImages = {
  main: 'https://placehold.co/1200x560/d70018/ffffff?text=CELLPHONES+MEGA+SALE',
  side1: 'https://placehold.co/600x180/111827/ffffff?text=iPhone+17+Series',
  side2: 'https://placehold.co/600x180/0f766e/ffffff?text=MacBook+Air+M5',
  side3: 'https://placehold.co/600x180/1d4ed8/ffffff?text=Accessory+Deals',
};

// Chuẩn hóa text để map tên danh mục có/không dấu.
const normalizeText = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();

  // Hero section gồm menu danh mục + main banner + 3 side banners.
const HeroSection = () => {
  const [categories, setCategories] = useState([]);
  const [bannerImages, setBannerImages] = useState(defaultBannerImages);

  useEffect(() => {
    // Tải cấu hình banner động từ backend để hiển thị đúng ảnh đã upload.
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/banners');

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          return;
        }

        const nextBannerImages = { ...defaultBannerImages };

        data.forEach((banner) => {
          if (!banner?.position || !banner?.imageUrl || !nextBannerImages[banner.position]) {
            return;
          }

          nextBannerImages[banner.position] = banner.imageUrl.startsWith('/api/')
            ? `${API_BASE_URL}${banner.imageUrl}`
            : banner.imageUrl;
        });

        setBannerImages(nextBannerImages);
      } catch (_error) {
        setBannerImages(defaultBannerImages);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    // Tải danh mục để tạo link nhanh ở cột trái.
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setCategories(data);
      } catch (_error) {
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Tạo map tên danh mục -> id để render link từ menuItems tĩnh.
  const categoryLinkMap = useMemo(() => {
    const map = {};

    for (const category of categories) {
      map[normalizeText(category.name)] = category._id;
    }

    return map;
  }, [categories]);

  const sideBanners = [bannerImages.side1, bannerImages.side2, bannerImages.side3];

  return (
    <section className="grid grid-cols-12 gap-4 max-w-7xl mx-auto mt-4">
      <aside className="col-span-12 md:col-span-3 lg:col-span-2 rounded-lg bg-white shadow-sm p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item}>
              {categoryLinkMap[normalizeText(item)] ? (
                <Link
                  to={`/category/${categoryLinkMap[normalizeText(item)]}`}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-[#d70018]"
                >
                  <span className="flex items-center gap-2">
                    <ItemIcon />
                    {item}
                  </span>
                  <ChevronRight />
                </Link>
              ) : (
                <div className="flex w-full cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-sm text-gray-400">
                  <span className="flex items-center gap-2">
                    <ItemIcon />
                    {item}
                  </span>
                  <ChevronRight />
                </div>
              )}
            </li>
          ))}
        </ul>
      </aside>

      <div className="col-span-12 md:col-span-6 lg:col-span-7">
        <img
          src={bannerImages.main}
          alt="Main banner"
          className="h-full w-full rounded-lg object-cover object-center"
        />
      </div>

      <div className="col-span-12 md:col-span-3 lg:col-span-3 space-y-4">
        {sideBanners.map((banner, index) => (
          <img
            key={`${banner}-${index}`}
            src={banner}
            alt={`Side banner ${index + 1}`}
            className="w-full rounded-lg object-cover"
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
