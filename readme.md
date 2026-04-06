# DoAnWeb - Monorepo Thương Mại Điện Tử MERN

DoAnWeb là dự án thương mại điện tử xây dựng theo mô hình monorepo với 3 ứng dụng độc lập:

- frontend: website khách hàng
- admin: trang quản trị hệ thống
- backend: REST API + MongoDB

Hệ thống đã có đầy đủ các luồng chính: quản lý sản phẩm, tồn kho, danh mục, giỏ hàng, đặt hàng, quản lý banner, hạng thành viên, voucher, thông báo và dashboard báo cáo admin.

## 1. Cấu trúc project chi tiết

```text
DoAnWeb/
├─ .gitignore                                        # Bỏ qua node_modules, dist, .env và file tạm
├─ readme.md                                         # Tài liệu dự án
│
├─ backend/                                          # API Node.js + Express + MongoDB
│  ├─ .env.example                                   # Mẫu biến môi trường backend
│  ├─ package.json                                   # Scripts và dependencies backend
│  ├─ package-lock.json                              # Lock phiên bản package backend
│  ├─ seed.js                                        # Seed dữ liệu mẫu user/sản phẩm
│  ├─ server.js                                      # Entry point, kết nối DB, đăng ký routes
│  │
│  ├─ controllers/                                   # Business logic theo module
│  │  ├─ auth.controller.js                          # Đăng ký/đăng nhập, JWT
│  │  ├─ banner.controller.js                        # Quản lý banner + trả ảnh banner
│  │  ├─ category.controller.js                      # CRUD danh mục
│  │  ├─ order.controller.js                         # Tạo đơn, trừ tồn kho, áp voucher, báo cáo admin
│  │  ├─ product.controller.js                       # CRUD sản phẩm, ảnh, biến thể, thông số, tồn kho
│  │  ├─ promotion.controller.js                     # Quản lý khuyến mãi, phát/xóa voucher theo tài khoản
│  │  └─ user.controller.js                          # Hồ sơ user, avatar, thông báo, danh sách voucher
│  │
│  ├─ middleware/
│  │  ├─ auth.middleware.js                          # Middleware protect/admin từ JWT
│  │  └─ upload.middleware.js                        # Cấu hình upload multer (memory)
│  │
│  ├─ models/                                        # Mongoose schemas
│  │  ├─ banner.model.js                             # Schema banner (main1/main2/main3, side)
│  │  ├─ category.model.js                           # Schema danh mục
│  │  ├─ notification.model.js                       # Schema thông báo người dùng
│  │  ├─ order.model.js                              # Schema đơn hàng + voucher áp dụng + discount
│  │  ├─ product.model.js                            # Schema sản phẩm + stock + specs + variants
│  │  ├─ promotion.model.js                          # Schema chương trình khuyến mãi
│  │  ├─ user.model.js                               # Schema người dùng + role + membership + avatar
│  │  └─ userVoucher.model.js                        # Schema voucher theo từng user
│  │
│  ├─ routes/                                        # Định nghĩa endpoint
│  │  ├─ auth.routes.js                              # /api/auth
│  │  ├─ banner.routes.js                            # /api/banners
│  │  ├─ category.routes.js                          # /api/categories
│  │  ├─ order.routes.js                             # /api/orders
│  │  ├─ product.routes.js                           # /api/products
│  │  ├─ promotion.routes.js                         # /api/promotions
│  │  └─ user.routes.js                              # /api/users
│  │
│  └─ services/
│     └─ membership.service.js                       # Rule hạng thành viên + phần thưởng lên hạng
│
├─ frontend/                                         # Ứng dụng khách hàng React + Vite
│  ├─ .env                                           # Biến môi trường local frontend
│  ├─ .env.example                                   # Mẫu biến môi trường frontend
│  ├─ index.html                                     # HTML shell frontend
│  ├─ package.json                                   # Scripts/dependencies frontend
│  ├─ package-lock.json                              # Lock package frontend
│  ├─ postcss.config.js                              # Cấu hình PostCSS
│  ├─ tailwind.config.js                             # Cấu hình Tailwind
│  ├─ vite.config.js                                 # Cấu hình Vite
│  │
│  └─ src/
│     ├─ App.jsx                                     # Khai báo routes frontend
│     ├─ index.css                                   # CSS global
│     ├─ main.jsx                                    # Entry React + patch fetch /api
│     ├─ config/
│     │  └─ url.js                                   # Resolve API/Admin URL theo env + localhost
│     ├─ context/
│     │  ├─ AuthContext.jsx                          # Đăng nhập/đăng ký/đăng xuất
│     │  └─ CartContext.jsx                          # Giỏ hàng + ràng buộc số lượng theo tồn kho
│     ├─ components/
│     │  ├─ FlashSaleSection.jsx                     # Khu vực flash sale
│     │  ├─ Footer.jsx                               # Footer chính
│     │  ├─ Header.jsx                               # Header + tìm kiếm + danh mục + thông báo
│     │  ├─ HeroSection.jsx                          # Hero banner trang chủ
│     │  ├─ MainLayout.jsx                           # Layout chính
│     │  ├─ ProductCard.jsx                          # Card sản phẩm
│     │  ├─ ProductSection.jsx                       # Danh sách sản phẩm theo section
│     │  └─ ProtectedRoute.jsx                       # Bảo vệ route yêu cầu đăng nhập
│     └─ pages/
│        ├─ HomePage.jsx                             # Trang chủ
│        ├─ CategoryProductsPage.jsx                 # Danh sách theo danh mục
│        ├─ ProductDetailPage.jsx                    # Chi tiết sản phẩm
│        ├─ CartPage.jsx                             # Giỏ hàng
│        ├─ CheckoutPage.jsx                         # Thanh toán + áp voucher
│        ├─ MyOrdersPage.jsx                         # Hồ sơ, hạng thành viên, voucher, đơn hàng
│        ├─ LoginPage.jsx                            # Đăng nhập
│        ├─ RegisterPage.jsx                         # Đăng ký
│        ├─ ShippingPolicyPage.jsx                   # Chính sách vận chuyển
│        ├─ ReturnPolicyPage.jsx                     # Chính sách đổi trả
│        ├─ WarrantyPolicyPage.jsx                   # Chính sách bảo hành
│        ├─ CareersPage.jsx                          # Tuyển dụng
│        ├─ ContactPage.jsx                          # Liên hệ
│        └─ StoreLocationsPage.jsx                   # Hệ thống cửa hàng
│
└─ admin/                                            # Ứng dụng quản trị React + Vite
	├─ .env                                           # Biến môi trường local admin
	├─ .env.example                                   # Mẫu biến môi trường admin
	├─ index.html                                     # HTML shell admin
	├─ package.json                                   # Scripts/dependencies admin
	├─ package-lock.json                              # Lock package admin
	├─ postcss.config.js                              # Cấu hình PostCSS
	├─ tailwind.config.js                             # Cấu hình Tailwind
	├─ vite.config.js                                 # Cấu hình Vite
	└─ src/
		├─ App.jsx                                     # Khai báo route admin
		├─ index.css                                   # CSS global admin
		├─ main.jsx                                    # Entry admin + patch fetch /api
		├─ config/
		│  └─ url.js                                   # Resolve API/Frontend URL
		├─ context/
		│  ├─ AuthContext.jsx                          # Auth cho admin
		│  └─ CartContext.jsx                          # Context dùng lại
		├─ components/
		│  ├─ AdminLayout.jsx                          # Sidebar + layout quản trị
		│  ├─ HeroSection.jsx                          # Preview hero
		│  ├─ ProductCard.jsx                          # Card preview sản phẩm
		│  ├─ ProductSection.jsx                       # Section preview
		│  ├─ ProtectedRoute.jsx                       # Chặn route admin
		│  ├─ FlashSaleSection.jsx                     # Component dùng lại
		│  ├─ Footer.jsx                               # Component dùng lại
		│  ├─ Header.jsx                               # Component dùng lại
		│  └─ MainLayout.jsx                           # Component dùng lại
		└─ pages/
			├─ AdminDashboardPage.jsx                  # Tổng hợp/báo cáo doanh thu, tồn kho, top bán chạy
			├─ AdminProductsPage.jsx                   # Quản lý sản phẩm + tồn kho
			├─ ProductEditPage.jsx                     # Chỉnh sửa sản phẩm
			├─ AdminCategoriesPage.jsx                 # Quản lý danh mục
			├─ AdminOrdersPage.jsx                     # Quản lý đơn hàng
			├─ AdminUsersPage.jsx                      # Quản lý tài khoản
			├─ AdminBannersPage.jsx                    # Quản lý banner
			├─ AdminPromotionsPage.jsx                 # Quản lý khuyến mãi + phát/xóa voucher user
			├─ LoginPage.jsx                           # Đăng nhập admin
			├─ HomePage.jsx                            # Page dùng lại
			├─ CartPage.jsx                            # Page dùng lại
			├─ CheckoutPage.jsx                        # Page dùng lại
			├─ CategoryProductsPage.jsx                # Page dùng lại
			├─ ProductDetailPage.jsx                   # Page dùng lại
			├─ MyOrdersPage.jsx                        # Page dùng lại
			└─ RegisterPage.jsx                        # Page dùng lại
```

