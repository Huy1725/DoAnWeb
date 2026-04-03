import { MainContent } from '../components/MainLayout';

const ContactPage = () => {
  return (
    <MainContent>
      <section className="mt-4 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Liên hệ</h1>
        <p className="mt-3 text-sm text-gray-700">Nếu cần hỗ trợ, bạn có thể liên hệ với chúng tôi qua các kênh sau:</p>

        <div className="mt-4 space-y-2 text-sm text-gray-700">
          <p>
            Gọi mua hàng: <span className="font-semibold text-[#d70018]">1800 2097</span>
          </p>
          <p>
            Khiếu nại: <span className="font-semibold text-[#d70018]">1800 2063</span>
          </p>
          <p>
            Bảo hành: <span className="font-semibold text-[#d70018]">1800 2064</span>
          </p>
          <p>Email hỗ trợ: support@cellphones-clone.vn</p>
          <p>Thời gian làm việc: 08:00 - 22:00 (tất cả các ngày trong tuần)</p>
        </div>
      </section>
    </MainContent>
  );
};

export default ContactPage;
