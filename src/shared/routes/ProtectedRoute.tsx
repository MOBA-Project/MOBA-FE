import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthed } from 'shared/auth/token';

const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  if (!isAuthed()) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;

