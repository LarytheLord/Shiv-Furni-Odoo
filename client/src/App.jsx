import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import PortalLayout from './layouts/PortalLayout';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/admin/Dashboard';

import Contacts from './pages/admin/Contacts';

import Products from './pages/admin/Products';

import AnalyticalAccounts from './pages/admin/AnalyticalAccounts';

import Budgets from './pages/admin/Budgets';

import Purchases from './pages/admin/Purchases';

import Bills from './pages/admin/Bills';

import Sales from './pages/admin/Sales';

import Invoices from './pages/admin/Invoices';

import Payments from './pages/admin/Payments';

import Analytics from './pages/admin/Analytics';

// Placeholder Pages
const Placeholder = ({ title }) => <h2 className="text-2xl font-bold p-4">{title}</h2>;

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <PrivateRoute roles={['admin']}>
            <AdminLayout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="products" element={<Products />} />
          <Route path="analytical-accounts" element={<AnalyticalAccounts />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="bills" element={<Bills />} />
          <Route path="sales" element={<Sales />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="payments" element={<Payments />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Portal Routes */}
        <Route path="/portal" element={
          <PrivateRoute roles={['customer', 'vendor']}>
            <PortalLayout />
          </PrivateRoute>
        }>
            <Route path="customer" element={<Placeholder title="Customer Dashboard" />} />
            <Route path="vendor" element={<Placeholder title="Vendor Dashboard" />} />
        </Route>

        <Route path="/" element={<Login />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
