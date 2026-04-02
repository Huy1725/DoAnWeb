# DoAnWeb - MERN Ecommerce Monorepo

DoAnWeb la du an thuong mai dien tu xay dung theo mo hinh MERN stack, tach thanh 3 ung dung rieng trong cung mot monorepo:

- `frontend`: website khach hang
- `admin`: dashboard quan tri he thong
- `backend`: REST API + MongoDB

Muc tieu cua du an la xay dung full flow cho ecommerce: xem san pham, gio hang, dat hang, theo doi don hang, quan ly san pham/danh muc/don hang/tai khoan, va quan ly banner trang chu tu admin.

## 1. Kien truc tong quan

```text
DoAnWeb/
	backend/
		controllers/
		middleware/
		models/
		routes/
		server.js

	frontend/
		src/
			components/
			context/
			pages/
			config/

	admin/
		src/
			components/
			context/
			pages/
			config/

	readme.md
```

### Trach nhiem tung service

- `backend`
	- xu ly business logic va ket noi MongoDB
	- cung cap API xac thuc, san pham, danh muc, don hang, nguoi dung, banner
	- luu anh san pham/banner dang binary (Buffer) trong MongoDB
- `frontend`
	- giao dien khach hang (home, category, product detail, cart, checkout, my orders)
	- goi API thong qua prefix `/api` (duoc map den backend)
- `admin`
	- giao dien quan tri
	- CRUD san pham, danh muc, nguoi dung, don hang
	- upload/sua banner trang chu

## 2. Tinh nang chinh

### Khach hang (Frontend)

- dang ky, dang nhap
- tim kiem san pham, loc theo danh muc
- xem chi tiet san pham + thong so + bien the
- gio hang (luu localStorage)
- dat hang, xem danh sach don cua toi

### Quan tri (Admin)

- dang nhap voi quyen admin
- quan ly san pham (them/sua/xoa + upload anh)
- quan ly danh muc
- quan ly don hang (cap nhat trang thai, xoa, cap nhat)
- quan ly tai khoan nguoi dung va vai tro admin
- quan ly banner home (main, side1, side2, side3)

### Backend API

- JWT auth + middleware `protect` / `admin`
- route phan quyen theo role
- upload file bang `multer` memory storage
- schema MongoDB voi Mongoose

## 3. Cong nghe su dung

- Frontend/Admin: React 18, Vite 5, TailwindCSS
- Backend: Node.js, Express, Mongoose
- Auth: JWT, bcryptjs
- Database: MongoDB (local hoac Atlas)

## 4. API modules

- `/api/auth`: dang ky, dang nhap, quan ly user auth
- `/api/users`: quan ly user tu admin
- `/api/products`: danh sach, chi tiet, CRUD, image
- `/api/categories`: CRUD danh muc
- `/api/orders`: tao don, don cua toi, don admin
- `/api/banners`: lay danh sach banner, lay image banner, update banner (admin)

## 5. Yeu cau moi truong

- Node.js 18+ (khuyen nghi Node.js 20)
- npm 9+
- MongoDB local hoac MongoDB Atlas

## 6. Cai dat dependencies

Chay lan luot:

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

## 7. Cau hinh bien moi truong

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/doanweb
JWT_SECRET=please_change_me
```

### Frontend (`frontend/.env`)

```env
VITE_PORT=5173
VITE_API_PROXY_TARGET=http://localhost:5000
VITE_API_URL=https://your-backend.onrender.com
VITE_ADMIN_URL=https://your-admin.onrender.com
```

### Admin (`admin/.env`)

```env
VITE_PORT=5174
VITE_API_PROXY_TARGET=http://localhost:5000
VITE_API_URL=https://your-backend.onrender.com
VITE_FRONTEND_URL=https://your-frontend.onrender.com
```

## 8. Chay local

Chay tung service trong tung terminal:

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

Mac dinh local:

- Frontend: `http://localhost:5173`
- Admin: `http://localhost:5174`
- Backend API: `http://localhost:5000`

## 9. Build production

```bash
cd frontend && npm run build
cd ../admin && npm run build
```

## 10. Seed du lieu mau

```bash
cd backend
npm run seed
```

## 11. Luu y khi deploy Render

- Backend deploy dang Web Service
- Frontend/Admin deploy dang Static Site
- Frontend va Admin can rewrite rule:
	- Source: `/*`
	- Destination: `/index.html`
	- Action: `Rewrite`
- Backend domain se tra ve `Cannot GET /` neu mo truc tiep root `/`, do la binh thuong vi day la API server

## 12. Bao mat va best practices

- khong commit file `.env` that
- da co `.gitignore` de bo qua `node_modules`, `dist`, `.env`, `.sfdx`
- nen doi `JWT_SECRET` manh khi deploy production
