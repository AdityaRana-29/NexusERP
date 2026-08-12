# NexusERP — Wholesale & Distribution Operations Portal

> A production-ready full-stack ERP + CRM system for wholesale and distribution companies. Built with React, Node.js, Prisma, and PostgreSQL — featuring customer lifecycle management, product catalog, real-time inventory tracking, sales challans with automatic stock deductions, and role-based access control.

---

## 🔗 Live Demo

| Service | URL |
| :--- | :--- |
| 🌐 **Frontend** | [https://nexus-erp-eta.vercel.app](https://nexus-erp-eta.vercel.app) |
| ⚙️ **Backend API** | [https://nexuserp-779t.onrender.com](https://nexuserp-779t.onrender.com) |
| 🩺 **Health Check** | [https://nexuserp-779t.onrender.com/api/health](https://nexuserp-779t.onrender.com/api/health) |

> **Note:** Backend runs on Render's free tier — first request may take ~50 seconds to wake up.

---

## 🔑 Demo Credentials

All demo accounts use the same password: **`Password123!`**

| Role | Email | Access Level |
| :--- | :--- | :--- |
| **Admin** | `admin@erp.com` | Full access to everything |
| **Sales** | `sales@erp.com` | Customers, Challans, View Products |
| **Warehouse** | `warehouse@erp.com` | Products, Inventory, View Challans |
| **Accounts** | `accounts@erp.com` | View only across all modules |

---

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** — fast bundler and dev server
- **React Router v6** — client-side routing
- **Axios** — HTTP client with JWT interceptors
- **Lucide React** — icons
- **Custom CSS** — glassmorphism dark theme, responsive grid

### Backend
- **Node.js + Express.js** with TypeScript
- **Prisma ORM** — type-safe database access
- **PostgreSQL** on Supabase
- **JWT** authentication + **bcryptjs** password hashing
- **Role-Based Access Control (RBAC)**

### Infrastructure
- **Frontend** → Vercel
- **Backend API** → Render
- **Database** → Supabase (PostgreSQL)

---

## 🔐 RBAC Permission Matrix

| Feature | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| :--- | :---: | :---: | :---: | :---: |
| Customers — View | ✅ | ✅ | ✅ | ✅ |
| Customers — Create / Edit | ✅ | ✅ | ❌ | ❌ |
| Customers — Delete | ✅ | ❌ | ❌ | ❌ |
| Follow-up Notes | ✅ | ✅ | ❌ | ❌ |
| Products — View | ✅ | ✅ | ✅ | ✅ |
| Products — Create / Edit | ✅ | ❌ | ✅ | ❌ |
| Products — Delete | ✅ | ❌ | ❌ | ❌ |
| Stock Movements — View | ✅ | ✅ | ✅ | ✅ |
| Stock Movements — Record | ✅ | ❌ | ✅ | ❌ |
| Challans — View | ✅ | ✅ | ✅ | ✅ |
| Challans — Create | ✅ | ✅ | ❌ | ❌ |
| Challans — Update Status | ✅ | ✅ | ✅ | ❌ |

---

## 📁 Project Structure

```
NexusERP/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # DB models: User, Customer, Product, StockMovement, Challan
│   │   └── seed.ts                # Default users, sample products, customers & challans
│   ├── src/
│   │   ├── config/                # Prisma client singleton
│   │   ├── controllers/           # Auth, Customer, Product, Inventory, Challan
│   │   ├── middleware/            # JWT auth + RBAC middleware
│   │   ├── routes/                # REST API route definitions
│   │   ├── services/              # Business logic & transactional operations
│   │   ├── types/                 # Enums (Role, CustomerStatus, MovementType, etc.)
│   │   ├── utils/                 # JWT, bcrypt, response helpers
│   │   ├── app.ts                 # Express app + CORS + error handling
│   │   └── server.ts              # Server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/            # Sidebar, Header, Modal, StatsCard, StatusBadge, ProtectedRoute
│   │   ├── context/               # AuthContext — session & permissions
│   │   ├── pages/                 # Login, Dashboard, Customers, Products, Inventory, Challans
│   │   ├── services/              # Axios instance + API modules per domain
│   │   ├── types/                 # TypeScript interfaces
│   │   ├── App.tsx                # Router setup
│   │   └── index.css              # Custom CSS design system
│   ├── vercel.json
│   ├── vite.config.ts
│   └── package.json
├── Mini-ERP-CRM.postman_collection.json
├── render.yaml
└── README.md
```

---

## 🛠️ Local Setup

### Prerequisites
- Node.js v18+
- A PostgreSQL database (Supabase free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/AdityaRana-29/NexusERP.git
cd NexusERP
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
DATABASE_URL="postgresql://..."   # Supabase transaction pooler URL
DIRECT_URL="postgresql://..."     # Supabase direct connection URL
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"
```

```bash
npx prisma db push       # Apply schema to database
npx tsx prisma/seed.ts   # Seed demo data
npm run dev              # Start dev server on :5000
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev   # Start on :3000
```

---

## 📡 API Reference

Base URL: `https://nexuserp-779t.onrender.com/api`

### Auth
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login and receive JWT |
| GET | `/auth/me` | Auth | Get current user profile |

### Customers
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| GET | `/customers` | All roles | List with search/filter/pagination |
| GET | `/customers/:id` | All roles | Get customer details |
| POST | `/customers` | Admin, Sales | Create customer |
| PUT | `/customers/:id` | Admin, Sales | Update customer |
| DELETE | `/customers/:id` | Admin only | Delete customer |
| POST | `/customers/:id/notes` | Admin, Sales | Add follow-up note |

### Products
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| GET | `/products` | All roles | List with search/filter/pagination |
| GET | `/products/:id` | All roles | Get product details |
| POST | `/products` | Admin, Warehouse | Create product |
| PUT | `/products/:id` | Admin, Warehouse | Update product |
| DELETE | `/products/:id` | Admin only | Delete product |

### Inventory
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| GET | `/stock-movement` | All roles | List stock movements |
| POST | `/stock-movement` | Admin, Warehouse | Record IN/OUT movement |

### Challans
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| GET | `/challans` | All roles | List with search/filter |
| GET | `/challans/:id` | All roles | Get challan details |
| POST | `/challans` | Admin, Sales | Create challan (auto-deducts stock) |
| PUT | `/challans/:id/status` | Admin, Sales, Warehouse | Update status |

---

## 🧪 Postman Collection

Import `Mini-ERP-CRM.postman_collection.json` from the root of this repo.

The Login request automatically saves the JWT token — all other requests inherit it. Run in this order:
1. **Auth → Login**
2. Any other request

---

## ⚙️ Deployment

### Backend → Render
1. New Web Service → connect `AdityaRana-29/NexusERP`
2. Root Directory: `backend`
3. Build: `npm install && npx prisma generate && npm run build`
4. Start: `npm run start`
5. Environment variables: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `NODE_ENV=production`

### Frontend → Vercel
1. New Project → import `AdityaRana-29/NexusERP`
2. Root Directory: `frontend`
3. Environment variable: `VITE_API_URL=https://nexuserp-779t.onrender.com/api`

---

## 📜 Architecture

```
React Frontend (Vercel)
       │
       │ HTTPS REST API calls
       ▼
Express.js Backend (Render)
       │
       │ Prisma ORM
       ▼
PostgreSQL Database (Supabase)
```

- **Auth flow**: JWT issued on login → stored in localStorage → sent as `Authorization: Bearer` header on every request
- **RBAC**: Route-level middleware checks `req.user.role` against allowed roles per endpoint
- **Challan creation**: Wrapped in `prisma.$transaction` — stock deduction and movement logging are atomic
- **Stock alerts**: Products with `currentStock < minimumStockAlert` are flagged in the UI

---

## 👤 Author

**Aditya Rana** — [GitHub @AdityaRana-29](https://github.com/AdityaRana-29)
