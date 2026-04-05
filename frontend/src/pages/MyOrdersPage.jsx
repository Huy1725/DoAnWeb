import { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config/url';

// Format số tiền theo chuẩn hiển thị VND.
const formatCurrency = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')}đ`;

// Format ngày tạo đơn hàng.
const formatDate = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleDateString('vi-VN');
};

const formatDateTime = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleString('vi-VN');
};

const defaultAvatarUrl = 'https://placehold.co/160x160/e5e7eb/6b7280?text=Avatar';

const membershipTiers = [
  {
    code: 'S-NULL',
    min: 0,
    max: 3000000,
    cardClass: 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800',
    condition:
      'Tổng số tiền mua hàng tích lũy trong năm nay và năm liền trước đạt từ 0 đến 3 triệu đồng, không tính đơn hàng doanh nghiệp B2B.',
    perks: ['Hiện chưa có ưu đãi mua hàng đặc biệt cho hạng thành viên S-NULL.'],
  },
  {
    code: 'S-NEW',
    min: 3000000,
    max: 15000000,
    cardClass: 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-900',
    condition:
      'Tổng số tiền mua hàng tích lũy trong năm nay và năm liền trước đạt từ 3 đến 15 triệu đồng, không tính đơn hàng doanh nghiệp B2B.',
    perks: [
      'Tặng voucher 50K khi lên hạng (từ S-NULL lên S-NEW).',
      'Giảm thêm 0.5% với nhiều nhóm phụ kiện/laptop/phụ kiện công nghệ.',
      'Giảm thêm 2% cho phụ kiện phổ thông như sim thẻ, sạc dự phòng, cáp.',
      'Giảm thêm 5% (tối đa 100.000đ) cho dịch vụ sửa chữa tại Điện Thoại Vui.',
      'Giảm thêm 5% (tối đa 200.000đ) khi tham gia chương trình thu cũ lên đời.',
    ],
  },
  {
    code: 'S-MEM',
    min: 15000000,
    max: 50000000,
    cardClass: 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-900',
    condition:
      'Tổng số tiền mua hàng tích lũy trong năm nay và năm liền trước đạt từ 15 đến 50 triệu đồng, không tính đơn hàng doanh nghiệp B2B.',
    perks: [
      'Nhận voucher 10% tối đa 150K tặng người thân (áp dụng theo điều kiện chương trình).',
      'Ưu đãi thu cũ lên đến 300K cho sản phẩm mua tại CellphoneS.',
      'Miễn phí giao hàng cho mọi đơn.',
      'Tặng voucher 100K khi lên hạng (từ S-NEW lên S-MEM).',
      'Giảm thêm 0.5% với nhóm sản phẩm máy và thiết bị công nghệ.',
    ],
  },
  {
    code: 'S-VIP',
    min: 50000000,
    max: Infinity,
    cardClass: 'bg-gradient-to-br from-gray-800 to-black text-white',
    condition:
      'Tổng số tiền mua hàng tích lũy trong năm nay và năm liền trước đạt từ 50 triệu đồng trở lên, không tính đơn hàng doanh nghiệp B2B.',
    perks: [
      'Nhận voucher 10% tối đa 150K tặng người thân (áp dụng theo điều kiện chương trình).',
      'Ưu đãi thu cũ lên đến 500K cho sản phẩm mua tại CellphoneS.',
      'Miễn phí giao hàng cho mọi đơn hàng.',
      'Tặng voucher 300K khi lên hạng (từ S-MEM lên S-VIP).',
      'Giảm thêm 1% với nhóm sản phẩm máy và thiết bị công nghệ.',
    ],
  },
];

const resolveApiUrl = (value) => {
  if (!value) {
    return '';
  }

  return value.startsWith('/api/') ? `${API_BASE_URL}${value}` : value;
};

const getTierIndexByTotalSpent = (totalSpent) => {
  const spent = Number(totalSpent || 0);
  const foundIndex = membershipTiers.findIndex((tier) => spent >= tier.min && spent < tier.max);
  return foundIndex >= 0 ? foundIndex : membershipTiers.length - 1;
};

const getTierIndexByCode = (tierCode) => {
  const foundIndex = membershipTiers.findIndex((tier) => tier.code === tierCode);
  return foundIndex >= 0 ? foundIndex : 0;
};

