import { MainContent } from '../components/MainLayout';

const ShippingPolicyPage = () => {
  return (
    <MainContent>
      <section className="mt-4 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Chính sách giao hàng</h1>
        <p className="mt-3 text-sm text-gray-700">
          CellphoneS Clone hỗ trợ giao hàng toàn quốc với nhiều hình thức vận chuyển linh hoạt.
        </p>

        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700">
          <li>Thời gian giao dự kiến từ 1 đến 5 ngày làm việc tùy khu vực.</li>
          <li>Miễn phí giao hàng cho đơn đủ điều kiện theo chương trình hiện hành.</li>
          <li>Đơn hàng được kiểm tra và xác nhận trước khi bàn giao cho đơn vị vận chuyển.</li>
          <li>Khách hàng có thể theo dõi trạng thái đơn hàng trong mục hồ sơ & đơn hàng.</li>
        </ul>
      </section>
    </MainContent>
  );
};

export default ShippingPolicyPage;
