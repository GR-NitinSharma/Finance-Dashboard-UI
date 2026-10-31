# 🐘 PHP Backend — Finance Tracker API

A complete PHP backend that **mirrors all Node.js API routes** and shares the **same SQLite database**.

---

## 📁 Folder Structure

```
php-backend/
├── index.php                        ← Main router (entry point)
├── .htaccess                        ← Apache URL rewriting
├── config/
│   ├── db.php                       ← SQLite3 database connection
│   └── helpers.php                  ← CORS headers, JSON response, activity logger
└── routes/
    ├── auth/
    │   ├── signup.php               ← POST /api/signup
    │   ├── login.php                ← POST /api/login
    │   └── logout.php               ← POST /api/logout
    ├── users/
    │   ├── list.php                 ← GET  /api/users
    │   └── activity.php             ← GET  /api/activity
    └── transactions/
        ├── get.php                  ← GET    /api/transactions/:userId
        ├── create.php               ← POST   /api/transactions
        ├── update.php               ← PUT    /api/transactions/:id
        └── delete.php               ← DELETE /api/transactions/:id
```

---

## ✅ Requirements

- **PHP >= 8.0**
- PHP extension: `sqlite3` (usually bundled)
- PHP extension: `json` (usually bundled)

---

## 🚀 Running the PHP Backend

### Option 1 — PHP Built-in Server (Recommended for development)

From the **ui/** folder, run:
```bash
php -S localhost:8080 php-backend/index.php
```

Then test the health check:
```
http://localhost:8080/api/health
```

### Option 2 — XAMPP / WAMP / Laragon (Apache)

1. Copy the `php-backend/` folder into Apache `htdocs/`
2. Enable `mod_rewrite` in Apache
3. Access via `http://localhost/php-backend/api/health`

---

## 🔌 API Routes

| Method   | Route                          | Description                  |
|----------|--------------------------------|------------------------------|
| `POST`   | `/api/signup`                  | Register a new user          |
| `POST`   | `/api/login`                   | Authenticate a user          |
| `POST`   | `/api/logout`                  | Log a logout event           |
| `GET`    | `/api/users`                   | List all users (admin)       |
| `GET`    | `/api/activity`                | Get activity logs (admin)    |
| `GET`    | `/api/transactions/:userId`    | Get user's transactions      |
| `POST`   | `/api/transactions`            | Add a new transaction        |
| `PUT`    | `/api/transactions/:id`        | Update a transaction         |
| `DELETE` | `/api/transactions/:id`        | Delete a transaction         |
| `GET`    | `/api/health`                  | PHP health check             |

---

## 🔧 Connect React Frontend to PHP

Update `vite.config.ts` to proxy API calls to the PHP server:

```ts
server: {
  proxy: {
    '/api': 'http://localhost:8080'   // ← point to PHP server
  }
}
```

---

## 🗄️ Database

- The PHP backend **shares the same SQLite DB** as Node.js: `server/app.db`
- Run Node.js server once first to **initialize tables**
- Both backends can run at the same time

---

## 🔐 Security

- Passwords hashed with PHP `password_hash()` (bcrypt, cost 10) — **fully compatible** with Node.js `bcryptjs`
- All DB queries use **prepared statements** (no SQL injection)
- CORS headers allow React dev server requests