## 2. Kiến trúc hệ thống và trách nhiệm từng service

### Backend

- Cung cấp REST API cho toàn hệ thống.
- Xử lý nghiệp vụ lõi: tồn kho, đơn hàng, voucher, hạng thành viên, thông báo.
- Kết nối MongoDB và lưu ảnh sản phẩm/banner dạng Buffer.

### Frontend

- Website cho khách hàng: xem sản phẩm, giỏ hàng, checkout, hồ sơ và lịch sử đơn.
- Tự động gọi API qua tiền tố /api.

### Admin

- Dashboard quản trị: sản phẩm, danh mục, đơn hàng, tài khoản, banner, khuyến mãi.
- Có trang báo cáo tổng hợp và quản lý phát voucher theo tài khoản.

## 3. Tính năng nghiệp vụ chính

### Khách hàng

- Đăng ký, đăng nhập bằng tên đăng nhập hoặc email.
- Tìm kiếm sản phẩm, xem theo danh mục, xem chi tiết thông số.
- Quản lý giỏ hàng có ràng buộc số lượng theo tồn kho.
- Checkout, đặt hàng, xem lịch sử đơn.
- Xem thông báo hệ thống (đặt hàng thành công, lên hạng, nhận voucher).
- Quản lý voucher cá nhân và áp voucher khi thanh toán.

