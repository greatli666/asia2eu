# ASIA2EU - Asia Proxy Shopping Service

Modern proxy shopping service website built with React, Vite, and Cloudflare Serverless stack.

## 🚀 Architecture: Serverless & Zero Cost
This project is designed to run entirely on Cloudflare's free tier, replacing traditional VPS costs.

- **Frontend**: Cloudflare Pages
- **Database**: Cloudflare D1 (SQLite)
- **Object Storage**: Cloudflare R2 (Image Hosting)
- **Backend API**: Cloudflare Workers

---

## 🛠 Setup & Deployment

### 1. Cloudflare D1 (Database)
Create a D1 database in Cloudflare dashboard and run the following SQL to initialize:
```sql
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK( type IN ('recommend','warning') ) NOT NULL,
  date TEXT NOT NULL
);
```

### 2. Cloudflare R2 (Storage)
- Create a bucket named `asia2eubucket`.
- In bucket settings, enable **Public Access** and take note of the `.r2.dev` URL (or bind your custom domain).

### 3. Cloudflare Worker (Backend)
Deploy a worker with the logic contained in the project (Logic manages D1/R2 and provides `/api/posts` and `/api/upload` endpoints).

**Worker Bindings Required:**
- **D1 Binding**: Variable name `D1_DB` linked to your D1 database.
- **R2 Binding**: Variable name `R2_BUCKET` linked to your R2 bucket.
- **Environment Variable**: `ADMIN_PASSWORD` = `your_secure_password`.

### 4. Frontend Configuration
Create a `.env` file in the root based on `.env.example`:
```env
VITE_WORKER_URL=https://your-worker-subdomain.workers.dev
```

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

**Admin Access**: Navigate to `http://localhost:3000/#admin` to access the hidden management panel.

---

## 🔒 Security
- All sensitive IDs and passwords are kept in Cloudflare's secure environment.
- The Admin Panel is password-protected and uses secure headers for communication.
