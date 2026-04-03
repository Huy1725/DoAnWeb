import { MainContent } from '../components/MainLayout';

const stores = [
  {
    name: 'CellphoneS Quận 1',
    address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
  },
  {
    name: 'CellphoneS Cầu Giấy',
    address: '56 Trần Thái Tông, Quận Cầu Giấy, Hà Nội',
  },
  {
    name: 'CellphoneS Hải Châu',
    address: '77 Nguyễn Văn Linh, Quận Hải Châu, Đà Nẵng',
  },
];

const StoreLocationsPage = () => {
  return (
    <MainContent>
      <section className="mt-4 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Hệ thống cửa hàng</h1>
        <p className="mt-3 text-sm text-gray-700">
          Danh sách cửa hàng mẫu để bạn tham khảo khi triển khai trang thông tin chi nhánh.
        </p>

        <div className="mt-4 space-y-3">
          {stores.map((store) => (
            <article key={store.name} className="rounded-lg border border-gray-200 p-4">
              <h2 className="text-base font-semibold text-gray-900">{store.name}</h2>
              <p className="mt-1 text-sm text-gray-700">{store.address}</p>
            </article>
          ))}
        </div>
      </section>
    </MainContent>
  );
};

export default StoreLocationsPage;
