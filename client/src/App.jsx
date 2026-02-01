import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import AdminLayout from './layouts/AdminLayout';
import PortalLayout from './layouts/PortalLayout';
import PrivateRoute from './components/PrivateRoute';
import NotFound from './pages/NotFound';
import Dashboard from './pages/admin/Dashboard';

import Contacts from './pages/admin/Contacts';

import Products from './pages/admin/Products';

import BudgetList from './pages/admin/budgets/BudgetList';
import BudgetForm from './pages/admin/budgets/BudgetForm';

import PurchaseOrderList from './pages/admin/purchase/PurchaseOrderList';
import PurchaseOrderForm from './pages/admin/purchase/PurchaseOrderForm';
import VendorBillList from './pages/admin/purchase/VendorBillList';
import VendorBillForm from './pages/admin/purchase/VendorBillForm';

import SalesOrderList from './pages/admin/sales/SalesOrderList';
import SalesOrderForm from './pages/admin/sales/SalesOrderForm';
import InvoiceList from './pages/admin/sales/InvoiceList';
import InvoiceForm from './pages/admin/sales/InvoiceForm';

import Payments from './pages/admin/Payments';

import AnalyticAccountList from './pages/admin/analytics/AnalyticAccountList';
import AnalyticAccountForm from './pages/admin/analytics/AnalyticAccountForm';
import AutoModelList from './pages/admin/analytics/AutoModelList';
import AutoModelForm from './pages/admin/analytics/AutoModelForm';

import Users from './pages/admin/Users';
import PortalDashboard from './pages/portal/PortalDashboard';

// Customer Pages
import CustomerOrders from './pages/portal/customer/CustomerOrders';
import CustomerOrderDetails from './pages/portal/customer/CustomerOrderDetails';
import CustomerInvoices from './pages/portal/customer/CustomerInvoices';
import CustomerInvoiceDetails from './pages/portal/customer/CustomerInvoiceDetails';

// Vendor Pages
import VendorOrders from './pages/portal/vendor/VendorOrders';
import VendorOrderDetails from './pages/portal/vendor/VendorOrderDetails';
import VendorBills from './pages/portal/vendor/VendorBills';
import VendorBillDetails from './pages/portal/vendor/VendorBillDetails';

// Placeholder Pages
const Placeholder = ({ title }) => (
  <h2 className='text-2xl font-bold p-4 text-slate-700'>{title}</h2>
);

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />

        {/* Admin Routes */}
        <Route
          path='/admin'
          element={
            <PrivateRoute roles={['admin']}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path='contacts' element={<Contacts />} />
          <Route path='products' element={<Products />} />

          {/* Budget Module */}
          <Route path='budgets' element={<BudgetList />} />
          <Route path='budgets/:id' element={<BudgetForm />} />

          {/* Purchase Module */}
          <Route path='purchase-orders' element={<PurchaseOrderList />} />
          <Route path='purchase-orders/:id' element={<PurchaseOrderForm />} />
          <Route path='bills' element={<VendorBillList />} />
          <Route path='bills/:id' element={<VendorBillForm />} />
          <Route path='payments' element={<Payments />} />

          {/* Sales Module */}
          <Route path='sales-orders' element={<SalesOrderList />} />
          <Route path='sales-orders/:id' element={<SalesOrderForm />} />
          <Route path='invoices' element={<InvoiceList />} />
          <Route path='invoices/:id' element={<InvoiceForm />} />
          <Route path='receipts' element={<Placeholder title="Receipts" />} />

          {/* Analytics Module */}
          <Route path='analytics' element={<AnalyticAccountList />} />
          <Route path='analytics/:id' element={<AnalyticAccountForm />} />

          <Route path='analytical-models' element={<AutoModelList />} />
          <Route path='analytical-models/:id' element={<AutoModelForm />} />

          <Route path='users' element={<Users />} />
        </Route>

        {/* Portal Routes */}
        <Route
          path='/portal'
          element={
            <PrivateRoute roles={['customer', 'vendor']}>
              <PortalLayout />
            </PrivateRoute>
          }
        >

          {/* Customer Routes */}
          <Route path='customer' element={<PortalDashboard />} />
          <Route path='customer/orders' element={<CustomerOrders />} />
          <Route path='customer/orders/:id' element={<CustomerOrderDetails />} />
          <Route path='customer/invoices' element={<CustomerInvoices />} />
          <Route path='customer/invoices/:id' element={<CustomerInvoiceDetails />} />

          {/* Vendor Routes */}
          <Route path='vendor' element={<PortalDashboard />} />
          <Route path='vendor/orders' element={<VendorOrders />} />
          <Route path='vendor/orders/:id' element={<VendorOrderDetails />} />
          <Route path='vendor/bills' element={<VendorBills />} />
          <Route path='vendor/bills/:id' element={<VendorBillDetails />} />
        </Route>

        <Route path='/' element={<Login />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
