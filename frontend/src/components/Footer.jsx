import { Link } from 'react-router-dom';

const socialLinks = [
  { name: 'Facebook', symbol: 'f' },
  { name: 'YouTube', symbol: '▶' },
  { name: 'TikTok', symbol: '♪' },
];

const paymentMethods = ['Visa', 'Mastercard', 'VNPay'];

const Footer = () => {
  return (
    <footer className="mt-8 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2 text-sm text-gray-700">
          <h3 className="text-base font-bold text-gray-900">Tổng đài hỗ trợ</h3>
          <p>
            Gọi mua hàng: <span className="font-bold text-[#d70018]">1800 2097</span>
          </p>
          <p>
            Khiếu nại: <span className="font-bold text-[#d70018]">1800 2063</span>
          </p>
          <p>
            Bảo hành: <span className="font-bold text-[#d70018]">1800 2064</span>
          </p>
        </div>

        <div className="space-y-2 text-sm text-gray-700">
          <h3 className="text-base font-bold text-gray-900">Chính sách</h3>
          <p>
            <Link to="/shipping-policy" className="hover:text-[#d70018]">
              Chính sách giao hàng
            </Link>
          </p>
          <p>
            <Link to="/return-policy" className="hover:text-[#d70018]">
              Chính sách đổi trả
            </Link>
          </p>
          <p>
            <Link to="/warranty-policy" className="hover:text-[#d70018]">
              Chính sách bảo hành
            </Link>
          </p>
        </div>

        <div className="space-y-2 text-sm text-gray-700">
          <h3 className="text-base font-bold text-gray-900">Về chúng tôi</h3>
          <p>
            <Link to="/careers" className="hover:text-[#d70018]">
              Tuyển dụng
            </Link>
          </p>
          <p>
            <Link to="/contact" className="hover:text-[#d70018]">
              Liên hệ
            </Link>
          </p>
          <p>
            <Link to="/store-locations" className="hover:text-[#d70018]">
              Hệ thống cửa hàng
            </Link>
          </p>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          <h3 className="text-base font-bold text-gray-900">Kết nối với chúng tôi</h3>
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <span
                key={social.name}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700"
                aria-label={social.name}
              >
                {social.symbol}
              </span>
            ))}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-gray-900">Phương thức thanh toán</p>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full border-t border-gray-100 py-3 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} CellphoneS Clone UI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
