import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Layouts & Pages
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import Colleges from './pages/Colleges';
import FollowUps from './pages/FollowUps';
import Team from './pages/Team';
import Settings from './pages/Settings';
import AuditTrail from './pages/AuditTrail';

// Temporary placeholders for other pages
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-[60vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
    <h1 className="text-2xl font-bold text-slate-400 dark:text-slate-600">{title} Component Pending</h1>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null; // Let the AuthProvider handle the loading screen
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="leads" element={<Leads />} />
              <Route path="leads/:id" element={<LeadDetails />} />
              <Route path="colleges" element={<Colleges />} />
              <Route path="followups" element={<FollowUps />} />
              <Route path="users" element={<Team />} />
              <Route path="audit" element={<AuditTrail />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
