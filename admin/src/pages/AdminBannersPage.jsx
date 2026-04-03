import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config/url';

const bannerSlots = [
  { position: 'main1', label: 'Banner chính 1', recommendedSize: '1200 x 560' },
  { position: 'main2', label: 'Banner chính 2', recommendedSize: '1200 x 560' },
  { position: 'main3', label: 'Banner chính 3', recommendedSize: '1200 x 560' },
  { position: 'side1', label: 'Banner phụ 1', recommendedSize: '600 x 180' },
  { position: 'side2', label: 'Banner phụ 2', recommendedSize: '600 x 180' },
  { position: 'side3', label: 'Banner phụ 3', recommendedSize: '600 x 180' },
];

const defaultBannerImages = {
  main1: 'https://placehold.co/1200x560/111827/ffffff?text=Main+Banner+1',
  main2: 'https://placehold.co/1200x560/1f2937/ffffff?text=Main+Banner+2',
  main3: 'https://placehold.co/1200x560/374151/ffffff?text=Main+Banner+3',
  side1: 'https://placehold.co/600x180/111827/ffffff?text=iPhone+17+Series',
  side2: 'https://placehold.co/600x180/0f766e/ffffff?text=MacBook+Air+M5',
  side3: 'https://placehold.co/600x180/1d4ed8/ffffff?text=Accessory+Deals',
};

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return '';
  }

  return imageUrl.startsWith('/api/') ? `${API_BASE_URL}${imageUrl}` : imageUrl;
};

// Trang quản trị banner: upload hoặc thay thế ảnh banner trang chủ.
const AdminBannersPage = () => {
  const { userInfo } = useContext(AuthContext);
  const [banners, setBanners] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingPosition, setUploadingPosition] = useState('');

  // Tải danh sách banner hiện tại để hiển thị và preview.
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/banners');

      if (!response.ok) {
        throw new Error('Không thể tải danh sách banner');
      }

      const data = await response.json();
      const normalizedData = Array.isArray(data) ? data : [];

      const mappedBanners = bannerSlots.map((slot) => {
        const currentBanner = normalizedData.find((item) => item.position === slot.position);

        return {
          position: slot.position,
          label: slot.label,
          recommendedSize: slot.recommendedSize,
          hasCustomImage: Boolean(currentBanner?.hasCustomImage),
          updatedAt: currentBanner?.updatedAt || null,
          imageUrl:
            resolveImageUrl(currentBanner?.imageUrl) || defaultBannerImages[slot.position],
        };
      });

      setBanners(mappedBanners);
      setError(null);
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tải banner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Lưu file người dùng chọn cho từng ô banner.
  const handleFileChange = (position, file) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [position]: file || null,
    }));
  };

  // Upload hoặc ghi đè ảnh banner theo vị trí.
  const handleUpload = async (position) => {
    const selectedFile = selectedFiles[position];

    if (!selectedFile) {
      alert('Vui lòng chọn ảnh trước khi tải lên');
      return;
    }

    if (!userInfo?.token) {
      setError('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại');
      return;
    }

    try {
      setUploadingPosition(position);

      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch(`/api/banners/${position}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Không thể cập nhật banner');
      }

      setSelectedFiles((prev) => ({
        ...prev,
        [position]: null,
      }));

      await fetchBanners();
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi cập nhật banner');
    } finally {
      setUploadingPosition('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Banner Trang Chủ</h1>
        <p className="mt-1 text-sm text-gray-600">
          Bạn có thể thêm mới hoặc thay thế 3 ảnh banner chính và 3 banner phụ.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">Đang tải dữ liệu...</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {banners.map((banner) => {
            const isUploading = uploadingPosition === banner.position;
            const selectedFile = selectedFiles[banner.position];

            return (
              <section key={banner.position} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{banner.label}</h2>
                    <p className="text-xs text-gray-500">Kích thước gợi ý: {banner.recommendedSize}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      banner.hasCustomImage
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {banner.hasCustomImage ? 'Đã upload' : 'Đang dùng mặc định'}
                  </span>
                </div>

                <img
                  src={banner.imageUrl}
                  alt={banner.label}
                  className="mb-3 h-44 w-full rounded-lg border border-gray-100 object-cover"
                />

                <p className="mb-3 text-xs text-gray-500">
                  Cập nhật gần nhất:{' '}
                  {banner.updatedAt ? new Date(banner.updatedAt).toLocaleString('vi-VN') : 'Chưa có'}
                </p>

                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleFileChange(banner.position, event.target.files?.[0])}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />

                  {selectedFile ? (
                    <p className="text-xs text-gray-600">Đã chọn: {selectedFile.name}</p>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => handleUpload(banner.position)}
                    disabled={isUploading || !selectedFile}
                    className="w-full rounded-lg bg-[#d70018] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploading ? 'Đang tải lên...' : 'Lưu banner'}
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminBannersPage;
