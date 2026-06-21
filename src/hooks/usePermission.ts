import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

export const usePermission = () => {
  const { user } = useAuth();
  
  const hasRole = (roles: UserRole[]) => {
    return !!user && roles.includes(user.role);
  };

  const isSuperAdmin = () => user?.role === 'super_admin';
  const isSchoolAdmin = () => user?.role === 'school_admin';
  const isTeacher = () => user?.role === 'teacher';
  const isStudent = () => user?.role === 'student';

  return { 
    hasRole, 
    isSuperAdmin, 
    isSchoolAdmin, 
    isTeacher, 
    isStudent,
    currentRole: user?.role || null,
    schoolId: user?.school_id || null
  };
};
