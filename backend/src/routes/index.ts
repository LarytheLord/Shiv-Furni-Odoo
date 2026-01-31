import { Router } from 'express';

import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import contactRoutes from './contactRoutes';
import productRoutes from './productRoutes';
import analyticalAccountRoutes from './analyticalAccountRoutes';
import autoAnalyticalRuleRoutes from './autoAnalyticalRuleRoutes';
import budgetRoutes from './budgetRoutes';
import budgetRevisionRoutes from './budgetRevisionRoutes';
import budgetAlertRoutes from './budgetAlertRoutes';
import purchaseOrderRoutes from './purchaseOrderRoutes';
import vendorBillRoutes from './vendorBillRoutes';
import billPaymentRoutes from './billPaymentRoutes';
import salesOrderRoutes from './salesOrderRoutes';
import customerInvoiceRoutes from './customerInvoiceRoutes';
import invoicePaymentRoutes from './invoicePaymentRoutes';
import dashboardRoutes from './dashboardRoutes';

const router = Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/contacts', contactRoutes);
router.use('/products', productRoutes);
router.use('/analytical-accounts', analyticalAccountRoutes);
router.use('/auto-analytical-rules', autoAnalyticalRuleRoutes);
router.use('/budgets', budgetRoutes);
router.use('/budget-revisions', budgetRevisionRoutes);
router.use('/budget-alerts', budgetAlertRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/vendor-bills', vendorBillRoutes);
router.use('/bill-payments', billPaymentRoutes);
router.use('/sales-orders', salesOrderRoutes);
router.use('/customer-invoices', customerInvoiceRoutes);
router.use('/invoice-payments', invoicePaymentRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
