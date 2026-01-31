# Shiv Furniture ERP (Budgeting & Accounting System)

> **Enterprise Resource Planning (ERP)** system built for Shiv Furniture to streamline budget allocation, purchase/sales workflows, and financial analytics.

## 📖 Table of Contents
1.  [Project Overview](#-project-overview)
2.  [Tech Stack & Architecture](#-tech-stack--architecture)
3.  [Key Features](#-key-features)
4.  [Installation & Setup](#-installation--setup)
5.  [Environment Variables](#-environment-variables)
6.  [Database Schema](#-database-schema)
7.  [API Documentation](#-api-documentation)
8.  [Project Structure](#-project-structure)

---

## 🔍 Project Overview
This application replaces legacy manual tracking with a centralized digital system. It handles the full financial lifecycle:
*   **Planning**: Setting up budgets for different cost centers (Analytical Accounts).
*   **Execution**: Creating Purchase Orders and Sales Orders.
*   **Tracking**: Linking individual bill/invoice lines to specific budget accounts.
*   **Control**: Automated alerts when spending exceeds defined thresholds (75%, 90%, 100%).

---

## � Tech Stack & Architecture

### Frontend (Client)
*   **Core**: React 18, Vite (Fast build tool)
*   **Styling**: TailwindCSS 4, Lucide React (Icons)
*   **HTTP**: Axios (Centralized instance with Interceptors)
*   **Routing**: React Router DOM v6
*   **Pattern**: Component-based architecture with separated `layouts` and `pages`.

### Backend (Server)
*   **Runtime**: Node.js (v18+)
*   **Framework**: Express.js (REST API)
*   **Database**: PostgreSQL 15+
*   **ORM**: Prisma (Type-safe database access)
*   **Security**:
    *   `bcryptjs` for password hashing.
    *   `jsonwebtoken` (JWT) for stateless authentication.
    *   `helmet` & `cors` for API security.

### Architecture Flow
```mermaid
graph LR
    User[User] -->|Interacts| Client[React Client]
    Client -->|Axios JSON| API[Express API]
    API -->|Auth Middleware| Controller[Controllers]
    Controller -->|Prisma Client| DB[(PostgreSQL)]
```

---

## ✨ Key Features

### 🏢 Budget Management
*   **Multi-Level Budgets**: Create budgets spanning specific date ranges.
*   **Budget Lines**: Allocate funds to specific "Analytical Accounts" (Cost Centers).
*   **Revision Workflow**: Track changes to budgets (Original -> Revised) with audit trails.
*   **Smart Alerts**: System auto-generates alerts if actual spending > 90% of planned.

### 🛒 Purchase & Sales
*   **Purchase Orders (PO)**: Vendor management, product selection, and tax calculation.
*   **Vendor Bills**: Convert POs to Bills. Tracks payments and "Amount Due".
*   **Sales Orders (SO)**: Customer management for revenue tracking.
*   **Auto-Analytical Rules**: Automatically assign cost centers based on Product Category or Contact.

### 📊 Accounting & Analytics
*   **Analytical Accounts**: The heart of the system. Tracks income/expense for specific projects or departments.
*   **Financial Dashboard**: High-level view of Total Budget vs. Actual Spent.

---

## � Installation & Setup

### Prerequisites
*   Node.js (v18 or higher)
*   Docker & Docker Compose (Recommended for Database)
*   Git

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd shiv-furniture-erp
```

### Step 2: Start the Database (Docker)
We use Docker to run PostgreSQL and pgAdmin (optional) without installing them on your host.
```bash
# Start Postgres container in background
docker-compose up -d
```
*   *If not using Docker:* Ensure you have PostgreSQL running locally and create a DB named `shiv_furniture_db`.

### Step 3: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Setup Environment and Database
# 1. Generate Prisma Client
npx prisma generate

# 2. Push Schema to Database
npx prisma migrate dev --name init

# 3. Seed Database (Creates Admin User)
npx prisma db seed
```

### Step 4: Frontend Setup
```bash
# Open a new terminal
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

### Accessing the App
*   **Frontend**: `http://localhost:5173`
*   **Backend API**: `http://localhost:5001`
*   **Default Admin Login**:
    *   Email: `admin@shivfurniture.com`
    *   Password: `password123`

---

## 🔐 Environment Variables

The backend requires a `.env` file in `backend/.env`. A default one is provided, but here is the reference:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Connection string to PostgreSQL | `postgresql://user:pass@localhost:5432/db_name` |
| `PORT` | API Server Port | `5001` |
| `JWT_SECRET` | Secret key for signing tokens | `super-secret-key-change-this` |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |
| `CORS_ORIGIN` | Allowed Frontend URL | `http://localhost:3000` or `http://localhost:5173` |

---

## 🗄️ Database Schema (Key Models)

The system is built on relational integrity. Here are the core models:

1.  **User**: System access. Linked to a `Contact` for personal details.
2.  **Contact**: Unified model for Customers and Vendors.
3.  **Product**: Inventory items. Linked to `ProductCategory`.
4.  **AnalyticalAccount**: Logic container for grouping expenses/income.
5.  **Transactions**:
    *   `PurchaseOrder` ↔ `PurchaseOrderLine`
    *   `VendorBill` ↔ `VendorBillLine`

*For full schema source, see `backend/prisma/schema.prisma`.*

---

## 📡 API Documentation

All API responses follow a standard format:
```json
{
  "status": "success",
  "data": { ... },
  "message": "Optional message"
}
```

### Common Endpoints

#### Authentication
*   `POST /api/auth/login` - Returns JWT Token.
*   `POST /api/auth/register` - Create new portal user.

#### Products
*   `GET /api/products` - List with pagination.
*   `POST /api/products` - Create new product.
*   `GET /api/products/:id` - Get details.

#### Budgets
*   `GET /api/budgets` - List all budgets to track status.
*   `POST /api/budgets/revision` - Submit a budget change for approval.

---

## 📂 Project Structure

```text
/
├── backend/                # Server Application
│   ├── src/
│   │   ├── config/         # Env & DB connection
│   │   ├── controllers/    # Request Handlers (Logic)
│   │   ├── middleware/     # Auth & Validation
│   │   ├── routes/         # API Route Definitions
│   │   ├── services/       # Complex Business Logic
│   │   └── index.ts        # Entry Point
│   └── prisma/             # DB Schema & Seeding
│
├── client/                 # Client Application
│   ├── src/
│   │   ├── api/            # Axios Setup
│   │   ├── components/ui/  # Reusable UI (ListView, Cards)
│   │   ├── layouts/        # Admin Layout (Sidebar)
│   │   ├── pages/          # View Components
│   │   └── App.jsx         # Main Router
│   └── vite.config.js      # Build Config
│
└── docker/                 # Container Configs
```
