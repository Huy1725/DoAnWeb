import { MainContent } from '../components/MainLayout';

const WarrantyPolicyPage = () => {
  return (
    <MainContent>
      <section className="mt-4 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Chính sách bảo hành</h1>
        <p className="mt-3 text-sm text-gray-700">
          Tất cả sản phẩm chính hãng đều được áp dụng chính sách bảo hành theo tiêu chuẩn của nhà sản xuất.
        </p>

        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700">
          <li>Thời gian bảo hành tùy theo từng sản phẩm và thương hiệu.</li>
          <li>Hỗ trợ tra cứu thông tin bảo hành bằng mã đơn hàng hoặc số điện thoại.</li>
          <li>Sản phẩm bị can thiệp phần cứng hoặc hư hỏng do người dùng có thể không đủ điều kiện bảo hành.</li>
          <li>Liên hệ hotline bảo hành để được tư vấn trước khi mang thiết bị tới trung tâm.</li>
        </ul>
      </section>
    </MainContent>
  );
};

export default WarrantyPolicyPage;
