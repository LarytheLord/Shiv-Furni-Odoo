-- Shiv Furniture Budget Accounting System
-- Database Initialization Script

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE shiv_furniture_db TO shiv_admin;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Shiv Furniture Database initialized successfully!';
END $$;
