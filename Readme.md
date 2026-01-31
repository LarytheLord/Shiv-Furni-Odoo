# Shiv Furniture Budget Accounting System

A comprehensive PERN stack (PostgreSQL, Express.js, React.js, Node.js) Budget Accounting System designed for Shiv Furniture.

## 🎯 Project Status

**Current Phase:** Docker & Database Setup Complete ✅

### Completed
- ✅ Backend foundation (config, middleware, services)
- ✅ All controllers and routes
- ✅ Prisma schema with 20+ models
- ✅ Database seed file with demo data
- ✅ Docker setup for PostgreSQL

### In Progress
- 🔄 Documentation

### Note
- 🚧 Frontend development is being handled by the frontend team.

## 🐳 Quick Start with Docker

```bash
# 1. Clone the repository
git clone https://github.com/LarytheLord/Shiv-Furni-Odoo.git
cd shiv-budget-accounting

# 2. Start PostgreSQL with Docker
docker-compose up -d postgres

# 3. Setup backend
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# 4. Start the server
npm run dev
```

**Or use the setup script:**
```bash
./scripts/setup-db.sh
```

## 📋 Features

### Core Modules
- **User Management** - Admin and portal user roles with authentication
- **Contact Management** - Customers and vendors with full CRUD
- **Product Management** - Products and categories with pricing
- **Analytical Accounts** - Cost center tracking and budget allocation
- **Auto-Analytical Rules** - Automatic cost center assignment based on configurable rules
- **Budget Management** - Multi-line budgets with real-time tracking
- **Budget Revisions** - Approval workflow for budget changes
- **Budget Alerts** - Automatic threshold-based alerts (75%, 90%, 100%+)
- **Purchase Orders** - Complete purchase workflow
- **Vendor Bills** - Bill management with payment tracking
- **Sales Orders** - Sales order processing
- **Customer Invoices** - Invoice generation with PDF export
- **Payments** - Payment recording for both bills and invoices
- **Dashboard** - Real-time budget metrics and activity overview

## 🏗️ Tech Stack

### Backend
- **Node.js** + **TypeScript**
- **Express.js** - Web framework
- **Prisma** - ORM for PostgreSQL
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **PDFKit** - PDF generation
- **express-validator** - Request validation

### Frontend (Coming Soon)
- **React** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling with dark theme
- **Zustand** - State management
- **Axios** - API client

### Database
- **PostgreSQL** - Primary database

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/LarytheLord/Shiv-Furni-Odoo.git
   cd shiv-budget-accounting/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run migrations**
   ```bash
   npm run prisma:migrate
   ```

5. **Seed database**
   ```bash
   npm run prisma:seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

The backend API will be available at `http://localhost:5000`

### Default Credentials

After seeding, use these credentials to login:

**Admin User:**
- Email: `admin@shivfurniture.com`
- Password: `Admin@123`

**Portal User:**
- Email: `portal@grandhotel.com`
- Password: `Portal@123`

## 📁 Project Structure

```
shiv-budget-accounting/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Seed data
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   ├── app.ts             # Express app setup
│   │   └── index.ts           # Entry point
│   ├── package.json
│   └── tsconfig.json
└── frontend/                  # Coming soon
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/password` - Update password

### Budgets
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets/:id` - Get budget details
- `GET /api/budgets/:id/metrics` - Get budget metrics
- `POST /api/budgets/:id/confirm` - Confirm budget
- `GET /api/budgets/:id/export-pdf` - Export budget as PDF

### Purchase Flow
- `POST /api/purchase-orders` - Create PO
- `POST /api/purchase-orders/:id/create-bill` - Convert to vendor bill
- `POST /api/vendor-bills/:id/confirm` - Confirm bill
- `POST /api/bill-payments` - Record payment

### Sales Flow
- `POST /api/sales-orders` - Create SO
- `POST /api/sales-orders/:id/create-invoice` - Convert to invoice
- `POST /api/customer-invoices/:id/confirm` - Confirm invoice
- `POST /api/invoice-payments` - Record payment

*See full API documentation for complete endpoint list*

## 🎨 Key Features

### Auto-Analytical Assignment
Automatically assigns cost centers to transaction lines based on:
- Product or product category
- Contact (customer/vendor)
- Amount range
- Date range
- Transaction type (purchase/sale)

### Budget Tracking
- Real-time practical vs planned amount tracking
- Theoretical amount based on time elapsed
- Achievement percentage calculation
- Variance analysis
- Period-based projections

### Alert System
Automatic alerts when budget utilization reaches:
- 75% (Warning)
- 90% (High)
- 100% (Critical)
- Underutilization detection

### PDF Generation
Professional PDF documents for:
- Customer invoices
- Vendor bills
- Budget reports

## 👥 Contributing

This is a private project for Shiv Furniture. Contact the administrators for contribution guidelines.

## 📄 License

Proprietary - All rights reserved

## 📞 Support

For support and queries, contact the development team.

---

**Built with ❤️ for Shiv Furniture**