### Quản trị

- CRUD sản phẩm, danh mục, banner.
- Quản lý đơn hàng và trạng thái đơn.
- Quản lý người dùng và phân quyền admin.
- Quản lý chương trình khuyến mãi.
- Phát voucher cho tài khoản chỉ định và xóa voucher còn khả dụng của tài khoản đó.
- Theo dõi dashboard doanh thu, tồn kho, sản phẩm bán chạy.

### Thành viên và thưởng hạng

- S-NULL -> S-NEW: tặng voucher 50K.
- S-NEW -> S-MEM: tặng voucher 100K.
- S-MEM -> S-VIP: tặng voucher 300K.

## 4. API modules chi tiết

### /api/auth

- Đăng ký tài khoản.
- Đăng nhập.

### /api/users

- Hồ sơ user hiện tại.
- Avatar user.
- Notifications (lấy danh sách, đánh dấu đã đọc).
- Vouchers của user.
- CRUD user cho admin.

### /api/products

- Danh sách sản phẩm, chi tiết sản phẩm.
- CRUD sản phẩm cho admin.
- Ảnh sản phẩm.

### /api/categories

- CRUD danh mục.

### /api/orders

- Tạo đơn hàng.
- Đơn của user hiện tại.
- Quản lý đơn cho admin.
- Báo cáo tổng hợp cho dashboard admin.

