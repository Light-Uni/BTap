# Hướng Dẫn Deploy Pharm WMS Trên Railway

Dự án gồm 3 service chạy trên Railway:

- `client`: Frontend React Vite
- `server`: Backend Express Node.js
- `MySQL`: Railway MySQL Database

## 1. Chuẩn Bị

Cần có:

- Tài khoản Railway
- Repository đã push lên GitHub
- 3 service trên Railway:
  - Frontend service, root directory: `app-CNPM/client`
  - Backend service, root directory: `app-CNPM/server`
  - MySQL service

Không commit các file chứa secret như `.env`, JWT secret, email password hoặc database credentials.

## 2. Deploy MySQL Trên Railway

1. Vào Railway project.
2. Chọn `New Service`.
3. Chọn `Database`.
4. Chọn `MySQL`.
5. Sau khi Railway tạo xong MySQL, lấy các biến môi trường sau:

```env
MYSQLHOST=
MYSQLUSER=
MYSQLPASSWORD=
MYSQLDATABASE=
MYSQLPORT=
```

Các biến này sẽ được copy hoặc reference sang backend service.

## 3. Deploy Backend Express Trên Railway

1. Trong Railway project, chọn `New Service`.
2. Chọn repository GitHub của dự án.
3. Set root directory là:

```bash
app-CNPM/server
```

4. Railway sẽ dùng file:

```bash
app-CNPM/server/railway.json
```

Nếu cần cấu hình thủ công:

```bash
Build command: npm install
Start command: npm start
```

5. Thêm biến môi trường cho backend:

```env
JWT_SECRET=<chuoi-bi-mat-manh>
CLIENT_URL=https://<frontend-domain>.up.railway.app
EMAIL_USER=<email-smtp>
EMAIL_PASS=<password-smtp>
MYSQLHOST=<from-railway-mysql>
MYSQLUSER=<from-railway-mysql>
MYSQLPASSWORD=<from-railway-mysql>
MYSQLDATABASE=<from-railway-mysql>
MYSQLPORT=<from-railway-mysql>
```

6. Deploy backend.
7. Vào `Settings` của backend service và tạo public domain.
8. Lưu lại backend URL, ví dụ:

```env
https://pharm-backend.up.railway.app
```

Backend sẽ tự chạy schema setup/migration khi start.

## 4. Deploy Frontend React Vite Trên Railway

1. Trong cùng Railway project, chọn `New Service`.
2. Chọn cùng repository GitHub.
3. Set root directory là:

```bash
app-CNPM/client
```

4. Railway sẽ dùng file:

```bash
app-CNPM/client/railway.json
```

Nếu cần cấu hình thủ công:

```bash
Build command: npm install && npm run build
Start command: npm start
```

5. Thêm biến môi trường cho frontend:

```env
VITE_API_URL=https://<backend-domain>.up.railway.app
```

Lưu ý: `VITE_API_URL` phải là URL public của backend Express, không phải URL MySQL.

6. Deploy frontend.
7. Tạo public domain cho frontend.
8. Copy frontend domain và cập nhật lại biến `CLIENT_URL` trong backend:

```env
CLIENT_URL=https://<frontend-domain>.up.railway.app
```

9. Redeploy backend để CORS nhận domain frontend mới.

## 5. Biến Môi Trường Local

Tạo file `server/.env` từ `server/.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pharmacy_db
DB_PORT=3306
JWT_SECRET=<local-secret>
CLIENT_URL=http://localhost:5173
EMAIL_USER=
EMAIL_PASS=
```

Tạo file `client/.env` từ `client/.env.example`:

```env
VITE_API_URL=http://localhost:3000
```

## 6. Chạy Local

Backend:

```bash
cd server
npm install
npm start
```

Frontend development:

```bash
cd client
npm install
npm run dev
```

Frontend production preview:

```bash
cd client
npm run build
npm start
```

## 7. Kiểm Tra Sau Deploy

Sau khi deploy xong, kiểm tra:

- Frontend mở được bằng Railway public domain.
- Login/register gọi đúng backend Railway URL.
- Backend không báo lỗi CORS.
- Backend service có đủ biến `MYSQL*`.
- Backend service có `JWT_SECRET`.
- Frontend service có `VITE_API_URL`.
- Upload ảnh trả về URL dạng `/uploads/...`.
- Không push `.env`, `node_modules`, `dist`, `build`, `uploads`.

## 8. Lưu Ý Production

- Railway filesystem là ephemeral, file upload có thể mất sau redeploy. Nếu cần lưu ảnh lâu dài, nên chuyển upload sang S3, Cloudflare R2 hoặc dịch vụ object storage khác.
- `CLIENT_URL` trong backend phải đúng frontend domain để CORS hoạt động.
- `VITE_API_URL` trong frontend phải đúng backend domain để API hoạt động.
- Không expose `JWT_SECRET` hoặc thông tin MySQL ra frontend.

