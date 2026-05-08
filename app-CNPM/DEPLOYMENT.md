# Deploy Full Railway

Architecture:

- Frontend React Vite: Railway service with root directory `client`
- Backend Express Node.js: Railway service with root directory `server`
- Database MySQL: Railway MySQL service

## 1. Railway MySQL

1. Create a MySQL service on Railway.
2. Link or copy the Railway-provided variables into the backend service:
   - `MYSQLHOST`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`
   - `MYSQLPORT`
3. The backend also supports local aliases:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_PORT`

## 2. Railway Backend

1. Create a Railway service from this repository.
2. Set the service root directory to `server`.
3. Use the included `server/railway.json`, or set build command:
   ```bash
   npm install
   ```
4. Set start command:
   ```bash
   npm start
   ```
5. Configure environment variables:
   ```env
   JWT_SECRET=<strong-random-secret>
   CLIENT_URL=https://<your-railway-frontend-domain>
   EMAIL_USER=<smtp-user>
   EMAIL_PASS=<smtp-password>
   ```
6. Add the MySQL variables from the Railway MySQL service.
7. Deploy. On startup the server runs schema setup and migrations.
8. Generate a Railway public domain for this backend service. This URL is used by the frontend as `VITE_API_URL`.

## 3. Railway Frontend

1. Create another Railway service from this repository.
2. Set the project root directory to `client`.
3. Use the included `client/railway.json`, or set build command:
   ```bash
   npm install && npm run build
   ```
4. Set start command:
   ```bash
   npm start
   ```
5. Configure:
   ```env
   VITE_API_URL=https://<your-railway-backend-domain>
   ```
6. Deploy and generate a Railway public domain for the frontend service.
7. Copy the frontend Railway domain back into the backend service as `CLIENT_URL`.

## 4. Local Verification

Backend:

```bash
cd server
npm install
npm start
```

Frontend:

```bash
cd client
npm install
npm run build
npm start
```

For local frontend development:

```bash
cd client
npm run dev
```

Use `client/.env` locally:

```env
VITE_API_URL=http://localhost:3000
```

Use `server/.env` locally:

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

## Railway Service Variables

Backend service:

```env
JWT_SECRET=<strong-random-secret>
CLIENT_URL=https://<frontend>.up.railway.app
EMAIL_USER=<smtp-user>
EMAIL_PASS=<smtp-password>
MYSQLHOST=<from-railway-mysql>
MYSQLUSER=<from-railway-mysql>
MYSQLPASSWORD=<from-railway-mysql>
MYSQLDATABASE=<from-railway-mysql>
MYSQLPORT=<from-railway-mysql>
```

Frontend service:

```env
VITE_API_URL=https://<backend>.up.railway.app
```

Do not set `VITE_API_URL` to the MySQL URL. It must be the public backend Express URL.

## Production Notes

- Do not commit real `.env` files, JWT secrets, email passwords, or database credentials.
- Uploaded files are served from `/uploads` by the Railway backend and are intentionally ignored by Git.
- Railway service filesystems are ephemeral. User-uploaded files may not survive redeploys. For permanent production storage, move uploads to object storage such as S3/R2 and store the public URL in MySQL.
- Railway injects `PORT`; both frontend and backend bind to it through their `npm start` scripts.
