# Mini ERP + CRM Operations Portal

> A production-level full-stack ERP & CRM system for wholesale/distribution companies, featuring customer management, product catalog, stock inventory tracking, sales challans with automatic stock deductions, role-based access control (RBAC), and an executive dashboard.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Styling**: Modern CSS Design System (Glassmorphism, Dark/Slate theme, Responsive CSS Grid)
- **HTTP Client**: Axios with JWT Request/Response Interceptors
- **Icons**: Lucide React
- **Routing**: React Router v6

### Backend
- **Runtime**: Node.js & Express.js with TypeScript
- **ORM**: Prisma ORM
- **Database**: PostgreSQL (Supabase / Render / Railway)
- **Security**: JWT Authentication (`jsonwebtoken`), Password Hashing (`bcryptjs`), Role-Based Access Control (RBAC)

---

## 🔑 Role-Based Access Control (RBAC) Matrix

The system implements 4 distinct operational roles:

| Role | Auth & Users | Customer CRM | Product Catalog | Stock Movements | Sales Challans |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **ADMIN** | Full Access | Full Access | Full Access | Full Access | Full Access |
| **SALES** | Self | Create, Edit, View, Notes | View Only | View Only | Create, Confirm, View |
| **WAREHOUSE** | Self | View Only | Create, Edit, Stock Adj | Record IN/OUT, View | Confirm, View |
| **ACCOUNTS** | Self | View Only | View Only | View Only | View Only |

### Pre-configured Seed Demo Accounts
* **Default Password for all seed accounts**: `Password123!`

1. **Super Admin**: `admin@erp.com`
2. **Sales Manager**: `sales@erp.com`
3. **Warehouse Lead**: `warehouse@erp.com`
4. **Accounts Lead**: `accounts@erp.com`

---

## 📁 Project Folder Structure

```text
Mini-ERP-CRM/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database models (User, Customer, Product, StockMovement, Challan)
│   │   └── seed.ts                # Seed script with default users & sample catalog
│   ├── src/
│   │   ├── config/                # Singleton Prisma client instance
│   │   ├── controllers/           # Auth, Customer, Product, Inventory, Challan controllers
│   │   ├── middleware/            # JWT authentication & RBAC middleware
│   │   ├── routes/                # Clean REST API endpoints
│   │   ├── services/              # Business logic & transactional stock reduction
│   │   ├── utils/                 # JWT sign/verify, bcrypt hashing, response formatters
│   │   ├── app.ts                 # Express application & global error handlers
│   │   └── server.ts              # Entrypoint server initialization
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/            # Sidebar, Header, ProtectedRoute, StatsCard, StatusBadge, Modal
│   │   ├── context/               # AuthContext managing user session & permissions
│   │   ├── pages/                 # Login, Dashboard, Customers, Products, Inventory, Challans
│   │   ├── services/              # Axios instance & modular API client wrappers
│   │   ├── types/                 # TypeScript interfaces
│   │   ├── App.tsx                # Main router setup
│   │   ├── main.tsx               # DOM root mount
│   │   └── index.css              # Full custom CSS design system
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md
```

---

## 🛠️ Local Installation & Setup Instructions

### Prerequisites
- **Node.js**: v18.x or higher
- **NPM**: v9.x or higher

### Step 1: Clone & Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment configuration file
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/minierp_crm?schema=public"
JWT_SECRET="super_secret_jwt_key_mini_erp_crm_2026_production_ready"
JWT_EXPIRES_IN="7d"
```

### Step 2: Database Migration & Seeding

```bash
# Generate Prisma Client
npx prisma generate

# Apply database migrations
npx prisma db push

# Seed default users, sample customers, products & initial challans
npm run seed
```

### Step 3: Run Backend Server

```bash
# Start in development mode with live reload
npm run dev
```
Backend API will run on `http://localhost:5000`.

---

### Step 4: Setup & Run Frontend

```bash
# Open a new terminal window
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend will run on `http://localhost:3000`.

---

## 📑 Postman & REST API Documentation

### 1. Authentication Endpoints

#### `POST /api/auth/register`
* **Request Body**:
```json
{
  "name": "Jane Salesperson",
  "email": "jane.sales@erp.com",
  "password": "Password123!",
  "role": "SALES"
}
```

