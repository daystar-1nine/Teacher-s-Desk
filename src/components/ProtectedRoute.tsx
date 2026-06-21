import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

export const RequireAuth: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F4F1EA]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1E3F20] border-t-transparent"></div>
          <p className="text-sm font-semibold text-[#2C3E35]">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to public login or admin login depending on the path
    const isAdminPath = location.pathname.startsWith('/admin');
    return <Navigate to={isAdminPath ? '/admin/login' : '/login'} state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

interface RequireRoleProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F4F1EA]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1E3F20] border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to default unauthorized screen or dashboard
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const RequireSchoolAdmin: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <RequireRole allowedRoles={['school_admin', 'super_admin']}>{children}</RequireRole>;
};

export const RequireAdmin: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <RequireRole allowedRoles={['super_admin']}>{children}</RequireRole>;
};
