import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#94a3b8' }}>
        <p>Loading Operations Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-wrapper">
          <Header />
          <div className="content-area">
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <h2 style={{ color: '#ef4444', marginBottom: '12px' }}>Access Restricted (HTTP 403)</h2>
              <p style={{ color: '#94a3b8' }}>
                Your current role (<strong>{user?.role}</strong>) does not have sufficient permissions to view this section.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
