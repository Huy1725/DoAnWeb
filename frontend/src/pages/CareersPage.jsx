import { MainContent } from '../components/MainLayout';

const CareersPage = () => {
  return (
    <MainContent>
      <section className="mt-4 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Tuyển dụng</h1>
        <p className="mt-3 text-sm text-gray-700">
          Chúng tôi luôn tìm kiếm các ứng viên năng động cho các vị trí kỹ thuật, vận hành và chăm sóc khách hàng.
        </p>

        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700">
          <li>Nhân viên bán hàng và tư vấn sản phẩm.</li>
          <li>Kỹ thuật viên phần cứng và hỗ trợ bảo hành.</li>
          <li>Nhân sự marketing, nội dung và thương mại điện tử.</li>
          <li>Kỹ sư phần mềm cho hệ thống web và quản trị nội bộ.</li>
        </ul>

        <p className="mt-4 text-sm text-gray-700">
          Gửi CV về email: <span className="font-semibold">careers@cellphones-clone.vn</span>
        </p>
      </section>
    </MainContent>
  );
};

export default CareersPage;
