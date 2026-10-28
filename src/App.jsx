import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportProblem from './pages/ReportProblem';
import MyReports from './pages/MyReports';
import Profile from './pages/Profile';
import LostFound from './pages/LostFound';
import Admin from './pages/Admin';
import Staff from './pages/Staff';
import Chatbot from './pages/Chatbot';
import Notifications from './pages/Notifications';
function Guard({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading)
    return <div className="min-h-screen flex items-center justify-center">Loading Spotlyn...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role))
    return (
      <Navigate
        to={user.role === 'ADMIN' ? '/admin' : user.role === 'STAFF' ? '/staff' : '/dashboard'}
        replace
      />
    );
  return <Layout>{children}</Layout>;
}
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <Guard roles={['STUDENT']}>
            <Dashboard />
          </Guard>
        }
      />
      <Route
        path="/report-problem"
        element={
          <Guard roles={['STUDENT']}>
            <ReportProblem />
          </Guard>
        }
      />
      <Route
        path="/my-reports"
        element={
          <Guard roles={['STUDENT']}>
            <MyReports />
          </Guard>
        }
      />
      <Route
        path="/lost-item"
        element={
          <Guard roles={['STUDENT']}>
            <LostFound type="lost" />
          </Guard>
        }
      />
      <Route
        path="/found-item"
        element={
          <Guard roles={['STUDENT']}>
            <LostFound type="found" />
          </Guard>
        }
      />
      <Route
        path="/profile"
        element={
          <Guard>
            <Profile />
          </Guard>
        }
      />
      <Route
        path="/notifications"
        element={
          <Guard>
            <Notifications />
          </Guard>
        }
      />
      <Route
        path="/chatbot"
        element={
          <Guard>
            <Chatbot />
          </Guard>
        }
      />
      <Route
        path="/admin/*"
        element={
          <Guard roles={['ADMIN']}>
            <Admin />
          </Guard>
        }
      />
      <Route
        path="/staff"
        element={
          <Guard roles={['STAFF']}>
            <Staff />
          </Guard>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
