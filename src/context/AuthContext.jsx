import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Roles del sistema:
//  veterinario — profesional con matrícula, puede ser asignado a sesiones
//  productor   — dueño de establecimiento, gestiona miembros e invitaciones
//  otros       — peón u otro trabajador, acceso completo de solo-lectura/trabajo
const USUARIOS_MOCK = [
  {
    id: 1,
    nombre: 'Dr. Carlos Ramírez',
    email: 'vet@vetrural.com',
    password: '1234',
    rol: 'veterinario',
    matricula: 'MV-12345',
    plan: 'Pro',
  },
  {
    id: 2,
    nombre: 'Juan Pereyra',
    email: 'productor@campo.com',
    password: '1234',
    rol: 'productor',
    plan: 'Básico',
  },
  {
    id: 3,
    nombre: 'Pedro Martínez',
    email: 'peon@campo.com',
    password: '1234',
    rol: 'otros',
    plan: 'Básico',
  },
];

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('vetrural_usuario');
    if (stored) setUsuario(JSON.parse(stored));
    setCargando(false);
  }, []);

  const login = (email, password) => {
    const found = USUARIOS_MOCK.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Credenciales incorrectas');
    const { password: _, ...userData } = found;
    setUsuario(userData);
    localStorage.setItem('vetrural_usuario', JSON.stringify(userData));
    localStorage.setItem('vetrural_token', 'mock-jwt-' + userData.id);
    return userData;
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('vetrural_usuario');
    localStorage.removeItem('vetrural_token');
  };

  const tieneRol = (...roles) => usuario && roles.includes(usuario.rol);

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando, tieneRol }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
