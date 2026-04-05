import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
const formatNumber = (value) => Number(value || 0).toLocaleString('vi-VN');

const STATUS_LABELS = {
  Pending: 'Chờ xác nhận',
  Processing: 'Đang xử lý',
  Shipped: 'Đang giao',
  Completed: 'Hoàn tất',
  Cancelled: 'Đã hủy',
};

const getStatusChipClass = (status) => {
  const normalizedStatus = String(status || '').toLowerCase();

  if (normalizedStatus === 'completed') return 'bg-green-100 text-green-700';
  if (normalizedStatus === 'processing') return 'bg-blue-100 text-blue-700';
  if (normalizedStatus === 'shipped') return 'bg-indigo-100 text-indigo-700';
  if (normalizedStatus === 'cancelled') return 'bg-red-100 text-red-700';

  return 'bg-yellow-100 text-yellow-700';
};

const StatCard = ({ label, value, tone = 'text-gray-900' }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
  </div>
);

// Trang tổng hợp và báo cáo quản trị.
const AdminDashboardPage = () => {
  const { userInfo } = useContext(AuthContext);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/orders/report/summary', {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Không thể tải dữ liệu báo cáo');
      }

      const data = await response.json();
      setReport(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo?.token) {
      setLoading(false);
      setError('Bạn chưa đăng nhập hoặc không có quyền truy cập.');
      return;
    }

    fetchReport();
  }, [userInfo]);

  const monthlyMaxRevenue = useMemo(() => {
    const values = report?.monthlyRevenue?.map((item) => Number(item.revenue || 0)) || [];
    return Math.max(...values, 1);
  }, [report]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-600">
          Đang tải báo cáo...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
        <button
          type="button"
          onClick={fetchReport}
          className="rounded-lg bg-[#d70018] px-4 py-2 text-sm font-semibold text-white"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const summary = report?.summary || {};
  const ordersByStatus = report?.ordersByStatus || {};
  const monthlyRevenue = report?.monthlyRevenue || [];
  const topSellingProducts = report?.topSellingProducts || [];
  const lowStockProducts = report?.lowStockProducts || [];
  const outOfStockProducts = report?.outOfStockProducts || [];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng hợp & Báo cáo</h1>
          <p className="text-sm text-gray-500">Theo dõi hiệu suất bán hàng và tình trạng tồn kho.</p>
        </div>
        <button
          type="button"
          onClick={fetchReport}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Làm mới dữ liệu
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng doanh thu" value={formatCurrency(summary.totalRevenue)} tone="text-[#d70018]" />
        <StatCard label="Tổng đơn hàng" value={formatNumber(summary.totalOrders)} />
        <StatCard label="Tổng người dùng" value={formatNumber(summary.totalUsers)} />
        <StatCard label="Tổng sản phẩm" value={formatNumber(summary.totalProducts)} />
        <StatCard label="Tổng tồn kho" value={formatNumber(summary.totalStock)} tone="text-emerald-700" />
        <StatCard label="Sắp hết hàng (<= 5)" value={formatNumber(summary.lowStockCount)} tone="text-amber-700" />
        <StatCard label="Hết hàng" value={formatNumber(summary.outOfStockCount)} tone="text-red-700" />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-gray-900">Trạng thái đơn hàng</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.keys(ordersByStatus).length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có dữ liệu đơn hàng.</p>
          ) : (
            Object.entries(ordersByStatus).map(([status, count]) => (
              <div
                key={status}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusChipClass(status)}`}
              >
                {STATUS_LABELS[status] || status}: {formatNumber(count)}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-gray-900">Doanh thu 6 tháng gần nhất</h2>
        <div className="mt-4 space-y-3">
          {monthlyRevenue.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có dữ liệu doanh thu.</p>
          ) : (
            monthlyRevenue.map((item) => {
              const widthPercent = Math.min(
                100,
                Math.round((Number(item.revenue || 0) / monthlyMaxRevenue) * 100)
              );

              return (
                <div key={item.month} className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>{item.month}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(item.revenue)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-[#d70018]"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-bold text-gray-900">Top sản phẩm bán chạy</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="text-gray-600">
                <tr>
                  <th className="border-b border-gray-200 px-2 py-2 font-semibold">Sản phẩm</th>
                  <th className="border-b border-gray-200 px-2 py-2 text-right font-semibold">Đã bán</th>
                </tr>
              </thead>
              <tbody>
                {topSellingProducts.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-2 py-4 text-center text-gray-500">
                      Chưa có dữ liệu.
                    </td>
                  </tr>
                ) : (
                  topSellingProducts.map((item) => (
                    <tr key={`${item.productId || item.name}`} className="odd:bg-white even:bg-gray-50/50">
                      <td className="border-b border-gray-100 px-2 py-2 font-medium text-gray-800">
                        {item.name}
                      </td>
                      <td className="border-b border-gray-100 px-2 py-2 text-right text-[#d70018] font-semibold">
                        {formatNumber(item.totalSold)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5">
            <h2 className="text-lg font-bold text-amber-700">Sản phẩm sắp hết hàng</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {lowStockProducts.length === 0 ? (
                <li className="text-gray-500">Không có sản phẩm nào sắp hết hàng.</li>
              ) : (
                lowStockProducts.map((product) => (
                  <li key={product._id} className="rounded-lg bg-white px-3 py-2">
                    <span className="font-semibold text-gray-800">{product.name}</span>
                    <span className="ml-2 text-amber-700">Còn {formatNumber(product.stock)}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/40 p-5">
            <h2 className="text-lg font-bold text-red-700">Sản phẩm đã hết hàng</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {outOfStockProducts.length === 0 ? (
                <li className="text-gray-500">Hiện chưa có sản phẩm hết hàng.</li>
              ) : (
                outOfStockProducts.map((product) => (
                  <li key={product._id} className="rounded-lg bg-white px-3 py-2">
                    <span className="font-semibold text-gray-800">{product.name}</span>
                    <span className="ml-2 text-red-700">Hết hàng</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
