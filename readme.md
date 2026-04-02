# DoAnWeb - MERN Ecommerce

Du an duoc tach thanh 3 phan ro rang de de phat trien va de push len GitHub:

- `frontend`: Website cho khach hang
- `admin`: Trang quan tri
- `backend`: REST API + MongoDB

## 1. Cau truc thu muc

```text
DoAnWeb/
	admin/
	backend/
	frontend/
	package.json        # scripts dieu phoi toan bo workspace
	README.md
```

## 2. Cong nghe

- Frontend/Admin: React + Vite + TailwindCSS
- Backend: Node.js + Express + Mongoose
- Database: MongoDB
- Auth: JWT + bcryptjs

## 3. Yeu cau moi truong

- Node.js 18+ (khuyen nghi Node.js 20)
- npm 9+
- MongoDB local hoac MongoDB Atlas

## 4. Cai dat

Tu thu muc goc project:

```bash
npm install
npm run setup
```

Lenh `setup` se cai dependencies cho:

- `backend`
- `frontend`
- `admin`

## 5. Cau hinh bien moi truong

### Backend

Tao file `backend/.env` tu mau `backend/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/doanweb
JWT_SECRET=please_change_me
```

### Frontend

Tao file `frontend/.env` tu mau `frontend/.env.example`:

```env
VITE_PORT=5173
VITE_API_PROXY_TARGET=https://cellphone-backend-3gmw.onrender.com/
VITE_ADMIN_URL=https://cellphone-backend-3gmw.onrender.com/
```

### Admin

Tao file `admin/.env` tu mau `admin/.env.example`:

```env
VITE_PORT=5174
VITE_API_PROXY_TARGET=https://cellphone-backend-3gmw.onrender.com/
VITE_FRONTEND_URL=https://cellphone-backend-3gmw.onrender.com/
```

## 6. Chay du an

### Chay tat ca service cung luc

```bash
npm run dev:all
```

### Hoac chay rieng

```bash
npm run dev:backend
npm run dev:frontend
npm run dev:admin
```

Mac dinh truy cap:

- Frontend: https://cellphone-backend-3gmw.onrender.com/
- Admin: https://cellphone-backend-3gmw.onrender.com/
- Backend API: https://cellphone-backend-3gmw.onrender.com/

## 7. Build

Build frontend va admin:

```bash
npm run build
```

## 8. Seed du lieu mau

```bash
npm run seed
```

## 9. Huong dan push len GitHub

```bash
git init
git add .
git commit -m "chore: split project into frontend backend admin"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Luu y:

- Khong commit cac file `.env` that su.
- Da co `.gitignore` de bo qua `node_modules`, `dist` va file env.
