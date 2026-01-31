const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/analytical-accounts', require('./routes/analyticalAccountRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/auto-analytical-rules', require('./routes/autoAnalyticalRoutes'));
app.use('/api/purchases', require('./routes/purchaseRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Shiv Furniture API is running...' });
});

module.exports = app;
