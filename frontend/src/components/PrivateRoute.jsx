import React from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    // Not authenticated, redirect to login
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Authenticated but not authorized for this role, redirect to appropriate dashboard or home
    if (userRole === 'User') return <Navigate to="/user" replace />;
    if (userRole === 'Analyst') return <Navigate to="/analyst" replace />;
    if (userRole === 'IT') return <Navigate to="/it" replace />;
    return <Navigate to="/" replace />; // Fallback
  }

  // Authenticated and authorized, render the layout with the children
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default PrivateRoute;