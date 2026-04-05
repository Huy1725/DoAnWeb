import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const formatCurrency = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')}đ`;
const formatDate = (value) => {
  if (!value) {
    return '--';
  }

  return new Date(value).toLocaleString('vi-VN');
};

const createDefaultForm = () => ({
  name: '',
  code: '',
  discountType: 'fixed',
  discountValue: '',
  maxDiscountAmount: '',
  minOrderValue: '',
  active: true,
});

// Trang quan ly khuyen mai: tao voucher giam tien truc tiep hoac giam theo %.
const AdminPromotionsPage = () => {
  const { userInfo } = useContext(AuthContext);

  const [promotions, setPromotions] = useState([]);
  const [users, setUsers] = useState([]);
  const [userVouchers, setUserVouchers] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPromotionId, setSelectedPromotionId] = useState('');
  const [voucherStatusFilter, setVoucherStatusFilter] = useState('available');

  const [formData, setFormData] = useState(createDefaultForm());
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingUserVouchers, setLoadingUserVouchers] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);

  const fetchPromotions = async () => {
    try {
      setLoadingPromotions(true);

      const response = await fetch('/api/promotions', {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Khong the tai danh sach voucher');
      }

      const data = await response.json();
      setPromotions(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Da xay ra loi khi tai voucher');
    } finally {
      setLoadingPromotions(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      const response = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Khong the tai danh sach tai khoan');
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Da xay ra loi khi tai tai khoan');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserVouchers = async (userId = selectedUserId, status = voucherStatusFilter) => {
    if (!userId) {
      setUserVouchers([]);
      return;
    }

    try {
      setLoadingUserVouchers(true);

      const query = new URLSearchParams({ userId });
      if (status && status !== 'all') {
        query.set('status', status);
      }

      const response = await fetch(`/api/promotions/user-vouchers?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Khong the tai voucher cua tai khoan');
      }

      const data = await response.json();
      setUserVouchers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Da xay ra loi khi tai voucher cua tai khoan');
    } finally {
      setLoadingUserVouchers(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchUsers();
  }, [userInfo.token]);

  useEffect(() => {
    if (!selectedUserId && users.length > 0) {
      setSelectedUserId(users[0]._id);
    }
  }, [users, selectedUserId]);

  const assignablePromotions = useMemo(
    () => promotions.filter((promotion) => promotion.active && !promotion.autoTierReward),
    [promotions]
  );

  useEffect(() => {
    if (!selectedPromotionId && assignablePromotions.length > 0) {
      setSelectedPromotionId(assignablePromotions[0]._id);
    }
  }, [assignablePromotions, selectedPromotionId]);

  useEffect(() => {
    fetchUserVouchers(selectedUserId, voucherStatusFilter);
  }, [selectedUserId, voucherStatusFilter]);

  const selectedUser = useMemo(
    () => users.find((user) => user._id === selectedUserId) || null,
    [users, selectedUserId]
  );

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreatePromotion = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);

      const payload = {
        name: formData.name,
        code: formData.code,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue || 0),
        maxDiscountAmount:
          formData.discountType === 'percent' ? Number(formData.maxDiscountAmount || 0) : 0,
        minOrderValue: Number(formData.minOrderValue || 0),
        active: Boolean(formData.active),
      };

      const response = await fetch('/api/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Khong the tao voucher');
      }

      setFormData(createDefaultForm());
      await fetchPromotions();
    } catch (err) {
      setError(err.message || 'Da xay ra loi khi tao voucher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePromotionStatus = async (promotion) => {
    try {
      const response = await fetch(`/api/promotions/${promotion._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ active: !promotion.active }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Khong the cap nhat trang thai voucher');
      }

      await fetchPromotions();
    } catch (err) {
      setError(err.message || 'Da xay ra loi khi cap nhat voucher');
    }
  };

  const handleAssignVoucherToUser = async (event) => {
    event.preventDefault();

    if (!selectedUserId || !selectedPromotionId) {
      setError('Vui long chon tai khoan va voucher de phat');
      return;
    }

    try {
      setAssigning(true);

      const response = await fetch('/api/promotions/assign-voucher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          userId: selectedUserId,
          promotionId: selectedPromotionId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Khong the phat voucher cho tai khoan');
      }

      await fetchUserVouchers(selectedUserId, voucherStatusFilter);
      setError(null);
    } catch (err) {
      setError(err.message || 'Da xay ra loi khi phat voucher');
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteUserVoucher = async (voucher) => {
    const confirmed = window.confirm(`Ban co chac muon xoa voucher ${voucher.code}?`);

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/promotions/user-vouchers/${voucher._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Khong the xoa voucher');
      }

      await fetchUserVouchers(selectedUserId, voucherStatusFilter);
      setError(null);
    } catch (err) {
      setError(err.message || 'Da xay ra loi khi xoa voucher');
    }
  };

  const isPageLoading = loadingPromotions || loadingUsers;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quan ly khuyen mai</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tao voucher, phat voucher cho tai khoan cu the va xoa voucher con kha dung cua tai khoan.
        </p>
      </div>

      <form
        onSubmit={handleCreatePromotion}
        className="rounded-xl border border-gray-200 bg-white p-5 space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900">Tao voucher moi</h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ten voucher"
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            required
          />
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            placeholder="Ma voucher (VD: GIAM50K)"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 uppercase"
            required
          />
          <select
            name="discountType"
            value={formData.discountType}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            required
          >
            <option value="fixed">Giam tien truc tiep</option>
            <option value="percent">Giam theo phan tram (%)</option>
          </select>
          <input
            type="number"
            min="1"
            name="discountValue"
            value={formData.discountValue}
            onChange={handleInputChange}
            placeholder={formData.discountType === 'percent' ? 'Gia tri giam (%)' : 'Gia tri giam (VND)'}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            required
          />
          {formData.discountType === 'percent' ? (
            <input
              type="number"
              min="0"
              name="maxDiscountAmount"
              value={formData.maxDiscountAmount}
              onChange={handleInputChange}
              placeholder="So tien giam toi da (VND)"
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          ) : null}
          <input
            type="number"
            min="0"
            name="minOrderValue"
            value={formData.minOrderValue}
            onChange={handleInputChange}
            placeholder="Don hang toi thieu (VND)"
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleInputChange}
          />
          Kich hoat ngay sau khi tao
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[#d70018] px-4 py-2 font-semibold text-white disabled:opacity-70"
        >
          {submitting ? 'Dang tao...' : 'Tao voucher'}
        </button>
      </form>

      <form
        onSubmit={handleAssignVoucherToUser}
        className="rounded-xl border border-gray-200 bg-white p-5 space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900">Phat voucher cho tai khoan</h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <select
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            required
          >
            <option value="">-- Chon tai khoan --</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} - {user.email}
              </option>
            ))}
          </select>

          <select
            value={selectedPromotionId}
            onChange={(event) => setSelectedPromotionId(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            required
          >
            <option value="">-- Chon voucher can phat --</option>
            {assignablePromotions.map((promotion) => (
              <option key={promotion._id} value={promotion._id}>
                {promotion.code} - {promotion.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={assigning || !selectedUserId || !selectedPromotionId}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {assigning ? 'Dang phat voucher...' : 'Phat voucher cho tai khoan da chon'}
        </button>
      </form>

      <section className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Voucher cua tai khoan {selectedUser ? selectedUser.name : ''}
          </h2>

          <select
            value={voucherStatusFilter}
            onChange={(event) => setVoucherStatusFilter(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">Tat ca trang thai</option>
            <option value="available">Dang kha dung</option>
            <option value="used">Da su dung</option>
            <option value="expired">Het han</option>
          </select>
        </div>

        {loadingUserVouchers ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-gray-600">
            Dang tai voucher cua tai khoan...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold">Ma voucher</th>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold">Gia tri</th>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold">Nguon</th>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold">Trang thai</th>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold">Ngay cap</th>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold">Hanh dong</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {userVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-5 text-center text-gray-500">
                      Tai khoan nay chua co voucher theo bo loc hien tai.
                    </td>
                  </tr>
                ) : (
                  userVouchers.map((voucher) => (
                    <tr key={voucher._id} className="odd:bg-white even:bg-gray-50/40">
                      <td className="border-b border-gray-100 px-4 py-3 font-semibold">{voucher.code}</td>
                      <td className="border-b border-gray-100 px-4 py-3">
                        {voucher.discountType === 'fixed'
                          ? formatCurrency(voucher.discountValue)
                          : `${voucher.discountValue}% (max ${formatCurrency(
                              voucher.maxDiscountAmount || 0
                            )})`}
                      </td>
                      <td className="border-b border-gray-100 px-4 py-3">{voucher.source}</td>
                      <td className="border-b border-gray-100 px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            voucher.status === 'available'
                              ? 'bg-emerald-100 text-emerald-700'
                              : voucher.status === 'used'
                                ? 'bg-gray-200 text-gray-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {voucher.status}
                        </span>
                      </td>
                      <td className="border-b border-gray-100 px-4 py-3">{formatDate(voucher.createdAt)}</td>
                      <td className="border-b border-gray-100 px-4 py-3">
                        <button
                          type="button"
                          disabled={voucher.status !== 'available'}
                          onClick={() => handleDeleteUserVoucher(voucher)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Xoa voucher
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isPageLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-600">
          Dang tai du lieu...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Ma</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Ten voucher</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Loai</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Gia tri</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Don toi thieu</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Trang thai</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Hanh dong</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-5 text-center text-gray-500">
                    Chua co voucher nao.
                  </td>
                </tr>
              ) : (
                promotions.map((promotion) => (
                  <tr key={promotion._id} className="odd:bg-white even:bg-gray-50/40">
                    <td className="border-b border-gray-100 px-4 py-3 font-semibold">{promotion.code}</td>
                    <td className="border-b border-gray-100 px-4 py-3">{promotion.name}</td>
                    <td className="border-b border-gray-100 px-4 py-3">
                      {promotion.discountType === 'fixed' ? 'Giam truc tiep' : 'Giam %'}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3">
                      {promotion.discountType === 'fixed'
                        ? formatCurrency(promotion.discountValue)
                        : `${promotion.discountValue}% (max ${formatCurrency(
                            promotion.maxDiscountAmount || 0
                          )})`}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3">
                      {formatCurrency(promotion.minOrderValue || 0)}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          promotion.active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {promotion.active ? 'Dang bat' : 'Tam tat'}
                      </span>
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleTogglePromotionStatus(promotion)}
                        className="rounded-md border border-blue-200 px-3 py-1.5 text-xs text-blue-600"
                      >
                        {promotion.active ? 'Tat' : 'Bat'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPromotionsPage;
