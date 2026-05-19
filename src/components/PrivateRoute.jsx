import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function PrivateRoute({ roles }) {
  const { usuario, cargando } = useAuth();

  if (cargando) return <LoadingSpinner texto="Verificando sesión..." />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
