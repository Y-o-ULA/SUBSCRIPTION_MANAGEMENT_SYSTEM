import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import Login          from './pages/Login';
import Dashboard      from './pages/admin/Dashboard';
import Products       from './pages/admin/Products';
import Plans          from './pages/admin/Plans';
import Subscriptions  from './pages/admin/Subscriptions';
import Invoices       from './pages/admin/Invoices';
import Payments       from './pages/admin/Payments';
import Discounts      from './pages/admin/Discounts';
import BillingRun     from './pages/admin/BillingRun';
import Portal         from './pages/customer/Portal';
import InvoiceView    from './pages/customer/InvoiceView';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Customer-facing (public or light-auth) */}
          <Route path="/portal"               element={<Portal />} />
          <Route path="/portal/invoice/:id"   element={<InvoiceView />} />

          {/* Admin (protected) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/"               element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"      element={<Dashboard />} />
            <Route path="/products"       element={<Products />} />
            <Route path="/plans"          element={<Plans />} />
            <Route path="/subscriptions"  element={<Subscriptions />} />
            <Route path="/invoices"       element={<Invoices />} />
            <Route path="/payments"       element={<Payments />} />
            <Route path="/discounts"      element={<Discounts />} />
            <Route path="/billing-run"    element={<BillingRun />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
