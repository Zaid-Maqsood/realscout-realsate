import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { PageContextProvider } from './context/PageContextContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

// Layout
import AppShell from './components/layout/AppShell';
import GlobalChatWidget from './components/ai/GlobalChatWidget';

// Public pages
import Home from './pages/public/Home';
import Browse from './pages/public/Browse';
import PropertyDetail from './pages/public/PropertyDetail';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard';
import Properties from './pages/dashboard/Properties';
import MyProperties from './pages/dashboard/MyProperties';
import Leads from './pages/dashboard/Leads';
import LeadDetail from './pages/dashboard/LeadDetail';
import Analytics from './pages/dashboard/Analytics';
import Users from './pages/dashboard/Users';

function DashboardIndex() {
  const { user } = useAuth();
  if (user?.role === 'user') return <Navigate to="/dashboard/properties" replace />;
  return <Dashboard />;
}

export default function App() {
  return (
    <PageContextProvider>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Josefin Sans, sans-serif',
            fontSize: '14px',
            borderRadius: '12px',
            border: '1px solid #CCFBF1',
          },
          success: { iconTheme: { primary: '#16A34A', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardIndex />} />
          <Route path="properties" element={<Properties />} />
          <Route path="my-properties" element={<MyProperties />} />
          <Route
            path="leads"
            element={
              <RoleRoute roles={['admin', 'agent']}>
                <Leads />
              </RoleRoute>
            }
          />
          <Route
            path="leads/:id"
            element={
              <RoleRoute roles={['admin', 'agent']}>
                <LeadDetail />
              </RoleRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <RoleRoute roles={['admin', 'agent']}>
                <Analytics />
              </RoleRoute>
            }
          />
          <Route
            path="users"
            element={
              <RoleRoute roles={['admin']}>
                <Users />
              </RoleRoute>
            }
          />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <GlobalChatWidget />
    </AuthProvider>
    </PageContextProvider>
  );
}
