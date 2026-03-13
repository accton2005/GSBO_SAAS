import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Courriers } from './pages/Courriers';
import { Registration } from './pages/Registration';
import { Login } from './pages/Login';
import { SuperAdmin } from './pages/SuperAdmin';
import { Settings } from './pages/Settings';
import { Users } from './pages/Users';
import { Archives } from './pages/Archives';
import { Stats } from './pages/Stats';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { user, organization } = useAuth();

  return (
    <Routes>
      <Route path="/register" element={<Registration />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout role={user?.role || 'viewer'} orgName={organization?.name}>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/entrants" element={
        <ProtectedRoute>
          <Layout role={user?.role || 'viewer'} orgName={organization?.name}>
            <Courriers type="entrant" />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/sortants" element={
        <ProtectedRoute>
          <Layout role={user?.role || 'viewer'} orgName={organization?.name}>
            <Courriers type="sortant" />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout role={user?.role || 'viewer'} orgName={organization?.name}>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/stats" element={
        <ProtectedRoute>
          <Layout role={user?.role || 'viewer'} orgName={organization?.name}>
            <Stats />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/archives" element={
        <ProtectedRoute>
          <Layout role={user?.role || 'viewer'} orgName={organization?.name}>
            <Archives />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute>
          <Layout role={user?.role || 'viewer'} orgName={organization?.name}>
            <Users />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/saas-admin" element={
        <ProtectedRoute>
          {user?.role === 'superadmin' ? (
            <Layout role="superadmin">
              <SuperAdmin />
            </Layout>
          ) : (
            <Navigate to="/" replace />
          )}
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
