import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const formatCurrency = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')}đ`;

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
  const [formData, setFormData] = useState(createDefaultForm());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [userInfo.token]);

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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quan ly khuyen mai</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tao voucher giam truc tiep tien hoac giam theo %, co gioi han so tien giam toi da.
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

      {loading ? (
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