#### `POST /api/auth/login`
* **Request Body**:
```json
{
  "email": "admin@erp.com",
  "password": "Password123!"
}
```
* **Response**:
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "u-123456",
      "name": "Super Admin",
      "email": "admin@erp.com",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

---

### 2. Customer CRM Endpoints

#### `GET /api/customers`
* **Headers**: `Authorization: Bearer <token>`
* **Query Params**: `search=acme&status=Active&customerType=Distributor&page=1&limit=10`

#### `POST /api/customers`
* **Request Body**:
```json
{
  "customerName": "Global Retail Hub",
  "mobileNumber": "+91 98888 77766",
  "email": "procurement@globalretail.com",
  "businessName": "Global Retail Enterprises Ltd",
  "gstNumber": "27GGGGG999911Z2",
  "customerType": "Wholesale",
  "address": "Building 5, Business Bay, Pune, MH",
  "status": "Active",
  "followUpDate": "2026-08-20",
  "notes": "Prefers bulk shipments on Fridays."
}
```

#### `POST /api/customers/:id/notes`
* **Request Body**:
```json
{
  "note": "Called client today. Confirmed payment terms and scheduled next dispatch for 50 units."
}
```

---

### 3. Product Catalog Endpoints

#### `GET /api/products`
* **Query Params**: `search=cable&lowStockOnly=true`

#### `POST /api/products`
* **Request Body**:
```json
{
  "productName": "Heavy Duty Steel Cable Ties 300mm",
  "SKU": "PRD-CBL-300",
  "category": "Electrical & Wiring",
  "unitPrice": 25.50,
  "currentStock": 500,
  "minimumStockAlert": 100,
  "warehouseLocation": "Aisle 3, Shelf B2"
}
```

---

### 4. Stock Movement & Inventory Logs

#### `GET /api/stock-movement`
* **Query Params**: `movementType=OUT`

#### `POST /api/stock-movement`
* **Request Body**:
```json
{
  "productId": "p-101",
  "quantityChanged": 25,
  "movementType": "IN",
  "reason": "Stock Purchase Order Arrival PO-8891"
}
```

---

### 5. Sales Challan Workflow Endpoints

#### `POST /api/challans`
* **Request Body**:
```json
{
  "customerId": "c-501",
  "status": "Confirmed",
  "items": [
    { "productId": "p-101", "quantity": 10 },
    { "productId": "p-102", "quantity": 2 }
  ]
}
```
* **Business Logic Executed**:
  1. Validates available stock for each line item.
  2. Generates unique Challan number (`CHN-YYYYMMDD-XXXX`).
  3. Stores product snapshot prices (`productName`, `sku`, `unitPrice`, `subtotal`).
  4. Atomically reduces product `currentStock`.
  5. Automatically logs `OUT` stock movement records.

#### `PUT /api/challans/:id/status`
* **Request Body**:
```json
{
  "status": "Confirmed"
}
```

---

## 🌐 Deployment Instructions

### Deploying Database on Supabase
1. Create a free project on [Supabase](https://supabase.com/).
2. Navigate to **Project Settings -> Database** and copy the **Transaction Connection String**.
3. Set `DATABASE_URL` in your backend deployment environment variables.

### Deploying Backend API on Render / Railway
1. Push `backend/` directory to GitHub repository.
2. Create a new **Web Service** on Render or Railway.
3. Set Build Command: `npm run build && npx prisma db push`
4. Set Start Command: `npm start`
5. Configure Environment Variables: `PORT`, `DATABASE_URL`, `JWT_SECRET`.

### Deploying Frontend Dashboard on Vercel
1. Connect your repository to [Vercel](https://vercel.com/).
2. Select Root Directory as `frontend/`.
3. Framework Preset: **Vite**.
4. Set Environment Variable: `VITE_API_URL=https://your-backend-api.onrender.com/api`.
5. Deploy!

---

## 📜 Architecture Summary

The application enforces strict layering & separation of concerns:
- **Presentation Layer**: Responsive React UI built with custom CSS design tokens.
- **Service & Business Logic Layer**: Modular controllers & services handling transactional operations with Prisma `$transaction`.
- **Database Persistence Layer**: PostgreSQL schema managed via Prisma ORM.
- **Security & Authorization**: JWT token verification coupled with declarative RBAC route middleware (`authorizeRoles('ADMIN', 'SALES')`).
