# 🥤 Campa Cola Distributor — MERN + Tailwind

A full-stack distributor management application with E-Commerce, POS Billing, and Admin Dashboard.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| PDF | jsPDF + jsPDF-AutoTable |

---

## 📁 Project Structure

```
campa-cola/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── seeder.js          # Seed demo data
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── dashboardController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT + role guard
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── userRoutes.js
│   │   └── dashboardRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js           # Axios instance with interceptors
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── ShopLayout.jsx # Navbar + footer
    │   │   └── admin/
    │   │       └── AdminLayout.jsx # Sidebar layout
    │   ├── context/
    │   │   ├── AuthContext.jsx    # Auth state + login/logout
    │   │   └── CartContext.jsx    # Cart state + localStorage
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Shop.jsx
    │   │   ├── ProductDetail.jsx
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── Orders.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Profile.jsx
    │   │   └── admin/
    │   │       ├── Dashboard.jsx  # Charts, stats, analytics
    │   │       ├── POS.jsx        # Point of Sale billing
    │   │       ├── AdminProducts.jsx
    │   │       ├── AdminOrders.jsx
    │   │       ├── AdminUsers.jsx
    │   │       └── AdminInventory.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env: set MONGO_URI to your MongoDB connection string

npm install
npm run seed    # Seed demo data (products + users + orders)
npm run dev     # Start backend on port 5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev     # Start frontend on port 5173
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@campa.com | admin123 |
| User | user@campa.com | user123 |

---

## 📊 Features

### 🛍️ E-Commerce (User Side)
- Browse products by category (Cola, Orange, Lemon, Water)
- Search and filter
- Add to cart (persisted in localStorage)
- Checkout with address and payment method
- Order tracking with status timeline
- User profile management

### 🖥️ Admin Panel
- **Dashboard**: Daily / Weekly / Monthly sales charts, category pie chart, top products, recent orders
- **POS Billing**: Fast in-store billing, PDF receipt download
- **Products**: CRUD, activate/deactivate, stock management
- **Orders**: View all orders, update order status and payment status
- **Users**: View users, change roles, activate/deactivate
- **Inventory**: Stock levels, reorder alerts, stock update

### 🧾 POS Billing
- Search/filter products
- Cart with qty controls
- GST auto-calculation (18%)
- Select payment method (Cash/UPI/Card/Credit)
- Generate order in DB
- Download PDF receipt (thermal 80mm format)

### 📈 Dashboard Analytics
- Sales aggregation using MongoDB `$group` pipeline
- Daily (last 7 days), Weekly (last 8 weeks), Monthly (last 12 months)
- Bar chart, Doughnut chart, Top 5 products by revenue
- Low stock alerts, total customers count

---

## 🔐 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/products              (public)
GET    /api/products/admin/all    (admin)
POST   /api/products              (admin)
PUT    /api/products/:id          (admin)
DELETE /api/products/:id          (admin)
PATCH  /api/products/:id/stock    (admin)

POST   /api/orders                (user - online order)
POST   /api/orders/pos            (admin - POS billing)
GET    /api/orders/my             (user - own orders)
GET    /api/orders                (admin - all orders)
PUT    /api/orders/:id/status     (admin)

GET    /api/dashboard/stats
GET    /api/dashboard/sales-chart?period=daily|weekly|monthly
GET    /api/dashboard/top-products
GET    /api/dashboard/recent-orders
GET    /api/dashboard/category-sales

GET    /api/users                 (admin)
PUT    /api/users/:id             (admin)
PUT    /api/users/profile         (own)
```

---

## 🎨 Tailwind Custom Config

```js
colors: {
  campa: { red: '#D0021B' }
}
```

Uses `.btn-primary`, `.btn-secondary`, `.card`, `.input`, `.badge-*`, `.table-th`, `.table-td` utility classes defined in `index.css`.
