import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EstablecimientoProvider } from './context/EstablecimientoContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import Animales       from './pages/Animales';
import NuevoAnimal    from './pages/NuevoAnimal';
import DetalleAnimal  from './pages/DetalleAnimal';
import EditarAnimal   from './pages/EditarAnimal';
import ComenzarSesion from './pages/ComenzarSesion';
import SesionAnimal   from './pages/SesionAnimal';
import SesionRegistro from './pages/SesionRegistro';
import SesionResumen  from './pages/SesionResumen';
import Historial      from './pages/Historial';
import Metricas       from './pages/Metricas';
import Partes         from './pages/Partes';
import Miembros       from './pages/Miembros';

const TODOS = ['veterinario', 'productor', 'otros'];

export default function App() {
  return (
    <AuthProvider>
      <EstablecimientoProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* ── Funcionalidades compartidas por los 3 roles ── */}
            <Route element={<PrivateRoute roles={TODOS} />}>
              <Route element={<Layout />}>
                <Route path="/dashboard"             element={<Dashboard />} />
                <Route path="/animales"              element={<Animales />} />
                <Route path="/animales/nuevo"        element={<NuevoAnimal />} />
                <Route path="/animales/:id"          element={<DetalleAnimal />} />
                <Route path="/animales/:id/editar"   element={<EditarAnimal />} />
                <Route path="/sesion"                element={<ComenzarSesion />} />
                <Route path="/sesion/animal"         element={<SesionAnimal />} />
                <Route path="/sesion/registro"       element={<SesionRegistro />} />
                <Route path="/sesion/resumen"        element={<SesionResumen />} />
                <Route path="/historial"             element={<Historial />} />
                <Route path="/metricas"              element={<Metricas />} />
                <Route path="/partes"                element={<Partes />} />
              </Route>
            </Route>

            {/* ── Exclusivas del Productor Agropecuario ── */}
            <Route element={<PrivateRoute roles={['productor']} />}>
              <Route element={<Layout />}>
                <Route path="/miembros" element={<Miembros />} />
              </Route>
            </Route>

            <Route path="/"  element={<Navigate to="/login" replace />} />
            <Route path="*"  element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </EstablecimientoProvider>
    </AuthProvider>
  );
}