const formatVoucherValue = (voucher) => {
  if (!voucher) {
    return '--';
  }

  if (voucher.discountType === 'fixed') {
    return `Giam ${formatCurrency(voucher.discountValue || 0)}`;
  }

  return `Giam ${voucher.discountValue || 0}% (toi da ${formatCurrency(
    voucher.maxDiscountAmount || 0
  )})`;
};

const getOrderItemImage = (item) => {
  const productId = typeof item.product === 'object' ? item.product?._id : item.product;

  if (!productId) {
    return 'https://placehold.co/80x80/e5e7eb/6b7280?text=Product';
  }

  return `${API_BASE_URL}/api/products/${productId}/image`;
};

// Trang hồ sơ người dùng: thông tin cá nhân, hạng thành viên và lịch sử mua hàng.
const MyOrdersPage = () => {
  const { userInfo } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTierIndex, setActiveTierIndex] = useState(0);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);

  const totalOrders = Number(profile?.stats?.totalOrders || 0);
  const totalSpent = Number(profile?.stats?.totalSpent || 0);
  const currentTierIndex = useMemo(() => {
    const tierCode = profile?.user?.membershipTier;

    if (tierCode) {
      return getTierIndexByCode(tierCode);
    }

    return getTierIndexByTotalSpent(totalSpent);
  }, [profile?.user?.membershipTier, totalSpent]);
  const activeTier = membershipTiers[activeTierIndex] || membershipTiers[0];
  const orders = Array.isArray(profile?.orders) ? profile.orders : [];
  const vouchers = Array.isArray(profile?.vouchers) ? profile.vouchers : [];
  const notifications = Array.isArray(profile?.notifications) ? profile.notifications : [];
  const unreadNotificationCount = Number(profile?.unreadNotificationCount || 0);

  const visibleTierIndexes = useMemo(() => {
    const total = membershipTiers.length;

    if (total <= 3) {
      return Array.from({ length: total }, (_, index) => index);
    }

    const prevIndex = (activeTierIndex - 1 + total) % total;
    const nextIndex = (activeTierIndex + 1) % total;

    return [prevIndex, activeTierIndex, nextIndex];
  }, [activeTierIndex]);

  const avatarImageUrl = useMemo(() => {
    const avatarUrl = resolveApiUrl(profile?.user?.avatarUrl);
    return avatarUrl || defaultAvatarUrl;
  }, [profile?.user?.avatarUrl]);

  const applyProfileState = (data) => {
    setProfile(data);
    const tierIndex = data?.user?.membershipTier
      ? getTierIndexByCode(data.user.membershipTier)
      : getTierIndexByTotalSpent(data?.stats?.totalSpent || 0);
    setActiveTierIndex(tierIndex);
  };

  const fetchMyProfileFallback = async () => {
    const ordersResponse = await fetch('/api/orders/myorders', {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    });

    if (!ordersResponse.ok) {
      throw new Error('Không thể tải hồ sơ người dùng');
    }

    const ordersData = await ordersResponse.json();
    const normalizedOrders = Array.isArray(ordersData) ? ordersData : [];
    const totalSpentValue = normalizedOrders.reduce(
      (sum, order) => sum + Number(order?.totalPrice || 0),
      0
    );
    const fallbackTierCode =
      membershipTiers[getTierIndexByTotalSpent(totalSpentValue)]?.code || membershipTiers[0].code;

    applyProfileState({
      user: {
        _id: userInfo._id,
        name: userInfo.name,
        email: userInfo.email,
        isAdmin: userInfo.isAdmin,
        membershipTier: fallbackTierCode,
        avatarUrl: userInfo.avatarUrl || null,
        createdAt: userInfo.createdAt || null,
      },
      stats: {
        totalOrders: normalizedOrders.length,
        totalSpent: totalSpentValue,
      },
      orders: normalizedOrders,
      vouchers: [],
      notifications: [],
      unreadNotificationCount: 0,
    });
  };

  const fetchMyProfile = async () => {
    const response = await fetch('/api/users/me/profile', {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    });

    if (!response.ok) {
      return fetchMyProfileFallback();
    }

    const data = await response.json();
    applyProfileState(data);
  };

  useEffect(() => {
    // Tải hồ sơ + lịch sử mua hàng của user hiện tại.
    const loadProfile = async () => {
      try {
        await fetchMyProfile();
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi khi tải hồ sơ');
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.token) {
      loadProfile();
    } else {
      setLoading(false);
      setError('Bạn cần đăng nhập để xem hồ sơ người dùng.');
    }
  }, [userInfo]);

  // Upload hoặc thay đổi avatar.
  const handleUploadAvatar = async () => {
    if (!selectedAvatarFile) {
      alert('Vui lòng chọn ảnh avatar trước khi lưu');
      return;
    }

    try {
      setIsUploadingAvatar(true);

      const formData = new FormData();
      formData.append('avatar', selectedAvatarFile);

      const response = await fetch('/api/users/me/avatar', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Không thể cập nhật avatar');
      }

      setSelectedAvatarFile(null);
      setIsAvatarEditorOpen(false);
      await fetchMyProfile();
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi cập nhật avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePrevTier = () => {
    setActiveTierIndex((prev) => (prev === 0 ? membershipTiers.length - 1 : prev - 1));
  };

  const handleNextTier = () => {
    setActiveTierIndex((prev) => (prev + 1) % membershipTiers.length);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Hồ sơ người dùng</h1>

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      ) : (
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-12">
            <div className="md:col-span-12">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setIsAvatarEditorOpen((prev) => !prev)}
                  className="group relative h-24 w-24 overflow-hidden rounded-full border border-gray-200"
                >
                  <img
                    src={avatarImageUrl}
                    alt="Avatar người dùng"
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = defaultAvatarUrl;
                    }}
                  />
                  <span className="absolute inset-0 hidden items-center justify-center bg-black/40 text-xs font-semibold text-white group-hover:flex">
                    Đổi ảnh
                  </span>
                </button>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-gray-900">{profile?.user?.name || '--'}</h2>
                  <p className="text-sm text-gray-600">{profile?.user?.email || '--'}</p>
                  <p className="text-xs text-gray-500">Tham gia từ: {formatDate(profile?.user?.createdAt)}</p>
                  <p className="mt-1 text-xs text-gray-500">Nhấn vào avatar để thêm hoặc thay đổi ảnh đại diện.</p>
                </div>
              </div>
            </div>

            {isAvatarEditorOpen ? (
              <div className="md:col-span-12 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setSelectedAvatarFile(event.target.files?.[0] || null)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />

                  <button
                    type="button"
                    onClick={handleUploadAvatar}
                    disabled={isUploadingAvatar || !selectedAvatarFile}
                    className="rounded-lg bg-[#d70018] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploadingAvatar ? 'Đang cập nhật...' : 'Lưu avatar'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAvatarEditorOpen(false);
                      setSelectedAvatarFile(null);
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                  >
                    Hủy
                  </button>
                </div>

                {selectedAvatarFile ? (
                  <p className="mt-2 text-xs text-gray-600">Đã chọn: {selectedAvatarFile.name}</p>
                ) : null}
              </div>
            ) : null}

            <div className="md:col-span-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Tổng số đơn hàng đã mua</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Tổng tiền tích lũy</p>
                <p className="text-2xl font-bold text-[#d70018]">{formatCurrency(totalSpent)}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Hạng thành viên</h2>
              <span className="rounded-full bg-[#d70018] px-3 py-1 text-xs font-semibold text-white">
                Hạng hiện tại: {membershipTiers[currentTierIndex].code}
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={handlePrevTier}
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xl text-gray-700 shadow"
                aria-label="Xem hạng trước"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={handleNextTier}
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xl text-gray-700 shadow"
                aria-label="Xem hạng tiếp theo"
              >
                ›
              </button>

              <div className="mx-10 grid grid-cols-1 gap-3 md:grid-cols-3">
                {visibleTierIndexes.map((tierIndex) => {
                  const tier = membershipTiers[tierIndex];
                  const isActive = tierIndex === activeTierIndex;
                  const unlocked = totalSpent >= tier.min;

                  return (
                    <div
                      key={`${tier.code}-${tierIndex}`}
                      className={`rounded-2xl border border-white/40 p-4 shadow ${tier.cardClass} ${
                        isActive ? 'ring-2 ring-[#d70018]' : 'opacity-85'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="rounded-full border border-white/60 bg-white/40 px-3 py-1 text-base font-bold">
                          {tier.code}
                        </span>
                        {unlocked ? (
                          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                            Đã mở
                          </span>
                        ) : (
                          <span className="text-sm font-semibold">🔒 Chưa mở</span>
                        )}
                      </div>
                      <p className="text-sm font-medium">
                        {unlocked
                          ? 'Bạn đã đạt điều kiện của hạng thành viên này'
                          : 'Chưa mở khóa hạng thành viên'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex items-center">
              {membershipTiers.map((tier, index) => (
                <Fragment key={tier.code}>
                  <div
                    className={`h-7 w-7 rounded-full border-2 text-center text-xs leading-[24px] font-bold ${
                      index <= activeTierIndex
                        ? 'border-[#d70018] bg-[#d70018] text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    {index <= activeTierIndex ? '✓' : index + 1}
                  </div>
                  {index < membershipTiers.length - 1 ? (
                    <div
                      className={`h-1 flex-1 ${
                        index < activeTierIndex ? 'bg-[#d70018]' : 'bg-gray-200'
                      }`}
                    />
                  ) : null}
                </Fragment>
              ))}
            </div>

            <div className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div>
                <h3 className="mb-2 text-xl font-bold text-center text-gray-900">ĐIỀU KIỆN THĂNG CẤP</h3>
                <p className="text-sm text-gray-700">{activeTier.condition}</p>
              </div>

              <div className="border-t border-dashed border-gray-300 pt-4">
                <h3 className="mb-3 text-xl font-bold text-center text-gray-900">ƯU ĐÃI MUA HÀNG</h3>
                <ul className="space-y-2 text-sm text-gray-800">
                  {activeTier.perks.map((perk, index) => (
                    <li key={`${activeTier.code}-perk-${index}`} className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded bg-[#d70018] text-xs text-white">
                        🎁
                      </span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <article className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Thong bao gan day</h2>
                <span className="rounded-full bg-[#d70018] px-3 py-1 text-xs font-semibold text-white">
                  Chua doc: {unreadNotificationCount}
                </span>
              </div>

              {notifications.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                  Ban chua co thong bao nao.
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`rounded-lg border px-3 py-2 ${
                        notification.isRead
                          ? 'border-gray-200 bg-white'
                          : 'border-red-200 bg-red-50/40'
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                      <p className="mt-1 text-xs text-gray-600">{notification.message}</p>
                      <p className="mt-1 text-[11px] text-gray-400">{formatDateTime(notification.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Voucher cua ban</h2>

              {vouchers.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                  Ban chua co voucher nao.
                </div>
              ) : (
                <div className="space-y-2">
                  {vouchers.map((voucher) => (
                    <div key={voucher._id} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">{voucher.code}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            voucher.status === 'available'
                              ? 'bg-emerald-100 text-emerald-700'
                              : voucher.status === 'used'
                                ? 'bg-gray-200 text-gray-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {voucher.status === 'available'
                            ? 'San sang'
                            : voucher.status === 'used'
                              ? 'Da dung'
                              : 'Het han'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-700">{formatVoucherValue(voucher)}</p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Don toi thieu: {formatCurrency(voucher.minOrderValue || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Các đơn hàng đã mua</h2>

            {orders.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
                Bạn chưa có đơn hàng nào.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <article key={order._id} className="rounded-xl border border-gray-200 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <p className="text-sm text-gray-600">Mã đơn: #{String(order._id || '').slice(-6)}</p>
                        <p className="text-sm text-gray-600">Ngày đặt: {formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-700">{order.status || 'Pending'}</p>
                        <p className="text-base font-bold text-[#d70018]">{formatCurrency(order.totalPrice)}</p>
                        {Number(order.discountAmount || 0) > 0 ? (
                          <p className="text-xs text-emerald-700">
                            Giam {formatCurrency(order.discountAmount)}
                            {order.appliedVoucher?.code ? ` (${order.appliedVoucher.code})` : ''}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {order.orderItems?.map((item, index) => (
                        <div key={`${order._id}-item-${index}`} className="flex items-center gap-3 rounded-lg bg-gray-50 p-2">
                          <img
                            src={getOrderItemImage(item)}
                            alt={item.name}
                            className="h-16 w-16 rounded-md object-contain"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src =
                                'https://placehold.co/80x80/e5e7eb/6b7280?text=Product';
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-600">Số lượng: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-[#d70018]">{item.price}</p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 text-sm text-gray-600">
                      Địa chỉ nhận hàng: {order.customerInfo?.address || '--'}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
