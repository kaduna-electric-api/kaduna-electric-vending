import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Navbar from './components/ui/Navbar';
import Loading from './components/ui/Loading';
import Toast from './components/ui/Toast';

// Auth pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';

// Main pages
import Dashboard from './components/dashboard/Dashboard';
import MeterManager from './components/meters/MeterManager';
import BuyToken from './components/payment/BuyToken';
import PaymentCallback from './components/payment/PaymentCallback';
import TokenHistory from './components/tokens/TokenHistory';
import Receipt from './components/tokens/Receipt';

// Admin
import AdminDashboard from './components/admin/AdminDashboard';

// Protected Route wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/meters" element={
            <ProtectedRoute><MeterManager /></ProtectedRoute>
          } />
          <Route path="/buy-token" element={
            <ProtectedRoute><BuyToken /></ProtectedRoute>
          } />
          <Route path="/payment/verify" element={
            <ProtectedRoute><PaymentCallback /></ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute><TokenHistory /></ProtectedRoute>
          } />
          <Route path="/receipt/:id" element={
            <ProtectedRoute><Receipt /></ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      <Toast />
    </div>
  );
}

export default App;
