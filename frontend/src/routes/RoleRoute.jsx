import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
