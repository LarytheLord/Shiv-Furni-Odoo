import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for role match or if it's a PORTAL_USER with a matching contactType
  const userRole = user.role?.toLowerCase();
  const allowedRoles = roles ? roles.map(r => r.toLowerCase()) : [];
  
  const hasPermission = 
    allowedRoles.includes(userRole) || 
    (userRole === 'portal_user' && user.contactType && allowedRoles.includes(user.contactType.toLowerCase()));

  if (roles && !hasPermission) {
    return <Navigate to="/" replace />; // Or unauthorized page
  }

  return children;
}
