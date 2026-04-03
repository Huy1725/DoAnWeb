import { MainContent } from '../components/MainLayout';

const ReturnPolicyPage = () => {
  return (
    <MainContent>
      <section className="mt-4 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Chính sách đổi trả</h1>
        <p className="mt-3 text-sm text-gray-700">
          Khách hàng có thể yêu cầu đổi trả nếu sản phẩm phát sinh lỗi kỹ thuật hoặc sai thông tin đặt hàng.
        </p>

        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700">
          <li>Tiếp nhận đổi trả trong thời gian quy định theo từng nhóm sản phẩm.</li>
          <li>Sản phẩm cần còn đầy đủ phụ kiện, hộp và hóa đơn mua hàng.</li>
          <li>Trường hợp lỗi do nhà sản xuất sẽ được hỗ trợ đổi sản phẩm tương đương.</li>
          <li>Đối với đơn hàng online, vui lòng liên hệ tổng đài để được hướng dẫn chi tiết.</li>
        </ul>
      </section>
    </MainContent>
  );
};

export default ReturnPolicyPage;
