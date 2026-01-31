# Shiv Furniture Budget Accounting System

A comprehensive PERN stack (PostgreSQL, Express.js, React.js, Node.js) Budget Accounting System for furniture business management.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with Admin/Portal user roles
- 👥 **Contact Management** - Customers and vendors with GSTIN support
- 📦 **Product Catalog** - Products with categories, pricing, and tax rates
- 💰 **Budget Management** - Cost center budgets with variance analysis
- 🔄 **Auto-Analytical Rules** - Automatic cost center assignment
- 📊 **Budget Alerts** - Threshold-based notifications (75%, 90%, 100%+)
- 🛒 **Purchase Flow** - Purchase Orders → Vendor Bills → Payments
- 🛍️ **Sales Flow** - Sales Orders → Customer Invoices → Payments
- 📄 **PDF Generation** - Professional invoices and budget reports
- 📈 **Dashboard** - Real-time budget utilization and activity feed

## Tech Stack

### Backend
- Node.js + Express.js
- TypeScript
- PostgreSQL with Prisma ORM
- JWT Authentication
- PDFKit for document generation

### Frontend (Coming Soon)
- React.js with Vite
- TypeScript
- Tailwind CSS (Dark theme with glassmorphism)
- Zustand for state management
- Recharts for visualizations

## Project Structure

```
shiv-budget-accounting/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Demo data seeder
│   ├── src/
│   │   ├── config/          # Database, CORS, env config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, role, validation
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript interfaces
│   │   ├── app.ts           # Express setup
│   │   └── index.ts         # Entry point
│   └── package.json
└── frontend/                # Coming soon
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

5. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

6. Seed the database (optional):
   ```bash
   npm run prisma:seed
   ```

7. Start development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

### Demo Credentials

After seeding the database:
- **Admin**: admin@shivfurniture.com / Admin@123
- **Portal**: portal@grandhotel.com / Portal@123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/password` - Update password

### Core Resources
- `/api/users` - User management (Admin only)
- `/api/contacts` - Customer/Vendor management
- `/api/products` - Product catalog
- `/api/analytical-accounts` - Cost centers
- `/api/auto-analytical-rules` - Auto-assignment rules

### Budget Management
- `/api/budgets` - Budget CRUD and metrics
- `/api/budget-revisions` - Revision workflow
- `/api/budget-alerts` - Alert management

### Purchase Flow
- `/api/purchase-orders` - Purchase orders
- `/api/vendor-bills` - Vendor bills
- `/api/bill-payments` - Bill payments

### Sales Flow
- `/api/sales-orders` - Sales orders
- `/api/customer-invoices` - Customer invoices
- `/api/invoice-payments` - Invoice payments

### Dashboard
- `/api/dashboard/summary` - Budget summary
- `/api/dashboard/stats` - System statistics
- `/api/dashboard/activity` - Recent activity

## License

MIT License
