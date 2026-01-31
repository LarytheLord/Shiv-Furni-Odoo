-- Users for Authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'customer', 'vendor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts (Customers/Vendors)
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('customer', 'vendor', 'both')),
    email VARCHAR(255),
    phone VARCHAR(50),
    portal_access BOOLEAN DEFAULT FALSE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL, -- Linked portal user
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    selling_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax_percentage DECIMAL(5, 2) DEFAULT 0
);

-- Analytical Accounts (Cost Centers)
CREATE TABLE IF NOT EXISTS analytical_accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    analytical_account_id INT REFERENCES analytical_accounts(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budget Revisions (Audit Trail)
CREATE TABLE IF NOT EXISTS budget_revisions (
    id SERIAL PRIMARY KEY,
    budget_id INT REFERENCES budgets(id) ON DELETE CASCADE,
    old_amount DECIMAL(12, 2),
    new_amount DECIMAL(12, 2),
    reason TEXT,
    changed_by INT REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auto Analytical Rules
CREATE TABLE IF NOT EXISTS auto_analytical_rules (
    id SERIAL PRIMARY KEY,
    priority INT DEFAULT 10,
    field_name VARCHAR(100) NOT NULL, -- e.g., 'product_category'
    operator VARCHAR(20) NOT NULL, -- e.g., '=', 'ILIKE'
    value VARCHAR(255) NOT NULL,
    analytical_account_id INT REFERENCES analytical_accounts(id) ON DELETE CASCADE
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    vendor_id INT REFERENCES contacts(id),
    order_date DATE DEFAULT CURRENT_DATE,
    state VARCHAR(50) DEFAULT 'draft', -- draft, confirmed, done, cancelled
    total_amount DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_order_lines (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    description VARCHAR(255),
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(12, 2) NOT NULL,
    analytical_account_id INT REFERENCES analytical_accounts(id)
);

-- Vendor Bills
CREATE TABLE IF NOT EXISTS vendor_bills (
    id SERIAL PRIMARY KEY,
    purchase_order_id INT REFERENCES purchase_orders(id),
    vendor_id INT REFERENCES contacts(id),
    bill_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    state VARCHAR(50) DEFAULT 'draft', -- draft, posted, paid
    total_amount DECIMAL(12, 2) DEFAULT 0,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'not_paid', -- not_paid, partial, paid
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendor_bill_lines (
    id SERIAL PRIMARY KEY,
    bill_id INT REFERENCES vendor_bills(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    description VARCHAR(255),
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(12, 2) NOT NULL,
    analytical_account_id INT REFERENCES analytical_accounts(id)
);

-- Sales Orders
CREATE TABLE IF NOT EXISTS sales_orders (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES contacts(id),
    order_date DATE DEFAULT CURRENT_DATE,
    state VARCHAR(50) DEFAULT 'draft',
    total_amount DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_order_lines (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    description VARCHAR(255),
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(12, 2) NOT NULL,
    analytical_account_id INT REFERENCES analytical_accounts(id)
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    sales_order_id INT REFERENCES sales_orders(id),
    customer_id INT REFERENCES contacts(id),
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    state VARCHAR(50) DEFAULT 'draft',
    total_amount DECIMAL(12, 2) DEFAULT 0,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'not_paid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_lines (
    id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES invoices(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    description VARCHAR(255),
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(12, 2) NOT NULL,
    analytical_account_id INT REFERENCES analytical_accounts(id)
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('inbound', 'outbound')), -- inbound (customer pays), outbound (pay vendor)
    partner_id INT REFERENCES contacts(id),
    amount DECIMAL(12, 2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    reference VARCHAR(100),
    invoice_id INT REFERENCES invoices(id), -- If paying an invoice
    bill_id INT REFERENCES vendor_bills(id), -- If paying a bill
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