### /api/banners

- Lấy dữ liệu banner và ảnh banner.
- Cập nhật banner cho admin.

### /api/promotions

- CRUD trạng thái khuyến mãi.
- Phát voucher cho user được chọn.
- Lấy danh sách voucher theo user.
- Xóa voucher khả dụng của user.

## 5. Mô hình dữ liệu và quy tắc quan trọng

### Product

- Có trường stock, mặc định 20 cho dữ liệu cũ chưa có tồn kho.
- Không cho mua vượt quá stock.

### Order

- Lưu subtotalPrice, discountAmount, appliedVoucher, totalPrice.
- Khi đặt hàng: trừ tồn kho theo số lượng thực mua.

### Promotion và UserVoucher

- Promotion là mẫu chương trình khuyến mãi do admin tạo.
- UserVoucher là voucher cụ thể được cấp cho từng tài khoản.

### Notification

- Lưu thông báo theo từng user: order-success, tier-upgrade, voucher-reward.

### User

- Lưu membershipTier, role admin/user, avatar.

## 6. Công nghệ sử dụng

### Frontend/Admin

- React 18
- Vite 5
- TailwindCSS

### Backend

- Node.js + Express
- Mongoose
- JWT
- bcryptjs
- multer

### Database

- MongoDB (local hoặc Atlas)

## 7. Cấu hình biến môi trường

### Backend (backend/.env)

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/doanweb
JWT_SECRET=please_change_me
```

### Frontend (frontend/.env)

```env
VITE_PORT=5173
VITE_API_PROXY_TARGET=http://localhost:5000
VITE_API_URL=https://your-backend.onrender.com
VITE_ADMIN_URL=https://your-admin.onrender.com
```

### Admin (admin/.env)

```env
VITE_PORT=5174
VITE_API_PROXY_TARGET=http://localhost:5000
VITE_API_URL=https://your-backend.onrender.com
VITE_FRONTEND_URL=https://your-frontend.onrender.com
```

## 8. Cài đặt và chạy local

### Cài đặt dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

### Chạy 3 service

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev

# Terminal 3
cd admin
npm run dev
```

Địa chỉ mặc định:

- Frontend: http://localhost:5173
- Admin: http://localhost:5174
- Backend API: http://localhost:5000

## 9. Build, seed dữ liệu và tài khoản mẫu

### Build frontend và admin

```bash
cd frontend && npm run build
cd ../admin && npm run build
```

### Seed dữ liệu backend

```bash
cd backend
npm run seed
```

Tài khoản admin mẫu sau khi seed:

- Email: admin@cellphones.com
- Mật khẩu: 123456

## 10. Hướng dẫn deploy Render và checklist kiểm thử

### Deploy đề xuất

- Backend: Render Web Service.
- Frontend/Admin: Render Static Site.
- Frontend và Admin cần rewrite SPA:
- Source: /*
- Destination: /index.html
- Action: Rewrite

### Checklist kiểm thử sau deploy

- Đăng nhập user và admin hoạt động.
- Tạo đơn hàng trừ tồn kho đúng số lượng.
- Chặn mua vượt tồn kho.
- Tạo khuyến mãi và áp mã khuyến mãi khi checkout.
- Phát voucher theo tài khoản từ admin.
- Xóa voucher khả dụng của tài khoản từ admin.
- Lên hạng thành viên đúng mốc và nhận thông báo/voucher thưởng.
- Dashboard admin hiển thị doanh thu, tồn kho, top bán chạy.
