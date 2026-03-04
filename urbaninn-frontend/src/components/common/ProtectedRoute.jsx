import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace/>;
  }

  // wrong role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // redirect to their correct dashboard
    if (user.role === 'SUPER_ADMIN')
      return <Navigate to="/superadmin/dashboard" replace/>;
    if (user.role === 'HOTEL_ADMIN')
      return <Navigate to="/admin/dashboard" replace/>;
    if (user.role === 'RECEPTIONIST')
      return <Navigate to="/receptionist/dashboard" replace/>;
    if (user.role === 'KITCHEN_STAFF')
      return <Navigate to="/kitchen/dashboard" replace/>;
    if (user.role === 'GUEST')
      return <Navigate to="/guest/home" replace/>;
    return <Navigate to="/login" replace/>;
  }

  return children;
};

export default ProtectedRoute;